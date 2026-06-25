# 01 — RAG HR Assistant

Single-turn retrieval-augmented Q&A over an internal HR knowledge base.

## What it shows

- Load local markdown with `SimpleDirectoryReader`
- Build a `VectorStoreIndex` in memory (no external vector DB)
- Query with `as_query_engine` / `asQueryEngine`
- Anthropic Claude for generation, OpenAI for embeddings

## Sample query

> "What is the parental leave policy for employees with 2 years of tenure?"

The retriever pulls the relevant section of `data/parental_leave.md` and Claude synthesizes a grounded answer that cites the policy.

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

Both read `../.env` (project root) for `ANTHROPIC_API_KEY` and `OPENAI_API_KEY`.
