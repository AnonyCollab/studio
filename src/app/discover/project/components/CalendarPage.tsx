
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { TaskNode, Theme, CalendarViewMode, FilterOption } from '../types';
import { PriorityIcon, StatusBadge } from './Plan';
import { useStore } from '../store/useStore';

interface CalendarPageProps {
    tasks: TaskNode[];
    theme: Theme;
    onAddTask: (task: Partial<TaskNode>) => void;
    view: CalendarViewMode;
    date: Date;
    setDate: (d: Date) => void;
    setView: (v: CalendarViewMode) => void;
    filter?: FilterOption;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const CalendarPage: React.FC<CalendarPageProps> = ({ tasks, theme, onAddTask, view, date, setDate, setView, filter = 'All' }) => {
    const { currentUser } = useStore();
    useEffect(() => {
        console.log("Current user role in CalendarPage:", currentUser?.role);
    }, [currentUser]);
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showMonthToast, setShowMonthToast] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // --- Filter Logic ---
    const filteredTasks = useMemo(() => {
        if (!currentUser) return [];
        const currentUserName = currentUser.displayName;
        const currentTeam = currentUser.teamName;

        switch(filter) {
            case 'Mine':
                return tasks.filter(t => t.assignee.displayName === currentUserName);
            case 'Team':
                return tasks.filter(t => t.assignee.displayName === currentTeam || t.assignee.type === 'team');
            case 'Project':
                // For Calendar Project view, we generally show everything, 
                // as "Root only" doesn't make sense in a timeline.
                return tasks; 
            case 'All':
            default:
                return tasks;
        }
    }, [tasks, filter, currentUser]);

    // --- Helpers ---

    const formatDateString = (date: Date) => {
        const m = SHORT_MONTHS[date.getMonth()];
        const d = date.getDate().toString().padStart(2, '0');
        return `${m} ${d}`;
    };

    const parseDate = (str: string) => {
        const currentYear = new Date().getFullYear();
        const strToParse = str.match(/\d{4}/) ? str : `${str} ${currentYear}`;
        const d = new Date(strToParse);
        return isNaN(d.getTime()) ? null : d;
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        
        const startPadding = firstDay.getDay();
        for (let i = 0; i < startPadding; i++) {
            // Previous month padding
            const prevDate = new Date(year, month, -startPadding + i + 1);
            days.push({ date: prevDate, isCurrentMonth: false });
        }
        
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }

        // Fill remaining slots to complete 6 weeks (42 days)
        const remainingSlots = 42 - days.length;
        for (let i = 1; i <= remainingSlots; i++) {
             days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }
        
