
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TaskNode, Theme } from '../../types';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar } from 'lucide-react';

// --- Date Utilities (Native) ---
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function addMonths(date: Date, months: number) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}

function addYears(date: Date, years: number) {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
}

function startOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfQuarter(date: Date) {
    return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);
}

function startOfYear(date: Date) {
    return new Date(date.getFullYear(), 0, 1);
}

function getWeekNumber(d: Date) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function formatOutputDate(date: Date) {
    const m = MONTH_NAMES[date.getMonth()];
    const d = date.getDate().toString().padStart(2, '0');
    return `${m} ${d}`;
}

// --- Types & Config ---

type TimeFrame = 'Day' | 'Week' | 'Bi-week' | 'Month' | 'Quarter' | 'Year' | '5 Years';

interface ColumnData {
    label: string;
    subLabel?: string;
    date: Date;
    width: number;
}

interface GanttViewProps {
    tasks: TaskNode[];
    selectedTaskId: string | null;
    onSelect: (id: string) => void;
    onUpdateTask: (id: string, updates: Partial<TaskNode>) => void;
    theme: Theme;
}

const parseTaskDate = (dateStr: string): Date => {
    try {
        const currentYear = new Date().getFullYear();
        const strToParse = dateStr.match(/\d{4}/) ? dateStr : `${dateStr} ${currentYear}`;
        const date = new Date(strToParse);
        if (isNaN(date.getTime())) return new Date();
        return date;
    } catch {
        return new Date();
    }
};

