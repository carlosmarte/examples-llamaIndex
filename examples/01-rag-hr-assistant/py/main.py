"""RAG HR Assistant — Python.

Builds a VectorStoreIndex over ../data/*.md and answers a sample HR question.
"""

from pathlib import Path

from dotenv import load_dotenv
from llama_index.core import Settings, SimpleDirectoryReader, VectorStoreIndex
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
    query_engine = index.as_query_engine(similarity_top_k=3)

    question = (
        "What is the parental leave policy for an employee with 2 years of tenure? "
        "How many weeks of paid leave do they get?"
    )
    print(f"Q: {question}\n")
    response = query_engine.query(question)
    print(f"A: {response}\n")

    print("Sources:")
    for node in response.source_nodes:
        print(f"  - {node.metadata.get('file_name', '?')}  (score={node.score:.3f})")


if __name__ == "__main__":
    main()
