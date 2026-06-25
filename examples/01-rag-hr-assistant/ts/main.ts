// RAG HR Assistant — TypeScript.
// Builds a VectorStoreIndex over ../data/*.md and answers a sample HR question.

import "dotenv/config";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import { Settings, VectorStoreIndex } from "llamaindex";
import { SimpleDirectoryReader } from "@llamaindex/readers/directory";
import { anthropic } from "@llamaindex/anthropic";
import { openai } from "@llamaindex/openai";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "..", "data");

Settings.llm = anthropic({ model: "claude-sonnet-4-6", maxTokens: 1024 });
Settings.embedModel = openai({ model: "text-embedding-3-small" });

async function main(): Promise<void> {
  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: DATA_DIR,
  });
  const index = await VectorStoreIndex.fromDocuments(documents);
  const queryEngine = index.asQueryEngine({ similarityTopK: 3 });

  const question =
    "What is the parental leave policy for an employee with 2 years of tenure? " +
    "How many weeks of paid leave do they get?";
  console.log(`Q: ${question}\n`);

  const response = await queryEngine.query({ query: question });
  console.log(`A: ${response.message.content}\n`);

  console.log("Sources:");
  for (const node of response.sourceNodes ?? []) {
    const name = (node.node.metadata as { file_name?: string }).file_name ?? "?";
    console.log(`  - ${name}  (score=${(node.score ?? 0).toFixed(3)})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
