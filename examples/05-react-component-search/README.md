# 05 — React Component Semantic Search

Semantic search over a React UI component library. Lets developers find components by **intent** ("slide-out menu", "modal with form") instead of by exact name ("Drawer", "Dialog").

## Architecture

Three phases:

1. **AST-aware parse** — walk each `.tsx` file with `@babel/parser`, extract the component name, props interface, and JSDoc summary. (Naive text-chunking loses this structure.)
2. **Structured metadata extraction** — pass each component through Claude bound to a Zod schema (`ComponentMetadataSchema`) to derive a semantic description, design-compliance grade, and capability tags.
3. **Hybrid index** — embed the (code + JSDoc + extracted description) blob and store it alongside the structured metadata. Search supports both semantic similarity and hard metadata filters.

## Sample query

> "I need a secure button for a login form that triggers a biometric hardware check."

Returns `<BiometricSubmit>` even though the query never says "submit" or "biometric button" — the structured metadata extraction surfaced "biometric authentication" as a capability tag.

## Why TypeScript-primary

This use case is fundamentally TS-shaped:
- The corpus is `.tsx` source code
- The AST tooling (`@babel/parser`, `typescript` compiler API) is TS-native
- The downstream consumer is a React app
- LlamaIndex.TS ships `@llamaindex/chat-ui` for the search UI

A Python twin would have to shell out to a Node parser, so the [`py/README.md`](py/README.md) documents the pattern and points back here rather than re-implementing it.

## Run

```bash
cd ts
npm install
npm start
```

The first run will:
1. Parse `../data/*.tsx`
2. Call Claude once per component to extract metadata (small N — cheap)
3. Build an in-memory `VectorStoreIndex`
4. Run the sample query and print the matched component + metadata
