import React from 'react';
import { X } from 'lucide-react';
import { Assignee } from '../../types';

interface AssigneePickerModalProps {
  onClose: () => void;
  onSelect: (name: string) => void;
  currentAssignee?: string;
  position?: { top: number; left: number };
  isLight: boolean;
  members: Assignee[];
}

export function AssigneePickerModal({ onClose, onSelect, currentAssignee, position, isLight, members }: AssigneePickerModalProps) {
  const containerClass = isLight ? "bg-white border-slate-200 shadow-xl" : "bg-[#1e1e1e] border-gray-700 shadow-xl";
  const itemHover = isLight ? "hover:bg-slate-100" : "hover:bg-[#2a2a2a]";
  const textMain = isLight ? "text-slate-700" : "text-gray-300";
  const labelClass = isLight ? "text-slate-400" : "text-slate-500";
  const mobileOverlayClass = isLight ? "bg-white/95 text-slate-900" : "bg-[#09090b]/95 text-white";

  const renderList = () => (
    <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
        <div className={`px-3 py-2 text-xs font-bold uppercase tracking-wider ${labelClass}`}>Users</div>
        {members.filter(a => a.type === 'user').map(assignee => (
            <button
                key={assignee.name}
                onClick={() => onSelect(assignee.name)}
                className={`w-full flex items-center gap-3 px-3 py-2 transition-colors rounded-lg ${itemHover}`}
            >
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold ${assignee.color}`}>{assignee.initials}</div>
                <span className={`text-sm truncate ${textMain} ${currentAssignee === assignee.name ? 'font-bold' : ''}`}>{assignee.name}</span>
            </button>
        ))}
        <div className={`px-3 py-2 mt-1 text-xs font-bold uppercase tracking-wider border-t ${isLight ? 'border-slate-100' : 'border-gray-700'} ${labelClass}`}>Teams</div>
        {members.filter(a => a.type === 'team').map(team => (
            <button
                key={team.name}
                onClick={() => onSelect(team.name)}
                className={`w-full flex items-center gap-3 px-3 py-2 transition-colors rounded-lg ${itemHover}`}
            >
                <div className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold ${team.color}`}>{team.initials}</div>
                <span className={`text-sm truncate ${textMain} ${currentAssignee === team.name ? 'font-bold' : ''}`}>{team.name}</span>
            </button>
        ))}
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-[130] bg-black/40 lg:bg-transparent" onClick={onClose} />
      
      {/* Desktop Popover */}
      <div 
        className={`hidden lg:block fixed rounded-lg z-[140] w-[250px] border ${containerClass}`}
        style={position ? { top: position.top, left: position.left } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {renderList()}
      </div>

      {/* Mobile Full Screen Overlay */}
      <div className={`lg:hidden fixed inset-0 z-[150] flex flex-col ${mobileOverlayClass}`}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-bold">Select Assignee</h2>
                <button onClick={onClose} className="p-2 rounded-full bg-white/10"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                    <div className="text-xs font-bold uppercase opacity-50 mb-3 px-1">Users</div>
                    <div className="space-y-2">
                        {members.filter(a => a.type === 'user').map(assignee => (
                            <button
                                key={assignee.name}
                                onClick={() => onSelect(assignee.name)}
                                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors ${isLight ? 'bg-slate-50 active:bg-slate-200' : 'bg-white/5 active:bg-white/10'}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm text-white font-bold ${assignee.color}`}>{assignee.initials}</div>
                                <span className="text-lg font-medium">{assignee.name}</span>
                                {currentAssignee === assignee.name && <div className="ml-auto w-2 h-2 rounded-full bg-brand-500" />}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="text-xs font-bold uppercase opacity-50 mb-3 px-1">Teams</div>
                    <div className="space-y-2">
                        {members.filter(a => a.type === 'team').map(team => (
                            <button
                                key={team.name}
                                onClick={() => onSelect(team.name)}
                                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors ${isLight ? 'bg-slate-50 active:bg-slate-200' : 'bg-white/5 active:bg-white/10'}`}
                            >
                                <div className={`w-10 h-10 rounded-md flex-shrink-0 flex items-center justify-center text-sm text-white font-bold ${team.color}`}>{team.initials}</div>
                                <span className="text-lg font-medium">{team.name}</span>
                                {currentAssignee === team.name && <div className="ml-auto w-2 h-2 rounded-full bg-brand-500" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
      </div>
    </>
  );
}
