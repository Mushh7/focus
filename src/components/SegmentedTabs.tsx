import type { PanelTab } from "../types";
import { ChartIcon, CupIcon, TargetIcon } from "./icons";

const TABS: Array<{ id: PanelTab; label: string; Icon: typeof TargetIcon }> = [
  { id: "focus", label: "Focus", Icon: TargetIcon },
  { id: "break", label: "Break", Icon: CupIcon },
  { id: "stats", label: "Stats", Icon: ChartIcon },
];

interface SegmentedTabsProps {
  active: PanelTab;
  onChange: (tab: PanelTab) => void;
}

export function SegmentedTabs({ active, onChange }: SegmentedTabsProps) {
  return (
    <div className="tabs" role="tablist" aria-label="Focus session panels">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className="tabs__tab"
          role="tab"
          id={`tab-${id}`}
          aria-selected={active === id}
          aria-controls={`panel-${id}`}
          onClick={() => onChange(id)}
        >
          <Icon className="tabs__icon" />
          {label}
        </button>
      ))}
    </div>
  );
}
