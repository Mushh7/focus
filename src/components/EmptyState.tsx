import { InboxIcon, PlusIcon } from "./icons";

interface EmptyStateProps {
  title: string;
  text: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ title, text, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">
        <InboxIcon />
      </span>
      <p className="empty-state__title">{title}</p>
      <p className="empty-state__text">{text}</p>
      <button type="button" className="button button--sm button--ghost" onClick={onAction}>
        <PlusIcon className="button__icon" />
        {actionLabel}
      </button>
    </div>
  );
}
