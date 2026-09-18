import { useCallback, useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  label: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Centered dialog over the dimmed page. Closes on Escape or a backdrop press,
 * keeps Tab inside itself, and hands focus back to whatever opened it.
 */
export function Modal({ label, onClose, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Captured during the first render: by the time effects run, an autoFocus
  // field inside the dialog already holds focus.
  const openerRef = useRef<HTMLElement | null>(document.activeElement as HTMLElement | null);

  const focusables = useCallback(
    () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
    [],
  );

  useEffect(() => {
    const panel = panelRef.current;
    const opener = openerRef.current;
    if (!panel?.contains(document.activeElement)) {
      const [first] = focusables();
      (first ?? panel)?.focus();
    }

    return () => opener?.focus();
  }, [focusables]);

  // The page behind must not scroll away under the dialog.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== "Tab") return;

    const items = focusables();
    if (items.length === 0) return;

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        ref={panelRef}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>
  );
}
