"""Structured invoice extraction — Python.

Binds Claude to a Pydantic schema using `LLM.as_structured_llm` so the
model output is guaranteed to validate against `Invoice`.
"""

from datetime import date
from pathlib import Path

from dotenv import load_dotenv
from llama_index.core.llms import ChatMessage
from llama_index.llms.anthropic import Anthropic
from pydantic import BaseModel, Field

REPO_ROOT = Path(__file__).resolve().parents[3]
DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "invoice_001.txt"

load_dotenv(REPO_ROOT / ".env")


class LineItem(BaseModel):
    description: str = Field(description="Item or service description, as it appears on the invoice.")
    quantity: float = Field(description="Number of units. Use 1 for shipping/discount lines.")
    unit_price: float = Field(description="Price per unit in invoice currency.")
    amount: float = Field(description="Line total (quantity * unit_price, signed for discounts).")


class Invoice(BaseModel):
    vendor_name: str
    vendor_tax_id: str | None = None
    invoice_number: str
    invoice_date: date
    due_date: date | None = None
    po_number: str | None = None
    line_items: list[LineItem]
    subtotal: float
    tax: float
    total: float


SYSTEM = (
    "Extract invoice fields from the user-supplied invoice text. "
    "Preserve the currency amounts and signs exactly. Include discounts and "
    "shipping as line items. Dates must be ISO-8601."
)


def main() -> None:
    invoice_text = DATA_FILE.read_text()

    llm = Anthropic(model="claude-sonnet-4-6", max_tokens=2048)
    structured_llm = llm.as_structured_llm(Invoice)

    response = structured_llm.chat(
        [
            ChatMessage(role="system", content=SYSTEM),
            ChatMessage(role="user", content=invoice_text),
        ]
    )

    invoice: Invoice = response.raw  # type: ignore[assignment]
    print(invoice.model_dump_json(indent=2))


if __name__ == "__main__":
    main()
