# examples-llamaIndex

Runnable, paired Python + TypeScript examples of [LlamaIndex](https://www.llamaindex.ai/) for five industry-canon use cases.

All examples use **Anthropic Claude** for generation (`claude-sonnet-4-6`) and **OpenAI** for embeddings (`text-embedding-3-small`). LlamaIndex has no native Anthropic embeddings provider, so the embeddings call goes to OpenAI even when the LLM is Claude.

## Use cases

| # | Folder | What it shows | Languages |
|---|---|---|---|
| 1 | [`examples/01-rag-hr-assistant`](examples/01-rag-hr-assistant/) | RAG over local markdown — single-turn Q&A | py + ts |
| 2 | [`examples/02-chatbot-support`](examples/02-chatbot-support/) | ChatEngine with multi-turn memory over a knowledge base | py + ts |
| 3 | [`examples/03-structured-extraction-invoices`](examples/03-structured-extraction-invoices/) | Pydantic / Zod schema-bound structured extraction | py + ts |
| 4 | [`examples/04-agent-research`](examples/04-agent-research/) | Agent with calculator + (mock) web search + RAG tools | py + ts |
| 5 | [`examples/05-react-component-search`](examples/05-react-component-search/) | AST-aware semantic search over a React component library | ts primary |

Each example folder has:

- `README.md` — what it does, how to run, what to look at
- `data/` — sample documents shared between the py and ts twins
- `py/` — Python implementation (`main.py` + `requirements.txt`)
- `ts/` — TypeScript implementation (`main.ts` + `package.json` + `tsconfig.json`)

## Setup

```bash
cp .env.example .env
# Edit .env and add ANTHROPIC_API_KEY and OPENAI_API_KEY
```

Then `cd` into any example's `py/` or `ts/` folder and follow the per-example README.

### Python prerequisites

- Python 3.11+
- `pip install -r requirements.txt` (per example) — or use `uv`

### TypeScript prerequisites

- Node 20+
- `npm install` (per example)

## Why polyglot twins

LlamaIndex ships first-class Python and TypeScript SDKs. Pairing each example side-by-side lets you compare API surface and choose the language that fits your stack. Example 05 (React component search) is TypeScript-primary because the AST tooling and React UI integration are TS-native — its `py/` folder contains a short note rather than a parallel implementation.

## Model choice

- **Claude Sonnet 4.6** (`claude-sonnet-4-6`) — strong reasoning, cost-effective, supports tool use needed for the agent example.
- **OpenAI text-embedding-3-small** — 1536-dim, cheap, good general-purpose embeddings.

Swap providers by editing the `Settings.llm` / `Settings.embed_model` lines at the top of each `main.py` / `main.ts`.
