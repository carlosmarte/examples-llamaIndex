"""Research agent — Python.

A FunctionAgent equipped with three tools:
  - internal_financials_query: RAG over ../data/*.md
  - web_search: STUBBED — returns canned results so the example runs offline
  - calculator: safe arithmetic evaluator (no eval)
"""

import asyncio
import operator as op
from pathlib import Path

from dotenv import load_dotenv
from llama_index.core import Settings, SimpleDirectoryReader, VectorStoreIndex
from llama_index.core.agent.workflow import FunctionAgent
from llama_index.core.tools import FunctionTool
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.anthropic import Anthropic

REPO_ROOT = Path(__file__).resolve().parents[3]
DATA_DIR = Path(__file__).resolve().parents[1] / "data"

load_dotenv(REPO_ROOT / ".env")

Settings.llm = Anthropic(model="claude-sonnet-4-6", max_tokens=2048)
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")


# --- Tool 1: RAG over internal financial PDFs -------------------------------

documents = SimpleDirectoryReader(str(DATA_DIR)).load_data()
INDEX = VectorStoreIndex.from_documents(documents)
QUERY_ENGINE = INDEX.as_query_engine(similarity_top_k=2)


def internal_financials_query(question: str) -> str:
    """Search Acme's internal financial filings for the given question.

    Use this for any question about Acme's own revenue, segments, or geography.
    """
    return str(QUERY_ENGINE.query(question))


# --- Tool 2: web search (stubbed for offline reproducibility) ---------------

_STUB_WEB_RESULTS = {
    "apple q3 2025 revenue": (
        "Apple Inc. reported Q3 2025 (fiscal quarter ended June 28, 2025) revenue "
        "of $94.93 billion, up 10% year-over-year. Source: Apple Press Release."
    ),
}


def web_search(query: str) -> str:
    """Search the public web. Returns a short text summary of top hits."""
    key = query.lower().strip()
    for k, v in _STUB_WEB_RESULTS.items():
        if k in key or key in k:
            return v
    return f"[stub] No canned result for query: {query!r}. Wire a real provider here."


# --- Tool 3: calculator (safe AST-walking evaluator) ------------------------

import ast

_BIN_OPS = {
    ast.Add: op.add, ast.Sub: op.sub, ast.Mult: op.mul,
    ast.Div: op.truediv, ast.Mod: op.mod, ast.Pow: op.pow,
}
_UNARY_OPS = {ast.UAdd: op.pos, ast.USub: op.neg}


def _eval_node(node: ast.AST) -> float:
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return float(node.value)
    if isinstance(node, ast.BinOp) and type(node.op) in _BIN_OPS:
        return _BIN_OPS[type(node.op)](_eval_node(node.left), _eval_node(node.right))
    if isinstance(node, ast.UnaryOp) and type(node.op) in _UNARY_OPS:
        return _UNARY_OPS[type(node.op)](_eval_node(node.operand))
    raise ValueError(f"Unsupported expression: {ast.dump(node)}")


def calculator(expression: str) -> float:
    """Evaluate a basic arithmetic expression. Supports + - * / % ** and parens."""
    tree = ast.parse(expression, mode="eval")
    return _eval_node(tree.body)


# --- Agent ------------------------------------------------------------------

TOOLS = [
    FunctionTool.from_defaults(fn=internal_financials_query),
    FunctionTool.from_defaults(fn=web_search),
    FunctionTool.from_defaults(fn=calculator),
]

AGENT = FunctionAgent(
    tools=TOOLS,
    llm=Settings.llm,
    system_prompt=(
        "You are a financial-research analyst. Use the tools provided to answer "
        "the user's question. Cite the numbers you used and show the calculation."
    ),
)


async def main() -> None:
    task = (
        "Compare our Q3 revenue from last year against Apple's most recent Q3 revenue. "
        "By what percentage did Apple's exceed ours? Show your work."
    )
    print(f"task> {task}\n")
    response = await AGENT.run(user_msg=task)
    print(f"\nfinal> {response}")


if __name__ == "__main__":
    asyncio.run(main())
