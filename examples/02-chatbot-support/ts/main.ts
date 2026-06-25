// Support chatbot with conversation memory — TypeScript.
// Uses ContextChatEngine: retrieves relevant chunks per turn and feeds them
// alongside the running chat history to Claude.

import "dotenv/config";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { Settings, VectorStoreIndex, ContextChatEngine } from "llamaindex";
import { SimpleDirectoryReader } from "@llamaindex/readers/directory";
import { anthropic } from "@llamaindex/anthropic";
import { openai } from "@llamaindex/openai";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "..", "data");

Settings.llm = anthropic({ model: "claude-sonnet-4-6", maxTokens: 1024 });
Settings.embedModel = openai({ model: "text-embedding-3-small" });

const SYSTEM_PROMPT =
  "You are a customer support assistant for Acme Networking. " +
  "Answer questions using only the provided context. " +
  "If the context does not contain the answer, say so plainly.";

async function main(): Promise<void> {
  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: DATA_DIR,
  });
  const index = await VectorStoreIndex.fromDocuments(documents);

  const retriever = index.asRetriever({ similarityTopK: 3 });
  const chatEngine = new ContextChatEngine({
    retriever,
    systemPrompt: SYSTEM_PROMPT,
  });

  const turns = [
    "How do I reset my Router X100?",
    "I did that but the power light is still blinking red.",
    "Is it still under warranty if I bought it 14 months ago?",
  ];

  for (const turn of turns) {
    console.log(`\nuser> ${turn}`);
    const response = await chatEngine.chat({ message: turn });
    console.log(`bot>  ${response.message.content}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
