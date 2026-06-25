// Research agent — TypeScript.
// An `agent()` from @llamaindex/workflow with three tools.

import "dotenv/config";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { Settings, VectorStoreIndex, tool } from "llamaindex";
import { agent } from "@llamaindex/workflow";
import { SimpleDirectoryReader } from "@llamaindex/readers/directory";
import { anthropic } from "@llamaindex/anthropic";
import { openai } from "@llamaindex/openai";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "..", "data");

Settings.llm = anthropic({ model: "claude-sonnet-4-6", maxTokens: 2048 });
Settings.embedModel = openai({ model: "text-embedding-3-small" });

// --- Tool 1: RAG over internal financial docs -----------------------------

const documents = await new SimpleDirectoryReader().loadData({
  directoryPath: DATA_DIR,
});
const index = await VectorStoreIndex.fromDocuments(documents);
const queryEngine = index.asQueryEngine({ similarityTopK: 2 });

const internalFinancialsQuery = tool({
  name: "internal_financials_query",
  description:
    "Search Acme's internal financial filings. Use for questions about Acme's own revenue, segments, or geography.",
  parameters: z.object({
    question: z.string().describe("Natural-language question about Acme's financials"),
  }),
  execute: async ({ question }) => {
    const r = await queryEngine.query({ query: question });
    return r.message.content;
  },
});

// --- Tool 2: web search (stubbed) -----------------------------------------

const STUB_WEB: Record<string, string> = {
  "apple q3 2025 revenue":
    "Apple Inc. reported Q3 2025 (fiscal quarter ended June 28, 2025) revenue of $94.93 billion, up 10% year-over-year. Source: Apple Press Release.",
};

const webSearch = tool({
  name: "web_search",
  description: "Search the public web. Returns a short text summary of top hits.",
  parameters: z.object({
    query: z.string(),
  }),
  execute: async ({ query }) => {
    const key = query.toLowerCase().trim();
    for (const k of Object.keys(STUB_WEB)) {
      if (key.includes(k) || k.includes(key)) return STUB_WEB[k];
    }
    return `[stub] No canned result for query: ${JSON.stringify(query)}. Wire a real provider here.`;
  },
});

// --- Tool 3: calculator (safe expression eval) ----------------------------
// Allow only digits, whitespace, parens, decimal points, exponent notation,
// and the operators + - * / % ** . Reject anything else.

function safeEval(expr: string): number {
  if (!/^[\s\d.+\-*/%()eE]+$/.test(expr)) {
    throw new Error(`Disallowed characters in expression: ${expr}`);
  }
  // eslint-disable-next-line no-new-func
  const value = Function(`"use strict"; return (${expr});`)();
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Expression did not evaluate to a finite number: ${expr}`);
  }
  return value;
}

const calculator = tool({
  name: "calculator",
  description:
    "Evaluate a basic arithmetic expression. Supports + - * / % ** and parens.",
  parameters: z.object({
    expression: z.string(),
  }),
  execute: async ({ expression }) => safeEval(expression),
});

// --- Agent ---------------------------------------------------------------

const myAgent = agent({
  tools: [internalFinancialsQuery, webSearch, calculator],
  llm: Settings.llm,
  systemPrompt:
    "You are a financial-research analyst. Use the tools provided to answer " +
    "the user's question. Cite the numbers you used and show the calculation.",
});

const task =
  "Compare our Q3 revenue from last year against Apple's most recent Q3 revenue. " +
  "By what percentage did Apple's exceed ours? Show your work.";

console.log(`task> ${task}\n`);
const result = await myAgent.run(task);
console.log(`\nfinal> ${result.data.result}`);
