# 04 — Research Agent with Tools

An LLM agent given three tools: a RAG query tool over internal financial PDFs, a (mocked) web search, and a calculator. The agent plans which tools to call, in what order, and synthesizes the final answer.

## What it shows

- **Python**: `FunctionAgent` (built on the LlamaIndex workflows runtime)
- **TypeScript**: `agent` from `@llamaindex/workflow` with `tool({ ... })` wrappers
- Multi-step reasoning: the model issues several tool calls in one task
- Tool definitions with typed inputs (Pydantic / Zod)

## Demo task

> Compare our Q3 revenue from last year against Apple's Q3 revenue. By what percentage did Apple's exceed ours?

Expected trace:

1. `internal_financials_query("Q3 2025 revenue")` → returns Acme's $48.2M
2. `web_search("Apple Q3 2025 revenue")` → returns a stubbed result with $94.9B
3. `calculator("(94.9e9 - 48.2e6) / 48.2e6 * 100")` → returns ~196832%
4. Final answer synthesized

## Why web search is mocked

So the example runs offline and deterministically. Swap the `web_search` body with a real call to Tavily / Serper / Brave for production.

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
