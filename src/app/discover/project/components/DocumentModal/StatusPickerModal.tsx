import React from 'react';

interface StatusPickerModalProps {
  currentStatus: string;
  onClose: () => void;
  onSelect: (status: string) => void;
  position?: { top: number; left: number };
  isLight: boolean;
}

export function StatusPickerModal({ currentStatus, onClose, onSelect, position, isLight }: StatusPickerModalProps) {
  const statusOptions = [
    {
      category: 'To Do',
      options: [{ name: 'Backlog', color: 'bg-slate-500' }]
    },
    {
      category: 'In Progress',
      options: [
          { name: 'In Progress', color: 'bg-blue-500' },
          { name: 'Review', color: 'bg-amber-500' }
      ]
    },
    {
      category: 'Complete',
      options: [{ name: 'Done', color: 'bg-emerald-500' }]
    }
  ];

  const containerClass = isLight ? "bg-white border-slate-200 shadow-xl" : "bg-[#1e1e1e] border-gray-700 shadow-xl";
  const itemHover = isLight ? "hover:bg-slate-100" : "hover:bg-[#2a2a2a]";
  const textMain = isLight ? "text-slate-700" : "text-gray-300";
  const categoryText = isLight ? "text-slate-400" : "text-gray-500";
  const mobileSheetClass = isLight ? "bg-white text-slate-900" : "bg-[#18181b] text-white";

  return (
    <>
      <div className="fixed inset-0 z-[110] bg-black/40 lg:bg-transparent" onClick={onClose} />
      
      {/* Desktop */}
      <div 
        className={`hidden lg:block fixed rounded-lg z-[120] w-[250px] border ${containerClass}`}
        style={position ? { top: position.top, left: position.left } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 space-y-3">
            {statusOptions.map((group) => (
              <div key={group.category}>
                <div className={`text-xs font-bold uppercase mb-1 px-2 tracking-wider ${categoryText}`}>{group.category}</div>
                <div className="space-y-1">
                  {group.options.map((option) => (
                    <button
                      key={option.name}
                      onClick={() => onSelect(option.name)}
                      className={`w-full flex items-center gap-2 p-1.5 rounded group transition-colors ${itemHover}`}
                    >
                      <div className={`w-2 h-2 rounded-full shadow-sm ${option.color}`}></div>
                      <span className={`text-sm ${currentStatus === option.name ? 'font-bold' : ''} ${textMain}`}>
                        {option.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className={`lg:hidden fixed inset-x-0 bottom-0 z-[120] rounded-t-2xl p-4 pb-8 animate-in slide-in-from-bottom-full duration-300 ${mobileSheetClass}`} onClick={(e) => e.stopPropagation()}>
          <div className="w-12 h-1 bg-gray-300/20 rounded-full mx-auto mb-6" />
          <h3 className="text-lg font-bold mb-4 text-center">Update Status</h3>
          <div className="space-y-4">
            {statusOptions.map((group) => (
                <div key={group.category}>
                    <div className={`text-xs font-bold uppercase mb-2 px-1 opacity-60`}>{group.category}</div>
                    <div className="space-y-2">
                        {group.options.map((option) => (
                            <button
                                key={option.name}
                                onClick={() => onSelect(option.name)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${isLight ? 'bg-slate-50 active:bg-slate-200' : 'bg-white/5 active:bg-white/10'}`}
                            >
                                <div className={`w-3 h-3 rounded-full shadow-sm ${option.color}`}></div>
                                <span className={`text-base font-medium ${textMain}`}>{option.name}</span>
                                {currentStatus === option.name && <div className="ml-auto text-xs font-bold text-brand-500">CURRENT</div>}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
          </div>
          <button onClick={onClose} className={`w-full mt-6 py-3 rounded-xl font-bold ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-white'}`}>
              Cancel
          </button>
      </div>
    </>
  );
}