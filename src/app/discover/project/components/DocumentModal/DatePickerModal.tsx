
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// Native date utils to replace missing date-fns exports
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function format(date: Date, fmt: string) {
  const d = date.getDate();
  const m = date.getMonth();
  const y = date.getFullYear();
  
  if (fmt === 'MMM dd') {
    return `${shortMonths[m]} ${d.toString().padStart(2, '0')}`;
  }
  if (fmt === 'MMMM yyyy') {
    return `${months[m]} ${y}`;
  }
  if (fmt === 'd') {
      return d.toString();
  }
  return date.toDateString();
}

function addMonths(date: Date, amount: number) {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + amount);
    return newDate;
}

function subMonths(date: Date, amount: number) {
    return addMonths(date, -amount);
}

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

function endOfWeek(date: Date) {
     const start = startOfWeek(date);
     const end = new Date(start);
     end.setDate(start.getDate() + 6);
     return end;
}

function isSameMonth(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

function isSameDay(d1: Date, d2: Date) {
    return isSameMonth(d1, d2) && d1.getDate() === d2.getDate();
}

function isBefore(d1: Date, d2: Date) {
    return d1.getTime() < d2.getTime();
}

function isWithinInterval(date: Date, interval: { start: Date, end: Date }) {
    const t = date.getTime();
    return t >= interval.start.getTime() && t <= interval.end.getTime();
}

function eachDayOfInterval({ start, end }: { start: Date, end: Date }) {
    const days = [];
    let current = new Date(start);
    let safety = 0;
    while (current <= end && safety < 100) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
        safety++;
    }
    return days;
}

interface DatePickerModalProps {
  dateStart: string;
  dateEnd: string;
  onClose: () => void;
  onSave: (start: string, end: string) => void;
  isLight: boolean;
  singleDate?: boolean;
}

export function DatePickerModal({ dateStart, dateEnd, onClose, onSave, isLight, singleDate = false }: DatePickerModalProps) {
  const parseDateString = (str: string) => {
    const currentYear = new Date().getFullYear();
    try {
        const strToParse = str.match(/\d{4}/) ? str : `${str} ${currentYear}`;
        const parsed = new Date(Date.parse(strToParse));
        if (!isNaN(parsed.getTime())) return parsed;
        return new Date();
    } catch {
        return new Date();
    }
  };

  const [currentMonth, setCurrentMonth] = useState(singleDate ? parseDateString(dateEnd) : parseDateString(dateStart));
  const [selectingStart, setSelectingStart] = useState<Date | null>(singleDate ? null : parseDateString(dateStart));
  const [selectingEnd, setSelectingEnd] = useState<Date | null>(parseDateString(dateEnd));

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const handleDayClick = (day: Date) => {
    if (singleDate) {
        setSelectingEnd(day);
        return;
    }

    if (!selectingStart || (selectingStart && selectingEnd)) {
        setSelectingStart(day);
        setSelectingEnd(null);
    } else {
        if (isBefore(day, selectingStart)) {
            setSelectingEnd(selectingStart);
            setSelectingStart(day);
        } else {
            setSelectingEnd(day);
        }
    }
  };

  const handleSave = () => {
    if (singleDate) {
        if (selectingEnd) {
            const endStr = format(selectingEnd, 'MMM dd');
            onSave('', endStr); // Start date is empty/ignored for single date mode
        } else {
            onClose();
        }
        return;
    }

    if (selectingStart) {
        const startStr = format(selectingStart, 'MMM dd');
        const endStr = selectingEnd ? format(selectingEnd, 'MMM dd') : startStr;
        onSave(startStr, endStr);
    } else {
        onClose();
    }
  };

  const isSelected = (day: Date) => {
      if (singleDate) return selectingEnd && isSameDay(day, selectingEnd);
      
      if (selectingStart && isSameDay(day, selectingStart)) return true;
      if (selectingEnd && isSameDay(day, selectingEnd)) return true;
      return false;
  };

  const isInRange = (day: Date) => {
      if (singleDate) return false;
      if (selectingStart && selectingEnd) {
          return isWithinInterval(day, { start: selectingStart, end: selectingEnd });
      }
      return false;
  };

  // Theme classes
  const containerBg = isLight ? "bg-white border-slate-200 shadow-2xl" : "bg-[#1e1e1e] border-gray-700 shadow-2xl";
  const headerBorder = isLight ? "border-slate-100" : "border-gray-700";
  const textMain = isLight ? "text-slate-900" : "text-white";
  const textMuted = isLight ? "text-slate-400" : "text-gray-400";
  const iconHover = isLight ? "hover:bg-black/5 text-slate-500" : "hover:bg-white/10 text-gray-300";
  const dayHover = isLight ? "hover:bg-black/5" : "hover:bg-white/5";
  const rangeBg = isLight ? "bg-brand-50 text-brand-600" : "bg-blue-900/30 text-blue-200";
  const selectedBg = "bg-brand-500 text-white shadow-lg z-10 font-bold";
  const footerBg = isLight ? "bg-slate-50 border-slate-100" : "bg-[#18181b] border-gray-700";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4" onClick={onClose}>
      <div className={`rounded-2xl border w-full max-w-[340px] overflow-hidden ${containerBg}`} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${headerBorder}`}>
            <h3 className={`font-bold ${textMain}`}>{singleDate ? 'Set Deadline' : 'Set Date Range'}</h3>
            <button onClick={onClose} className={`p-1 rounded-full ${textMuted} hover:${textMain} hover:bg-white/10`}><X size={20} /></button>
        </div>

        <div className="p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className={`p-2 rounded-lg transition-colors ${iconHover}`}>
                    <ChevronLeft size={20} />
                </button>
                <span className={`font-bold text-sm ${textMain}`}>
                    {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className={`p-2 rounded-lg transition-colors ${iconHover}`}>
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className={`text-center text-xs font-bold py-1 uppercase ${textMuted}`}>{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((day, idx) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const selected = isSelected(day);
                    const range = isInRange(day);

                    return (
                        <button
                            key={idx}
                            onClick={() => handleDayClick(day)}
                            className={`
                                h-9 w-full rounded-md text-sm flex items-center justify-center relative transition-all
                                ${!isCurrentMonth ? 'opacity-30' : ''}
                                ${!selected && !range ? `${isLight ? 'text-slate-700' : 'text-gray-300'} ${dayHover}` : ''}
                                ${range && !selected ? `${rangeBg} rounded-none` : ''}
                                ${selected ? selectedBg : ''}
                            `}
                        >
                            {format(day, 'd')}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-between items-center ${footerBg}`}>
            <div className={`text-xs font-mono ${textMuted}`}>
                {singleDate 
                    ? (selectingEnd ? format(selectingEnd, 'MMM dd') : 'Select date')
                    : (
                        <>
                            {selectingStart ? format(selectingStart, 'MMM dd') : 'Start'} 
                            {' -> '}
                            {selectingEnd ? format(selectingEnd, 'MMM dd') : 'End'}
                        </>
                    )
                }
            </div>
            <button 
                onClick={handleSave}
                disabled={singleDate ? !selectingEnd : !selectingStart}
                className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20"
            >
                Apply
            </button>
        </div>
      </div>
    </div>
  );
}
