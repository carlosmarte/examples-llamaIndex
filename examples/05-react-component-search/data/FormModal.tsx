import { FormEvent, ReactNode } from "react";

export interface FormModalProps {
  /** Modal title shown in the header. */
  title: string;
  /** Whether the modal is open. */
  open: boolean;
  /** Called when the user dismisses without submitting. */
  onClose: () => void;
  /** Called with the form's submit event when the user submits. */
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  /** Form fields rendered inside the modal body. */
  children: ReactNode;
  /** Submit button label. */
  submitLabel?: string;
}

/**
 * Modal dialog wrapping a form. Designed for create/edit flows — the modal
 * body is a `<form>` so native form semantics (Enter to submit, browser
 * validation, autofocus) work without extra wiring. Closes on overlay click,
 * Escape, or cancel. Design Compliance: "High". Accepts any field components
 * as children.
 */
export function FormModal({
  title,
  open,
  onClose,
  onSubmit,
  children,
  submitLabel = "Save",
}: FormModalProps) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <h2 id="modal-title">{title}</h2>
        </header>
        <form onSubmit={onSubmit}>
          <div className="modal-body">{children}</div>
          <footer>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">{submitLabel}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
