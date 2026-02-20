"use client";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const Tabs = ({ tabs, activeTab, onTabChange }: TabsProps) => {
  return (
    <div className="flex items-center gap-1">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-3 py-2 text-sm font-medium transition-all rounded flex items-center gap-2
              ${isActive 
                ? 'border border-white/30 bg-black/40 text-white' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="bg-white/10 text-white/50 text-[9px] font-bold tracking-wide rounded px-1.5 py-0.5">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};