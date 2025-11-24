import React from 'react';
import { AlertCircle } from 'lucide-react';

interface PriorityPickerModalProps {
  currentPriority: string;
  onClose: () => void;
  onSelect: (priority: string) => void;
  position?: { top: number; left: number };
  isLight: boolean;
}

export function PriorityPickerModal({ currentPriority, onClose, onSelect, position, isLight }: PriorityPickerModalProps) {
  const priorities = [
    { name: 'Critical', color: 'text-red-500' },
    { name: 'High', color: 'text-orange-500' },
    { name: 'Medium', color: 'text-blue-500' },
    { name: 'Low', color: 'text-slate-500' }
  ];

  const containerClass = isLight ? "bg-white border-slate-200 shadow-xl" : "bg-[#1e1e1e] border-gray-700 shadow-xl";
  const itemHover = isLight ? "hover:bg-slate-100" : "hover:bg-[#2a2a2a]";
  const textMain = isLight ? "text-slate-700" : "text-gray-300";
  const mobileSheetClass = isLight ? "bg-white text-slate-900" : "bg-[#18181b] text-white";

  return (
    <>
      <div className="fixed inset-0 z-[110] bg-black/40 lg:bg-transparent" onClick={onClose} />
      
      {/* Desktop */}
      <div 
        className={`hidden lg:block fixed rounded-lg z-[120] w-[200px] border ${containerClass}`}
        style={position ? { top: position.top, left: position.left } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 space-y-1">
            {priorities.map((priority) => (
              <button
                key={priority.name}
                onClick={() => onSelect(priority.name)}
                className={`w-full flex items-center gap-3 p-2 rounded group transition-colors ${itemHover}`}
              >
                <AlertCircle className={`w-4 h-4 ${priority.color}`} />
                <span className={`text-sm ${textMain} ${currentPriority === priority.name ? 'font-bold' : ''}`}>
                  {priority.name}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className={`lg:hidden fixed inset-x-0 bottom-0 z-[120] rounded-t-2xl p-4 pb-8 animate-in slide-in-from-bottom-full duration-300 ${mobileSheetClass}`} onClick={(e) => e.stopPropagation()}>
          <div className="w-12 h-1 bg-gray-300/20 rounded-full mx-auto mb-6" />
          <h3 className="text-lg font-bold mb-4 text-center">Set Priority</h3>
          <div className="space-y-2">
            {priorities.map((priority) => (
              <button
                key={priority.name}
                onClick={() => onSelect(priority.name)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${isLight ? 'bg-slate-50 active:bg-slate-200' : 'bg-white/5 active:bg-white/10'}`}
              >
                <AlertCircle className={`w-5 h-5 ${priority.color}`} />
                <span className={`text-base font-medium ${textMain}`}>{priority.name}</span>
                {currentPriority === priority.name && <div className="ml-auto w-2 h-2 rounded-full bg-brand-500" />}
              </button>
            ))}
          </div>
          <button onClick={onClose} className={`w-full mt-6 py-3 rounded-xl font-bold ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-white'}`}>
              Cancel
          </button>
      </div>
    </>
  );
}