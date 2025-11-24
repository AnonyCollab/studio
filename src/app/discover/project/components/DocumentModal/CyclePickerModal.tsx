
import React from 'react';
import { RotateCw } from 'lucide-react';
import { INITIAL_CYCLES } from '../../constants';

interface CyclePickerModalProps {
  currentCycleId?: string;
  onClose: () => void;
  onSelect: (cycleId: string) => void;
  position?: { top: number; left: number };
  isLight: boolean;
}

export function CyclePickerModal({ currentCycleId, onClose, onSelect, position, isLight }: CyclePickerModalProps) {
  const containerClass = isLight ? "bg-white border-slate-200 shadow-xl" : "bg-[#1e1e1e] border-gray-700 shadow-xl";
  const itemHover = isLight ? "hover:bg-slate-100" : "hover:bg-[#2a2a2a]";
  const textMain = isLight ? "text-slate-700" : "text-gray-300";
  const textMuted = isLight ? "text-slate-400" : "text-gray-500";
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
        <div className="p-2 space-y-1">
            <div className={`px-2 py-1 text-xs font-bold uppercase tracking-wider ${textMuted}`}>Active Cycles</div>
            {INITIAL_CYCLES.map((cycle) => (
              <button
                key={cycle.id}
                onClick={() => onSelect(cycle.id)}
                className={`w-full flex items-center justify-between p-2 rounded group transition-colors ${itemHover} ${currentCycleId === cycle.id ? (isLight ? 'bg-brand-50' : 'bg-brand-900/20') : ''}`}
              >
                <div className="flex items-center gap-3">
                    <RotateCw className={`w-4 h-4 ${cycle.status === 'Active' ? 'text-brand-500' : textMuted}`} />
                    <div className="text-left">
                        <div className={`text-sm ${textMain} ${currentCycleId === cycle.id ? 'font-bold' : ''}`}>{cycle.name}</div>
                        <div className={`text-[10px] ${textMuted}`}>{cycle.startDate} - {cycle.endDate}</div>
                    </div>
                </div>
                {cycle.status === 'Active' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
              </button>
            ))}
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className={`lg:hidden fixed inset-x-0 bottom-0 z-[120] rounded-t-2xl p-4 pb-8 animate-in slide-in-from-bottom-full duration-300 ${mobileSheetClass}`} onClick={(e) => e.stopPropagation()}>
          <div className="w-12 h-1 bg-gray-300/20 rounded-full mx-auto mb-6" />
          <h3 className="text-lg font-bold mb-4 text-center">Assign to Cycle</h3>
          <div className="space-y-2">
            {INITIAL_CYCLES.map((cycle) => (
              <button
                key={cycle.id}
                onClick={() => onSelect(cycle.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${isLight ? 'bg-slate-50 active:bg-slate-200' : 'bg-white/5 active:bg-white/10'}`}
              >
                <RotateCw className={`w-5 h-5 ${cycle.status === 'Active' ? 'text-brand-500' : textMuted}`} />
                <div className="flex-1 text-left">
                    <span className={`text-base font-medium block ${textMain}`}>{cycle.name}</span>
                    <span className={`text-xs ${textMuted}`}>{cycle.startDate} - {cycle.endDate}</span>
                </div>
                {currentCycleId === cycle.id && <div className="ml-auto w-2 h-2 rounded-full bg-brand-500" />}
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