export const GanttView: React.FC<GanttViewProps> = ({ tasks, selectedTaskId, onSelect, onUpdateTask, theme }) => {
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);

    const [timeFrame, setTimeFrame] = useState<TimeFrame>('Day');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const headerRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);

    // Drag State
    const dragRef = useRef<{
        taskId: string;
        startX: number;
        startStart: number; // ms
        startEnd: number; // ms
    } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const containerClass = isLight 
        ? "bg-white/60 border-black/5 shadow-xl backdrop-blur-xl" 
        : "bg-black/40 border-white/10 shadow-xl backdrop-blur-xl";
    const headerBg = isLight ? "bg-white/40" : "bg-black/20";
    const borderClass = isLight ? "border-black/5" : "border-white/5";
    const textMuted = isLight ? "text-slate-500" : "text-slate-500";
    const textMain = isLight ? "text-slate-800" : "text-slate-200";
    const gridLineColor = isLight ? "border-black/5" : "border-white/5";

    const config = useMemo(() => {
        switch (timeFrame) {
            case 'Day': return { colWidth: 50, unitDays: 1, spanCols: 60, labelFormat: 'd' };
            case 'Week': return { colWidth: 100, unitDays: 7, spanCols: 24, labelFormat: 'week' };
            case 'Bi-week': return { colWidth: 100, unitDays: 14, spanCols: 12, labelFormat: 'biweek' };
            case 'Month': return { colWidth: 120, unitDays: 30, spanCols: 24, labelFormat: 'month' };
            case 'Quarter': return { colWidth: 180, unitDays: 90, spanCols: 12, labelFormat: 'quarter' };
            case 'Year': return { colWidth: 200, unitDays: 365, spanCols: 5, labelFormat: 'year' };
            case '5 Years': return { colWidth: 200, unitDays: 365 * 5, spanCols: 2, labelFormat: '5years' };
            default: return { colWidth: 50, unitDays: 1, spanCols: 30, labelFormat: 'd' };
        }
    }, [timeFrame]);

    const { columns, startDate, endDate } = useMemo(() => {
        const cols: ColumnData[] = [];
        let start: Date;

        if (timeFrame === 'Day') start = addDays(currentDate, -5);
        else if (timeFrame === 'Week' || timeFrame === 'Bi-week') start = startOfWeek(addDays(currentDate, -14));
        else if (timeFrame === 'Month') start = startOfMonth(addMonths(currentDate, -2));
        else if (timeFrame === 'Quarter') start = startOfQuarter(addMonths(currentDate, -6));
        else if (timeFrame === 'Year') start = startOfYear(addYears(currentDate, -1));
        else start = startOfYear(addYears(currentDate, -5));

        let current = new Date(start);
        
        for (let i = 0; i < config.spanCols; i++) {
            let label = '';
            let subLabel = '';
            
            if (timeFrame === 'Day') {
                label = `${current.getDate()}`;
                subLabel = MONTH_NAMES[current.getMonth()];
                if (current.getDate() === 1) label = `${MONTH_NAMES[current.getMonth()]} 1`;
            } else if (timeFrame === 'Week') {
                label = `W${getWeekNumber(current)}`;
                subLabel = `${current.getDate()} ${MONTH_NAMES[current.getMonth()]}`;
            } else if (timeFrame === 'Bi-week') {
                label = `W${getWeekNumber(current)}`;
                subLabel = `${current.getDate()} ${MONTH_NAMES[current.getMonth()]}`;
            } else if (timeFrame === 'Month') {
                label = `${MONTH_NAMES[current.getMonth()]} ${current.getFullYear()}`;
            } else if (timeFrame === 'Quarter') {
                label = `Q${Math.floor(current.getMonth() / 3) + 1} ${current.getFullYear()}`;
            } else if (timeFrame === 'Year') {
                label = `${current.getFullYear()}`;
            } else if (timeFrame === '5 Years') {
                label = `${current.getFullYear()} - ${current.getFullYear() + 4}`;
            }

            cols.push({
                label,
                subLabel,
                date: new Date(current),
                width: config.colWidth
            });

            if (timeFrame === 'Day') current = addDays(current, 1);
            else if (timeFrame === 'Week') current = addDays(current, 7);
            else if (timeFrame === 'Bi-week') current = addDays(current, 14);
            else if (timeFrame === 'Month') current = addMonths(current, 1);
            else if (timeFrame === 'Quarter') current = addMonths(current, 3);
            else if (timeFrame === 'Year') current = addYears(current, 1);
            else if (timeFrame === '5 Years') current = addYears(current, 5);
        }

        return { columns: cols, startDate: start, endDate: current };
    }, [timeFrame, currentDate, config]);

    const totalTimelineWidth = useMemo(() => columns.reduce((acc, col) => acc + col.width, 0), [columns]);

    const handleBodyScroll = () => {
        if (headerRef.current && bodyRef.current) {
            headerRef.current.scrollLeft = bodyRef.current.scrollLeft;
        }
    };

    const handlePrev = () => {
        if (timeFrame === 'Day') setCurrentDate(addDays(currentDate, -7));
        else if (timeFrame === 'Week') setCurrentDate(addDays(currentDate, -28));
        else if (timeFrame === 'Bi-week') setCurrentDate(addDays(currentDate, -56));
        else if (timeFrame === 'Month') setCurrentDate(addMonths(currentDate, -3));
        else if (timeFrame === 'Quarter') setCurrentDate(addMonths(currentDate, -12));
        else setCurrentDate(addYears(currentDate, -5));
    };

    const handleNext = () => {
        if (timeFrame === 'Day') setCurrentDate(addDays(currentDate, 7));
        else if (timeFrame === 'Week') setCurrentDate(addDays(currentDate, 28));
        else if (timeFrame === 'Bi-week') setCurrentDate(addDays(currentDate, 56));
        else if (timeFrame === 'Month') setCurrentDate(addMonths(currentDate, 3));
        else if (timeFrame === 'Quarter') setCurrentDate(addMonths(currentDate, 12));
        else setCurrentDate(addYears(currentDate, 5));
    };

    const getTaskStyle = (task: TaskNode) => {
        const tStart = parseTaskDate(task.startDate);
        const tEnd = parseTaskDate(task.dueDate);
        
        const timelineStartMs = startDate.getTime();
        const timelineEndMs = endDate.getTime();
        const totalTimelineMs = timelineEndMs - timelineStartMs;
        const pxPerMs = totalTimelineWidth / totalTimelineMs;

        let left = (tStart.getTime() - timelineStartMs) * pxPerMs;
        let width = (tEnd.getTime() - tStart.getTime()) * pxPerMs;
        width = Math.max(width, 4); 
        
        if (left + width < 0 || left > totalTimelineWidth) return { display: 'none' };

        return {
            left: `${Math.max(0, left)}px`,
            width: `${width}px`,
            backgroundColor: task.color
        };
    };

    const handleBarMouseDown = (e: React.MouseEvent, task: TaskNode) => {
        e.stopPropagation();
        const tStart = parseTaskDate(task.startDate).getTime();
        const tEnd = parseTaskDate(task.dueDate).getTime();
        dragRef.current = {
            taskId: task.id,
            startX: e.clientX,
            startStart: tStart,
            startEnd: tEnd
        };
        setIsDragging(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // We don't update state here to avoid excessive re-renders,
            // but in a full implementation we could use a temporary local state for smooth visual feedback.
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (!dragRef.current) return;
            
            const dx = e.clientX - dragRef.current.startX;
            if (Math.abs(dx) > 5) { // Threshold to prevent accidental moves on click
                const timelineStartMs = startDate.getTime();
                const timelineEndMs = endDate.getTime();
                const totalTimelineMs = timelineEndMs - timelineStartMs;
                const pxPerMs = totalTimelineWidth / totalTimelineMs;
                
                const msDelta = (dx / pxPerMs);
                
                const newStart = new Date(dragRef.current.startStart + msDelta);
                const newEnd = new Date(dragRef.current.startEnd + msDelta);
                
                onUpdateTask(dragRef.current.taskId, {
                    startDate: formatOutputDate(newStart),
                    dueDate: formatOutputDate(newEnd)
                });
            }
            
            dragRef.current = null;
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, startDate, endDate, totalTimelineWidth, onUpdateTask]);

    return (
        <div className={`w-full h-full flex flex-col md:rounded-2xl border overflow-hidden shadow-2xl ${containerClass}`}>
            {/* Header Controls */}
            <div className={`h-14 md:h-16 border-b px-2 md:px-6 flex items-center justify-between flex-shrink-0 backdrop-blur-xl relative z-40 ${borderClass} ${headerBg}`}>
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="relative">
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`flex items-center gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm transition-colors shadow-sm border ${isLight ? 'bg-white text-slate-800 border-slate-200' : 'bg-white/10 text-white border-white/5'}`}
                        >
                            {timeFrame}
                            <ChevronDown size={14} />
                        </button>
                        
                        {isDropdownOpen && (
                            <div className={`absolute top-full left-0 mt-2 w-40 border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isLight ? 'bg-white border-slate-200' : 'bg-[#1e1e1e] border-gray-700'}`}>
                                {['Day', 'Week', 'Bi-week', 'Month', 'Quarter', 'Year', '5 Years'].map((tf) => (
                                    <button
                                        key={tf}
                                        onClick={() => {
                                            setTimeFrame(tf as TimeFrame);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                            timeFrame === tf 
                                            ? (isLight ? 'bg-blue-50 text-blue-600 font-bold' : 'bg-white/10 text-blue-400 font-bold') 
                                            : (isLight ? 'text-slate-600 hover:bg-slate-50' : 'text-gray-300 hover:bg-white/5')
                                        }`}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={`flex items-center gap-1 md:gap-2 rounded-lg p-1 border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/50 border-white/5'}`}>
                        <button onClick={handlePrev} className={`p-1 rounded-md transition-colors ${isLight ? 'hover:bg-white text-slate-500' : 'hover:bg-white/10 text-slate-400'}`}>
                            <ChevronLeft size={14} />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className={`px-2 md:px-3 text-[10px] md:text-xs font-bold transition-colors ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}>
                            Today
                        </button>
                        <button onClick={handleNext} className={`p-1 rounded-md transition-colors ${isLight ? 'hover:bg-white text-slate-500' : 'hover:bg-white/10 text-slate-400'}`}>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
                
                <div className={`flex items-center gap-1 md:gap-2 text-[10px] md:text-xs font-mono ${textMuted} hidden sm:flex`}>
                     <Calendar size={12} />
                     {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </div>
            </div>

            {/* Gantt Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-0">
                
                {/* Timeline Header */}
                <div className={`flex border-b ${borderClass} ${isLight ? 'bg-white/50' : 'bg-black/20'}`}>
                    <div ref={headerRef} className="flex-1 overflow-hidden flex">
                         {/* Task Column Header (Inline) */}
                         <div className={`w-40 md:w-64 flex-shrink-0 border-r p-2 md:p-3 text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-end ${borderClass} ${textMuted}`}>
                            Task
                         </div>
                         {columns.map((col, i) => (
                             <div 
                                key={i} 
                                style={{ width: col.width }} 
                                className={`flex-shrink-0 border-r p-1 md:p-2 flex flex-col justify-end items-center text-center ${borderClass}`}
                             >
                                <span className={`text-[9px] md:text-[10px] font-medium leading-tight ${textMuted}`}>{col.subLabel}</span>
                                <span className={`text-[10px] md:text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{col.label}</span>
                             </div>
                         ))}
                    </div>
                </div>

                {/* Scrollable Body */}
                <div ref={bodyRef} onScroll={handleBodyScroll} className="flex-1 overflow-auto custom-scrollbar relative">
                    {/* Width = Timeline Width + Task Column Width */}
                    <div className="relative" style={{ width: totalTimelineWidth + (window.innerWidth >= 768 ? 256 : 160) }}>
                        
                        {/* Grid Background */}
                        <div className="absolute inset-0 flex pl-40 md:pl-64 pointer-events-none">
                            {columns.map((col, i) => (
                                <div 
                                    key={i} 
                                    style={{ width: col.width }}
                                    className={`flex-shrink-0 border-r h-full ${gridLineColor} ${i % 2 === 0 ? (isLight ? 'bg-black/[0.01]' : 'bg-white/[0.01]') : ''}`} 
                                />
                            ))}
                        </div>

                        {/* Task Rows */}
                        {tasks.map((task, idx) => {
                            const style = getTaskStyle(task);
                            return (
                                <div 
                                    key={task.id} 
                                    className={`flex h-10 md:h-12 relative transition-colors group ${selectedTaskId === task.id ? (isLight ? 'bg-brand-500/10' : 'bg-brand-900/10') : (isLight ? 'hover:bg-white/40' : 'hover:bg-white/5')}`}
                                    onClick={() => onSelect(task.id)}
                                >
                                    {/* Task Column (Inline, No Sticky) */}
                                    <div className={`w-40 md:w-64 flex-shrink-0 border-r flex items-center px-2 md:px-4 transition-colors ${borderClass}`}>
                                        <div className={`w-2 h-2 rounded-full mr-2 md:mr-3 ${task.assignee.color}`} />
                                        <span className={`text-xs md:text-sm truncate font-medium ${textMain}`}>{task.title}</span>
                                    </div>

                                    {/* Bar Area */}
                                    <div className="flex-1 relative">
                                        {!style.display && (
                                            <div 
                                                className={`absolute top-2 md:top-3 h-5 md:h-6 rounded-full shadow-lg flex items-center px-2 md:px-3 cursor-grab active:cursor-grabbing hover:brightness-110 transition-all border ${isLight ? 'border-black/5' : 'border-white/10'}`}
                                                style={style as React.CSSProperties}
                                                onMouseDown={(e) => handleBarMouseDown(e, task)}
                                            >
                                                <span className="text-[9px] md:text-[10px] font-bold text-white/90 truncate drop-shadow-md select-none">{task.title}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
