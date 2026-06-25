"""Support chatbot with conversation memory — Python.

Demonstrates CondensePlusContextChatEngine: the chat engine condenses
the running dialog into a standalone question, retrieves relevant chunks,
then asks the LLM to answer with that context plus the recent turns.
"""

from pathlib import Path

from dotenv import load_dotenv
from llama_index.core import Settings, SimpleDirectoryReader, VectorStoreIndex
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.anthropic import Anthropic

REPO_ROOT = Path(__file__).resolve().parents[3]
DATA_DIR = Path(__file__).resolve().parents[1] / "data"

load_dotenv(REPO_ROOT / ".env")

Settings.llm = Anthropic(model="claude-sonnet-4-6", max_tokens=1024)
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")


def main() -> None:
    documents = SimpleDirectoryReader(str(DATA_DIR)).load_data()
    index = VectorStoreIndex.from_documents(documents)

    chat_engine = index.as_chat_engine(
        chat_mode="condense_plus_context",
        memory=ChatMemoryBuffer.from_defaults(token_limit=3000),
        system_prompt=(
            "You are a customer support assistant for Acme Networking. "
            "Answer questions using only the provided context. "
            "If the context does not contain the answer, say so plainly."
        ),
    )

    turns = [
        "How do I reset my Router X100?",
        "I did that but the power light is still blinking red.",
        "Is it still under warranty if I bought it 14 months ago?",
    ]

    for turn in turns:
        print(f"\nuser> {turn}")
        response = chat_engine.chat(turn)
        print(f"bot>  {response}")


if __name__ == "__main__":
    main()