        return days;
    };

    const getTasksForDay = (targetDate: Date) => {
        return filteredTasks.filter(task => {
            const taskDate = parseDate(task.dueDate);
            if (!taskDate) return false;
            return taskDate.getDate() === targetDate.getDate() && 
                   taskDate.getMonth() === targetDate.getMonth() && 
                   taskDate.getFullYear() === targetDate.getFullYear();
        });
    };

    // --- View Logic Helpers ---

    // Returns array of dates to display based on current view
    const getViewDates = () => {
        const dates: Date[] = [];
        const start = new Date(date);
        start.setHours(0,0,0,0);

        if (view === 'Day') {
            dates.push(new Date(start));
        } else if (view === '3 Days') {
            const daysToShow = isDesktop ? 4 : 3;
            for(let i=0; i<daysToShow; i++) {
                const d = new Date(start);
                d.setDate(d.getDate() + i);
                dates.push(d);
            }
        } else if (view === 'Week') {
            // Start from Sunday
            const day = start.getDay();
            const diff = start.getDate() - day; 
            start.setDate(diff);
            for(let i=0; i<7; i++) {
                const d = new Date(start);
                d.setDate(d.getDate() + i);
                dates.push(d);
            }
        }
        return dates;
    };

    // Schedule View Groups
    const scheduleGroups = useMemo(() => {
        if (view !== 'Schedule') return [];
        
        const groups: Record<string, TaskNode[]> = {};
        const today = new Date(date);
        today.setHours(0,0,0,0);

        filteredTasks.forEach(task => {
             const dateObj = parseDate(task.dueDate);
             if (!dateObj) return;
             
             // Only show tasks from the selected date onwards to make navigation meaningful
             if (dateObj.getTime() < today.getTime()) return;

             const key = dateObj.toDateString(); 
             if (!groups[key]) groups[key] = [];
             groups[key].push(task);
        });

        // Sort dates
        const sortedKeys = Object.keys(groups).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        
        return sortedKeys.map(key => ({
            date: new Date(key),
            tasks: groups[key]
        }));
    }, [filteredTasks, view, date]);

    // --- Handlers ---

    const handlePrev = () => {
        const newDate = new Date(date);
        if (view === 'Month') {
            newDate.setMonth(newDate.getMonth() - 1);
            newDate.setDate(1);
        } else if (view === 'Week') {
            newDate.setDate(newDate.getDate() - 7);
        } else if (view === '3 Days') {
            const daysToJump = isDesktop ? 4 : 3;
            newDate.setDate(newDate.getDate() - daysToJump);
        } else {
            newDate.setDate(newDate.getDate() - 1);
        }
        setDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(date);
        if (view === 'Month') {
            newDate.setMonth(newDate.getMonth() + 1);
            newDate.setDate(1);
        } else if (view === 'Week') {
            newDate.setDate(newDate.getDate() + 7);
        } else if (view === '3 Days') {
            const daysToJump = isDesktop ? 4 : 3;
            newDate.setDate(newDate.getDate() + daysToJump);
        } else {
            newDate.setDate(newDate.getDate() + 1);
        }
        setDate(newDate);
    };

    const handleDayClick = (targetDate: Date, hour?: number) => {
        const dateStr = formatDateString(targetDate);
        onAddTask({ 
            title: 'New Task', 
            startDate: dateStr, 
            dueDate: dateStr,
            description: `Task for ${targetDate.toDateString()}${hour !== undefined ? ` at ${hour}:00` : ''}`
        });
    };

    const isToday = (targetDate: Date) => {
        const today = new Date();
        return targetDate.getDate() === today.getDate() && 
               targetDate.getMonth() === today.getMonth() && 
               targetDate.getFullYear() === today.getFullYear();
    };

    // Scroll to 8 AM on mount for timeline views
    useEffect(() => {
        if (view !== 'Month' && view !== 'Schedule' && scrollRef.current) {
            scrollRef.current.scrollTop = 480; 
        }
    }, [view]);

    // Handle Month Toast visibility
    useEffect(() => {
        if (view === 'Month') {
            setShowMonthToast(true);
            const timer = setTimeout(() => setShowMonthToast(false), 2000);
            return () => clearTimeout(timer);
        } else {
            setShowMonthToast(false);
        }
    }, [date, view]);

    // --- Styles ---
    const containerClass = isLight ? "bg-white/60 border-black/5" : "bg-black/40 border-white/10";
    const headerText = isLight ? "text-slate-800" : "text-slate-100";
    const mutedText = isLight ? "text-slate-500" : "text-slate-400";
    const borderClass = isLight ? "border-black/5" : "border-white/5";
    const dayBg = isLight ? "bg-white/40 hover:bg-white/80" : "bg-white/5 hover:bg-white/10";
    const otherMonthBg = isLight ? "bg-slate-50/30" : "bg-white/[0.02]";
    const todayClass = isLight ? "bg-blue-50 border-blue-200" : "bg-blue-900/20 border-blue-800";
    const activeToggle = isLight ? "bg-white shadow-sm text-slate-900" : "bg-white/10 text-white shadow-sm";
    const inactiveToggle = isLight ? "text-slate-500 hover:text-slate-700" : "text-slate-400 hover:text-white";

    const viewDates = getViewDates();

    return (
        <div className="w-full h-full p-0 lg:p-8 overflow-hidden relative">
            
            {/* Temporary Month Toast */}
            <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full backdrop-blur-xl shadow-2xl z-[100] transition-all duration-500 pointer-events-none ${isLight ? 'bg-white/90 text-slate-900' : 'bg-black/80 text-white'} ${showMonthToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <span className="font-bold text-sm tracking-widest uppercase">
                    {MONTHS[date.getMonth()]} {date.getFullYear()}
                </span>
            </div>

            <div className="max-w-7xl mx-auto h-full flex flex-col pb-32 lg:pb-0">
                
                {/* Desktop Header */}
                <div className="hidden lg:flex items-center justify-between mb-4 min-h-[44px]">
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center rounded-lg p-1 border ${borderClass} ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>
                            <button onClick={handlePrev} className={`p-1.5 rounded-md transition-colors ${isLight ? 'hover:bg-white text-slate-600' : 'hover:bg-white/10 text-slate-300'}`}><ChevronLeft size={18}/></button>
                            <button onClick={() => setDate(new Date())} className={`px-3 text-xs font-bold uppercase transition-colors ${isLight ? 'text-slate-600 hover:text-brand-600' : 'text-slate-300 hover:text-brand-400'}`}>Today</button>
                            <button onClick={handleNext} className={`p-1.5 rounded-md transition-colors ${isLight ? 'hover:bg-white text-slate-600' : 'hover:bg-white/10 text-slate-300'}`}><ChevronRight size={18}/></button>
                        </div>
                        <h2 className={`text-2xl font-bold ${headerText}`}>
                            {view === 'Schedule' ? 'Schedule' : 
                             view === 'Month' ? `${MONTHS[date.getMonth()]} ${date.getFullYear()}` :
                             viewDates.length > 0 ? `${formatDateString(viewDates[0])} - ${formatDateString(viewDates[viewDates.length-1])}, ${date.getFullYear()}` : ''}
                        </h2>
                    </div>

                    <div className={`flex p-1 rounded-xl border ${containerClass}`}>
                        {['Month', 'Week', '3 Days', 'Day', 'Schedule'].map((v) => (
                             <button 
                                key={v}
                                onClick={() => setView(v as CalendarViewMode)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${view === v ? activeToggle : inactiveToggle}`}
                            >
                                {v === 'Month' ? <CalendarIcon size={16} /> : <Clock size={16} />} {v === '3 Days' && isDesktop ? '4 Days' : v}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className={`flex-1 rounded-none lg:rounded-2xl border-y lg:border shadow-xl overflow-hidden flex flex-col min-h-[400px] ${containerClass}`}>
                    
                    {view === 'Month' && (
                         <div className="flex flex-col h-full">
                            {/* Weekday Header */}
                            <div className={`grid grid-cols-7 border-b ${borderClass} ${isLight ? 'bg-slate-50/50' : 'bg-black/20'}`}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                    <div key={day} className={`py-2 lg:py-4 text-center text-xs lg:text-sm font-bold uppercase tracking-wider ${mutedText}`}>
                                        {day}
                                    </div>
                                ))}
                            </div>
                            {/* Month Grid */}
                            <div className="flex-1 grid grid-cols-7 grid-rows-6 overflow-y-auto custom-scrollbar">
                                {getDaysInMonth(date).map((dayObj, idx) => {
                                    const { date: d, isCurrentMonth } = dayObj;
                                    const dayTasks = getTasksForDay(d);
                                    const today = isToday(d);

                                    return (
                                        <div 
                                            key={idx} 
                                            onClick={() => handleDayClick(d)}
                                            className={`
                                                border-b border-r p-1 lg:p-3 transition-colors relative group flex flex-col gap-1 lg:gap-2 cursor-pointer 
                                                ${borderClass} 
                                                ${today ? todayClass : (isCurrentMonth ? dayBg : otherMonthBg)}
                                            `}
                                        >
                                            <div className="flex justify-between items-start pointer-events-none">
                                                <span className={`text-xs lg:text-sm font-bold ${today ? 'text-brand-500' : (isCurrentMonth ? mutedText : 'opacity-30')}`}>
                                                    {d.getDate()} {d.getDate() === 1 && isCurrentMonth && <span className="lg:hidden ml-1">{MONTHS[d.getMonth()].substring(0,3)}</span>}
                                                </span>
                                                <div className="opacity-0 group-hover:opacity-100 p-1 bg-brand-500 text-white rounded-full transition-all hidden lg:block shadow-sm">
                                                    <Plus size={10} />
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                                                {dayTasks.map(task => (
                                                    <div 
                                                        key={task.id} 
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={`p-1 lg:p-1.5 rounded text-[8px] lg:text-[10px] border border-l-4 shadow-sm cursor-pointer hover:brightness-110 transition-all ${isLight ? 'bg-white' : 'bg-[#1e1e1e]'} ${isLight ? 'border-slate-100' : 'border-white/5'}`}
                                                        style={{ borderLeftColor: task.priority === 'Critical' ? '#ef4444' : task.color }}
                                                    >
                                                        <div className={`font-bold truncate mb-0.5 ${headerText}`}>{task.title}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                         </div>
                    )}

                    {view === 'Schedule' && (
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
                             <div className="max-w-3xl mx-auto space-y-8">
                                 {scheduleGroups.length === 0 && (
                                     <div className="flex flex-col items-center justify-center py-12 opacity-50">
                                         <CalendarIcon size={48} className="mb-4" strokeWidth={1}/>
                                         <p className="text-lg">No upcoming tasks scheduled.</p>
                                         <button onClick={() => onAddTask({ startDate: formatDateString(date), dueDate: formatDateString(date) })} className="mt-4 text-brand-500 hover:underline text-sm font-bold uppercase">
                                             Add a task
                                         </button>
                                     </div>
                                 )}
                                 {scheduleGroups.map((group, i) => (
                                     <div key={i} className="flex gap-4 lg:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                                         <div className="w-16 lg:w-24 flex-shrink-0 text-right pt-2">
                                             <div className={`text-xl lg:text-2xl font-bold ${isToday(group.date) ? 'text-brand-500' : headerText}`}>{group.date.getDate()}</div>
                                             <div className={`text-[10px] lg:text-xs font-bold uppercase ${isToday(group.date) ? 'text-brand-500' : mutedText}`}>{SHORT_MONTHS[group.date.getMonth()]}</div>
                                             <div className={`text-[10px] lg:text-xs ${mutedText}`}>{group.date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                         </div>
                                         <div className="flex-1 space-y-3 border-l-2 pl-4 lg:pl-6 pb-6 border-dashed border-slate-700/30">
                                             {group.tasks.map(task => (
                                                 <div key={task.id} className={`p-4 rounded-xl border shadow-sm transition-all hover:scale-[1.01] ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                                                     <div className="flex justify-between items-start mb-2">
                                                         <h4 className={`font-bold ${headerText}`}>{task.title}</h4>
                                                         <StatusBadge status={task.status} />
                                                     </div>
                                                     <div className="flex items-center gap-4 text-xs">
                                                         <div className="flex items-center gap-1">
                                                             <PriorityIcon priority={task.priority} /> 
                                                             <span className={mutedText}>{task.priority}</span>
                                                         </div>
                                                         <div className={`px-2 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'}`}>
                                                            Due {task.dueDate}
                                                         </div>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    )}

                    {(view === 'Day' || view === '3 Days' || view === 'Week') && (
                        <div className="flex-1 flex flex-col overflow-hidden" ref={scrollRef}>
                             {/* Sticky Timeline Header */}
                            <div className={`sticky top-0 z-50 flex border-b ${borderClass} ${isLight ? 'bg-white/95 backdrop-blur-xl' : 'bg-[#020617]/95 backdrop-blur-xl'}`}>
                                {/* Top Left Corner / Spacer */}
                                <div className={`${view === 'Week' ? 'w-10' : 'w-16 lg:w-20'} p-1 lg:p-2 border-r ${borderClass} flex-shrink-0 flex flex-col items-center justify-center text-center leading-tight`}>
                                    <span className={`font-bold uppercase text-[8px] lg:text-xs ${mutedText} lg:hidden`}>{SHORT_MONTHS[date.getMonth()]}</span>
                                    <span className={`text-[8px] lg:text-xs ${mutedText} lg:hidden`}>{date.getFullYear()}</span>
                                </div>
                                
                                {/* Day Column Headers */}
                                <div className="flex-1 flex min-w-0">
                                    {viewDates.map((d, i) => {
                                        const today = isToday(d);
                                        const isWeekView = view === 'Week';
                                        return (
                                            <div key={i} className={`flex-1 min-w-0 ${isWeekView ? 'p-1' : 'p-2 lg:p-3'} text-center border-r last:border-r-0 ${borderClass} ${today ? (isLight ? 'bg-blue-50/50' : 'bg-blue-900/10') : ''}`}>
                                                <div className={`${isWeekView ? 'text-[9px]' : 'text-[10px] lg:text-xs'} font-bold uppercase mb-1 truncate ${today ? 'text-brand-500' : mutedText}`}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                <div className={`${isWeekView ? 'text-sm w-6 h-6' : 'text-lg lg:text-2xl w-8 h-8 lg:w-10 lg:h-10'} font-bold rounded-full flex items-center justify-center mx-auto ${today ? 'bg-brand-500 text-white shadow-lg' : headerText}`}>
                                                    {d.getDate()}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Timeline Grid */}
                            <div className="divide-y divide-dashed divide-white/5">
                                {Array.from({ length: 24 }).map((_, hour) => (
                                    <div key={hour} className="flex min-h-[60px]">
                                        {/* Time Column */}
                                        <div className={`${view === 'Week' ? 'w-10 p-1 text-[8px]' : 'w-16 lg:w-20 p-2 text-xs'} text-right border-r flex-shrink-0 sticky left-0 z-30 ${isLight ? 'bg-white/90' : 'bg-[#020617]/90'} ${borderClass} ${mutedText}`}>
                                            <span className="-translate-y-2 block">
                                                {hour === 0 ? '12A' : hour < 12 ? `${hour}A` : hour === 12 ? '12P' : `${hour - 12}P`}
                                            </span>
                                        </div>

                                        {/* Day Slots */}
                                        <div className="flex-1 flex min-w-0">
                                            {viewDates.map((d, dayIndex) => {
                                                const dayTasks = getTasksForDay(d);
                                                // Note: In a real app, filter by time as well
                                                const tasksInSlot = hour === 9 ? dayTasks : []; // Mock logic for now
                                                
                                                return (
                                                    <div 
                                                        key={dayIndex} 
                                                        onClick={() => handleDayClick(d, hour)}
                                                        className={`flex-1 min-w-0 relative border-r last:border-r-0 group hover:bg-brand-500/5 transition-colors cursor-pointer ${borderClass}`}
                                                    >
                                                        <div className={`absolute top-1/2 w-full border-t border-dashed opacity-30 pointer-events-none ${borderClass}`}></div>
                                                        <div className="p-1 space-y-1 relative z-10">
                                                            {tasksInSlot.map(t => (
                                                                <div 
                                                                    key={t.id} 
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className={`p-1 rounded border text-[8px] shadow-sm hover:scale-[1.02] transition-transform cursor-pointer truncate ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-white/10'}`}
                                                                    style={{ borderLeft: `2px solid ${t.color}` }}
                                                                >
                                                                    <div className={`font-bold truncate ${headerText}`}>{t.title}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Current Time Indicator (Mock) */}
                            <div className="absolute left-0 w-full flex items-center pointer-events-none z-20" style={{ top: '540px' }}>
                                <div className={`${view === 'Week' ? 'w-10 pr-1' : 'w-16 lg:w-20 pr-2'} text-right text-[8px] font-bold text-red-500`}>9:00</div>
                                <div className="flex-1 h-px bg-red-500 relative">
                                    <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Mobile Navigation Controls */}
            <button 
                onClick={handlePrev}
                className={`fixed bottom-6 left-4 z-[110] lg:hidden p-4 transition-transform active:scale-95 ${isLight ? 'text-slate-700' : 'text-white'}`}
            >
                <ChevronLeft size={28} />
            </button>
            
            <button 
                onClick={handleNext}
                className={`fixed bottom-6 right-4 z-[110] lg:hidden p-4 transition-transform active:scale-95 ${isLight ? 'text-slate-700' : 'text-white'}`}
            >
                <ChevronRight size={28} />
            </button>
        </div>
    );
};
