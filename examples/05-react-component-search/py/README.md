# Python notes — React component semantic search

This use case is intentionally **not** mirrored in Python. The corpus is `.tsx` source code, the AST tooling is TS-native (`@babel/parser`, `typescript` compiler API), and the consumer is a React app — so the TS implementation in [`../ts`](../ts) is the canonical version.

If you must drive this from Python (e.g., as part of a larger Python data pipeline), the practical pattern is:

1. **Parse in Node, ingest in Python.** Run a small Node script (the `parseComponent` step from `../ts/main.ts`) as a subprocess and read its JSON output.
2. **Then use LlamaIndex Python** for the rest: structured-LLM extraction with Pydantic (mirror of `ComponentMetadataSchema`), build a `VectorStoreIndex`, and serve queries.

The reason: re-implementing a TSX AST walker in Python (e.g., via tree-sitter) is doable but adds dependencies and drift risk for no benefit when the same parse exists natively in Node.

See [`../README.md`](../README.md) for the full architecture and the [`../ts/main.ts`](../ts/main.ts) implementation.
