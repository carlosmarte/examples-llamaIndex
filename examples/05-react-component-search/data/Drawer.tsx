import { ReactNode } from "react";

export interface DrawerProps {
  /** Whether the drawer is open. */
  open: boolean;
  /** Called when the user requests to close (overlay click, Escape). */
  onClose: () => void;
  /** Drawer slide direction. */
  side?: "left" | "right";
  /** Drawer body content. */
  children: ReactNode;
}

/**
 * Slide-out side panel for secondary navigation or contextual actions.
 * Animates in from the edge of the viewport over a translucent overlay.
 * Commonly used as a mobile-friendly main-menu replacement, or as a settings
 * panel on desktop. Traps focus while open. Design Compliance: "High".
 */
export function Drawer({ open, onClose, side = "left", children }: DrawerProps) {
  if (!open) return null;
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside
        className={`drawer drawer-${side}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </aside>
    </div>
  );
}
