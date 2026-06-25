# 03 — Structured Invoice Extraction

Parses messy free-form invoice text into a strictly-typed schema. The LLM is bound to the schema so it must return exactly the fields you ask for.

## What it shows

- **Python**: `LLM.as_structured_llm(Pydantic)` — Anthropic Claude returns a validated `Invoice` instance
- **TypeScript**: `Settings.llm.chat({ responseFormat: ZodSchema })` — Zod-validated `Invoice` instance
- Schema: vendor, invoice number, date, line items, subtotal, tax, total

The sample data is one synthetic invoice as plain text — a real pipeline would feed parsed PDF text (e.g., from LlamaParse) into the same call.

## Run

Python:
```bash
cd py
pip install -r requirements.txt
python main.py
```

TypeScript:
```bash
cd ts
npm install
npm start
```

## Output shape

```json
{
  "vendor_name": "Northwind Office Supplies",
  "invoice_number": "INV-2026-04821",
  "invoice_date": "2026-04-18",
  "line_items": [
    { "description": "...", "quantity": 6, "unit_price": 24.99, "amount": 149.94 }
  ],
  "subtotal": 274.18,
  "tax": 22.61,
  "total": 296.79
}
```
