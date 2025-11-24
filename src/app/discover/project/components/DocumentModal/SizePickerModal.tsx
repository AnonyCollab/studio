import React from 'react';

interface SizePickerModalProps {
  currentSize: string;
  onClose: () => void;
  onSelect: (size: string) => void;
  position?: { top: number; left: number };
  isLight: boolean;
}

export function SizePickerModal({ currentSize, onClose, onSelect, position, isLight }: SizePickerModalProps) {
  const sizes = [
    { name: 'XXL', color: 'bg-rose-600' },
    { name: 'XL', color: 'bg-orange-500' },
    { name: 'L', color: 'bg-amber-500' },
    { name: 'M', color: 'bg-blue-500' },
    { name: 'S', color: 'bg-indigo-500' },
    { name: 'XS', color: 'bg-slate-500' }
  ];

  const containerClass = isLight ? "bg-white border-slate-200 shadow-xl" : "bg-[#1e1e1e] border-gray-700 shadow-xl";
  const itemHover = isLight ? "hover:bg-slate-100" : "hover:bg-[#2a2a2a]";
  const textMain = isLight ? "text-slate-700" : "text-gray-300";
  const mobileSheetClass = isLight ? "bg-white text-slate-900" : "bg-[#18181b] text-white";

  // Desktop Styles
  const desktopStyle = position ? { top: position.top, left: position.left } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  
  return (
    <>
      <div className="fixed inset-0 z-[110] bg-black/40 lg:bg-transparent transition-colors" onClick={onClose} />
      
      {/* Desktop Popover */}
      <div 
        className={`hidden lg:block fixed rounded-lg z-[120] w-[200px] border ${containerClass}`}
        style={desktopStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 space-y-1">
            {sizes.map((size) => (
              <button
                key={size.name}
                onClick={() => onSelect(size.name)}
                className={`w-full flex items-center gap-3 p-1.5 rounded group transition-colors ${itemHover}`}
              >
                <span className={`w-8 text-center text-xs font-bold py-0.5 rounded text-white shadow-sm ${size.color}`}>
                  {size.name}
                </span>
                <span className={`text-sm ${textMain}`}>Story Points</span>
              </button>
            ))}
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className={`lg:hidden fixed inset-x-0 bottom-0 z-[120] rounded-t-2xl p-4 pb-8 animate-in slide-in-from-bottom-full duration-300 ${mobileSheetClass}`} onClick={(e) => e.stopPropagation()}>
          <div className="w-12 h-1 bg-gray-300/20 rounded-full mx-auto mb-6" />
          <h3 className="text-lg font-bold mb-4 text-center">Select Size</h3>
          <div className="space-y-2">
            {sizes.map((size) => (
              <button
                key={size.name}
                onClick={() => onSelect(size.name)}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors ${isLight ? 'bg-slate-50 active:bg-slate-200' : 'bg-white/5 active:bg-white/10'}`}
              >
                <span className={`w-10 text-center text-sm font-bold py-1 rounded text-white shadow-sm ${size.color}`}>
                  {size.name}
                </span>
                <span className={`text-base font-medium ${textMain}`}>Story Points</span>
                {currentSize === size.name && <div className="ml-auto w-2 h-2 rounded-full bg-brand-500" />}
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