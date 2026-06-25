# 02 — Support Chatbot with Memory

Multi-turn customer support chat that retrieves grounded answers from a product knowledge base and remembers conversation context.

## What it shows

- `CondensePlusContextChatEngine` (py) / `ContextChatEngine` (ts) — combines a retriever with chat-style memory
- Multi-turn coreference resolution ("I tried that", "it's still broken") resolved against prior turns
- Same `VectorStoreIndex` foundation as Example 01, wrapped in a chat surface

## Demo conversation

The `main` driver runs a scripted 3-turn dialog so the example is reproducible without stdin:

```
user> How do I reset my Router X100?
bot>  [steps from manual]
user> I did that but the light is still blinking red.
bot>  [troubleshoots blinking-red specifically for the X100]
user> Is it under warranty if I bought it 14 months ago?
bot>  [answers from warranty policy doc]
```

Swap in a real REPL loop by reading `input()` (py) or `readline` (ts).

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
