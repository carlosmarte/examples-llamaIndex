// Structured invoice extraction — TypeScript.
// Binds Claude to a Zod schema via the LLM's `responseFormat` option so the
// returned content is guaranteed to parse into an `Invoice` object.

import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { anthropic } from "@llamaindex/anthropic";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(__dirname, "..", "data", "invoice_001.txt");

const LineItem = z.object({
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  amount: z.number(),
});

const Invoice = z.object({
  vendorName: z.string(),
  vendorTaxId: z.string().nullable().optional(),
  invoiceNumber: z.string(),
  invoiceDate: z.string().describe("ISO-8601 date, e.g. 2026-04-18"),
  dueDate: z.string().nullable().optional(),
  poNumber: z.string().nullable().optional(),
  lineItems: z.array(LineItem),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
});

const SYSTEM =
  "Extract invoice fields from the user-supplied invoice text. " +
  "Preserve currency amounts and signs exactly. Include discounts and " +
  "shipping as line items. Dates must be ISO-8601.";

async function main(): Promise<void> {
  const invoiceText = readFileSync(DATA_FILE, "utf8");
  const llm = anthropic({ model: "claude-sonnet-4-6", maxTokens: 2048 });

  const response = await llm.chat({
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: invoiceText },
    ],
    responseFormat: Invoice,
  });

  // When responseFormat is a Zod schema, content is the JSON string conforming to it.
  const parsed = Invoice.parse(JSON.parse(String(response.message.content)));
  console.log(JSON.stringify(parsed, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
