// React component semantic search — TypeScript.
//
// 1. Parse each .tsx with @babel/parser, extract component name + props + JSDoc.
// 2. Call Claude (bound to a Zod schema) to extract semantic metadata.
// 3. Index the (code + metadata description) blob in a VectorStoreIndex.
// 4. Run a sample natural-language query.

import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

import { Settings, VectorStoreIndex, Document } from "llamaindex";
import { anthropic } from "@llamaindex/anthropic";
import { openai } from "@llamaindex/openai";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "..", "data");

Settings.llm = anthropic({ model: "claude-sonnet-4-6", maxTokens: 1024 });
Settings.embedModel = openai({ model: "text-embedding-3-small" });

// --- Phase 1: AST parse ---------------------------------------------------

interface ParsedComponent {
  filePath: string;
  componentName: string;
  jsDoc: string;
  propsSnippet: string;
  sourceCode: string;
}

function parseComponent(filePath: string): ParsedComponent | null {
  const sourceCode = readFileSync(filePath, "utf8");
  const ast = parse(sourceCode, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  let componentName: string | null = null;
  let jsDoc = "";
  let propsSnippet = "";

  traverse(ast, {
    ExportNamedDeclaration(path) {
      const decl = path.node.declaration;
      if (decl?.type === "FunctionDeclaration" && decl.id?.name) {
        if (!componentName) {
          componentName = decl.id.name;
          const leading = path.node.leadingComments?.find((c) => c.type === "CommentBlock");
          if (leading) jsDoc = leading.value.replace(/^\s*\*\s?/gm, "").trim();
        }
      }
      if (decl?.type === "TSInterfaceDeclaration" && decl.id.name.endsWith("Props")) {
        propsSnippet = sourceCode.slice(decl.start ?? 0, decl.end ?? 0);
      }
    },
  });

  if (!componentName) return null;
  return { filePath, componentName, jsDoc, propsSnippet, sourceCode };
}

// --- Phase 2: structured metadata extraction ------------------------------

const ComponentMetadata = z.object({
  componentName: z.string(),
  description: z.string().describe("One-sentence semantic description of what the component does."),
  capabilityTags: z
    .array(z.string())
    .describe("3-8 lowercase tags describing capabilities and intents, e.g. 'form-submit', 'biometric-auth', 'side-navigation'."),
  designCompliance: z.enum(["High", "Medium", "Low"]),
  isClientComponent: z.boolean(),
  importPath: z.string().describe("Suggested import path, e.g. '@ui/auth'."),
});

type ComponentMetadata = z.infer<typeof ComponentMetadata>;

async function extractMetadata(p: ParsedComponent): Promise<ComponentMetadata> {
  const llm = Settings.llm;
  const response = await llm.chat({
    messages: [
      {
        role: "system",
        content:
          "Extract structured metadata for the React component below. " +
          "Tags should describe intent (what a developer would search for), not implementation.",
      },
      {
        role: "user",
        content:
          `// File: ${basename(p.filePath)}\n` +
          `// JSDoc:\n${p.jsDoc}\n\n` +
          `// Props:\n${p.propsSnippet}\n\n` +
          `// Source:\n${p.sourceCode}`,
      },
    ],
    responseFormat: ComponentMetadata,
  });
  return ComponentMetadata.parse(JSON.parse(String(response.message.content)));
}

// --- Phase 3 + 4: index + query ------------------------------------------

async function main(): Promise<void> {
  const files = readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => resolve(DATA_DIR, f));

  const parsed = files.map(parseComponent).filter((p): p is ParsedComponent => p !== null);
  console.log(`Parsed ${parsed.length} components.`);

  const documents: Document[] = [];
  for (const p of parsed) {
    const meta = await extractMetadata(p);
    console.log(`  - ${meta.componentName}: ${meta.capabilityTags.join(", ")}`);
    const text =
      `Component: ${meta.componentName}\n` +
      `Description: ${meta.description}\n` +
      `Tags: ${meta.capabilityTags.join(", ")}\n\n` +
      `JSDoc:\n${p.jsDoc}\n\n` +
      `Source:\n${p.sourceCode}`;
    documents.push(
      new Document({
        text,
        metadata: {
          componentName: meta.componentName,
          designCompliance: meta.designCompliance,
          isClientComponent: meta.isClientComponent,
          importPath: meta.importPath,
          capabilityTags: meta.capabilityTags.join(","),
          filePath: p.filePath,
        },
      }),
    );
  }

  const index = await VectorStoreIndex.fromDocuments(documents);
  const queryEngine = index.asQueryEngine({ similarityTopK: 2 });

  const query =
    "I need a secure button for a login form that triggers a biometric hardware check.";
  console.log(`\nquery> ${query}`);

  const response = await queryEngine.query({ query });
  console.log(`\nanswer> ${response.message.content}`);

  console.log("\nmatched components:");
  for (const node of response.sourceNodes ?? []) {
    const meta = node.node.metadata as Record<string, unknown>;
    console.log(`  - ${meta.componentName}  (compliance=${meta.designCompliance}, import=${meta.importPath})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
