
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Plus, ZoomIn, ZoomOut, MousePointer2, BoxSelect, Maximize2, Crown, ArrowDownToLine, CheckSquare, CornerDownRight, Flag, Target, Zap, BookOpen, ArrowRightCircle } from 'lucide-react';
import { TaskNode, Theme, TaskType, Status } from '../../types';
import { StatusBadge, PriorityIcon } from '../Plan';
import { MOCK_ASSIGNEES } from '../../constants';

interface CanvasViewProps {
    tasks: TaskNode[];
    scale: number;
    setScale: React.Dispatch<React.SetStateAction<number>>;
    onUpdateTask: (id: string, updates: Partial<TaskNode>) => void;
    onUpdateTaskConnections: (startId: string, targetId: string) => void;
    selectedTaskId: string | null;
    selectedTaskIds: string[];
    onSelect: (id: string | null, openModal?: boolean) => void;
    onSelectTasks: (ids: string[]) => void;
    onAdd: (overrides?: Partial<TaskNode>) => void;
    onFocus: (id: string) => void;
    focusedParentId: string | null;
    theme: Theme;
    isReadOnly?: boolean;
    onMove?: (taskId: string, newParentId: string | null) => void;
}

const MAX_CANVAS_WIDTH = 1536;
const CARD_WIDTH = 280;
const CENTRAL_Y = 180; 
const PROJECT_ROOT_ID = 'PROJECT-ROOT-NODE';
const PROJECT_ROOT_HEIGHT_BUFFER = 400; 

const getStatusColor = (status: Status): string => {
    switch (status) {
        case 'Done': return '#10b981';       
        case 'In Progress': return '#3b82f6'; 
        case 'Review': return '#f59e0b';      
        case 'Backlog': return '#64748b';     
        default: return '#64748b';
    }
};

const getStructuralColor = (type: TaskType): string => {
    if (type === 'Milestone') return '#ef4444'; 
    return '#eab308'; 
};

const getConnectionPoints = (
    startPos: {x: number, y: number}, 
    endPos: {x: number, y: number}, 
    startHeight: number = 160, 
    endHeight: number = 160
) => {
    const startW = CARD_WIDTH;
    const endW = CARD_WIDTH;
    const startH = startHeight;
    const endH = endHeight;

    // Only use Top and Bottom anchors for vertical flow
    const getAnchors = (pos: {x: number, y: number}, w: number, h: number) => [
        { x: pos.x + w/2, y: pos.y, dir: -1 },      // Top (Up)
        { x: pos.x + w/2, y: pos.y + h, dir: 1 },   // Bottom (Down)
    ];

    const startAnchors = getAnchors(startPos, startW, startH);
    const endAnchors = getAnchors(endPos, endW, endH);

    let bestStart = startAnchors[0];
    let bestEnd = endAnchors[0];
    let minDst = Infinity;

    // Logic to prefer Bottom -> Top flow if nodes are stacked
    startAnchors.forEach(s => {
        endAnchors.forEach(e => {
            let d = Math.hypot(s.x - e.x, s.y - e.y);
            
            // Penalty for reverse flow (e.g. Bottom to Bottom or Top to Top) to encourage S-curves
            if (s.dir === e.dir) d += 100;
            
            if (d < minDst) {
                minDst = d;
                bestStart = s;
                bestEnd = e;
            }
        });
    });
    
    return { start: bestStart, end: bestEnd };
};

const ConnectionLine = React.memo(({ start, end, color, isLight }: { start: {x:number, y:number, dir: number}, end: {x:number, y:number, dir: number}, color: string, isLight: boolean }) => {
    const curviness = 80;
    
    const cp1X = start.x;
    const cp1Y = start.y + (curviness * start.dir);
    const cp2X = end.x;
    const cp2Y = end.y + (curviness * end.dir);
    
    const strokeColor = isLight ? "#94a3b8" : "#475569"; 

    // Arrowhead calculation at end point
    // Tangent at end point roughly follows vector from cp2 to end
    const vx = end.x - cp2X;
    const vy = end.y - cp2Y;
    const len = Math.hypot(vx, vy) || 1;
    const nx = vx / len;
    const ny = vy / len;
    
    const arrowLen = 6;
    const arrowWid = 4;
    
    // Perpendicular vector
    const px = -ny;
    const py = nx;

    const tip = end;
    const leftBase = {
        x: end.x - (nx * arrowLen) + (px * arrowWid),
        y: end.y - (ny * arrowLen) + (py * arrowWid)
    };
    const rightBase = {
        x: end.x - (nx * arrowLen) - (px * arrowWid),
        y: end.y - (ny * arrowLen) - (py * arrowWid)
    };

    return (
      <g>
        <path 
          d={`M ${start.x} ${start.y} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${end.x} ${end.y}`}
          fill="none" 
          stroke={strokeColor} 
          strokeWidth={2} 
          className="opacity-60"
        />
        <polygon 
            points={`${tip.x},${tip.y} ${leftBase.x},${leftBase.y} ${rightBase.x},${rightBase.y}`}
            fill={strokeColor}
            className="opacity-80"
        />
        <circle cx={start.x} cy={start.y} r="3" fill={strokeColor} className="opacity-80" />
      </g>
    );
}, (prev, next) => {
    return prev.start.x === next.start.x && prev.start.y === next.start.y && prev.end.x === next.end.x && prev.end.y === next.end.y && prev.color === next.color;
});

const TaskCard = React.memo(({ 
    task, 
    isSelected, 
    onMouseDown, 
    onConnectStart, 
    onFocus,
    onDoubleClick,
    isLight,
    isCentral,
    isReadOnly,
    onResize
}: { 
    task: TaskNode, 
    isSelected: boolean, 
    onMouseDown: (e: React.MouseEvent, id: string) => void,
    onConnectStart: (e: React.MouseEvent, id: string, offsetX: number, offsetY: number) => void,
    onFocus: (id: string) => void,
    onDoubleClick: (id: string) => void,
    isLight: boolean,
    isCentral?: boolean,
    isReadOnly?: boolean,
    onResize?: (id: string, height: number) => void
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (!cardRef.current || !onResize) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                onResize(task.id, entry.contentRect.height);
            }
        });
        resizeObserver.observe(cardRef.current);
        onResize(task.id, cardRef.current.offsetHeight);
        return () => resizeObserver.disconnect();
    }, [task.id, onResize, task.title, task.checklist]); 

    let statusColor = getStatusColor(task.status);
    const isMilestone = task.type === 'Milestone';
    
    const isRootNode = isCentral; 

    const bgClass = isLight ? 'bg-white/90' : 'bg-[#18181b]/90';
    let borderClass = isSelected 
        ? 'border-brand-500 ring-4 ring-brand-500/20 z-20' 
        : (isLight ? 'border-slate-200 hover:border-slate-400 z-10' : 'border-slate-700 hover:border-slate-500 z-10');
    borderClass += ` border-l-4`;

    if (isRootNode) {
        borderClass = 'border-amber-500 ring-4 ring-amber-500/30 z-30 shadow-amber-500/20';
    }

    const textTitleClass = isLight ? 'text-slate-900' : 'text-slate-100';
    const textMuted = isLight ? 'text-slate-500' : 'text-slate-500';
    const buttonClass = isLight ? 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-brand-500 hover:text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-brand-600';
    const avatarShape = task.assignee.type === 'team' ? 'rounded-md' : 'rounded-full';
    
    const canDrag = !isReadOnly && !isRootNode; 

    const cardHeight = cardRef.current?.offsetHeight ?? 160;

    return (
        <div 
            ref={cardRef}
            className={`absolute w-[280px] backdrop-blur-sm rounded-2xl border shadow-2xl transition-shadow group select-none will-change-transform pointer-events-auto
            ${bgClass} ${borderClass}`} 
            style={{ 
                transform: `translate(${task.position.x}px, ${task.position.y}px)`,
                borderLeftColor: isRootNode ? '#f59e0b' : statusColor
            }} 
            onMouseDown={(e) => canDrag && onMouseDown(e, task.id)}
            onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(task.id); }}
        >
            {isRootNode && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-white p-1.5 rounded-full shadow-lg z-40 animate-in zoom-in duration-300">
                    <Crown size={20} fill="currentColor" />
                </div>
            )}

            {!isReadOnly && (
                <div className="absolute inset-0 pointer-events-none group-hover:pointer-events-auto">
                    {/* Top Connector */}
                    <div onMouseDown={(e) => onConnectStart(e, task.id, 140, 0)} className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-6 h-3 bg-slate-400/50 rounded-full cursor-crosshair opacity-0 group-hover:opacity-100 hover:bg-brand-500 transition-opacity z-30 hover:scale-125" title="Connect"></div>
                    {/* Bottom Connector */}
                    <div onMouseDown={(e) => onConnectStart(e, task.id, 140, cardHeight)} className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-6 h-3 bg-slate-400/50 rounded-full cursor-crosshair opacity-0 group-hover:opacity-100 hover:bg-brand-500 transition-opacity z-30 hover:scale-125" title="Connect"></div>
                </div>
            )}
            
            <div className={`${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}>
                <div className="h-3 w-full rounded-t-2xl pointer-events-none" style={{ backgroundColor: isRootNode ? '#f59e0b' : statusColor }}></div>
                <div className="p-4 relative">
                    <div className="flex justify-between items-start mb-3 pointer-events-none">
                        <div className="flex items-center gap-1">
                            {isMilestone && <Flag size={12} className="text-red-500" />}
                            {task.type === 'Goal' && <Target size={12} className="text-purple-500" />}
                            {task.type === 'Epic' && <Zap size={12} className="text-emerald-500" />}
                            {task.type === 'Story' && <BookOpen size={12} className="text-blue-500" />}
                            {task.type === 'Issue' && <CheckSquare size={12} className="text-yellow-500" />}
                            {task.type === 'Sub-issue' && <CornerDownRight size={12} className="text-slate-500" />}
                            <span className={`text-[10px] font-mono uppercase tracking-wider ${textMuted}`}>{task.id === PROJECT_ROOT_ID ? 'PROJECT' : task.type || 'Task'}</span>
                        </div>
                        <div className="flex items-center gap-1 pointer-events-auto">
                            <div className={`w-6 h-6 ${avatarShape} ${task.assignee.color} flex items-center justify-center text-[10px] font-bold text-white ring-2 ${isLight ? 'ring-white' : 'ring-slate-800'}`}>{task.assignee.initials}</div>
                            {!isRootNode && (
                                <button 
                                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${buttonClass}`}
                                    onClick={(e) => { e.stopPropagation(); onFocus(task.id); }}
                                >
                                    <ArrowRightCircle size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                    <h4 className={`font-bold text-base mb-3 pointer-events-none leading-snug line-clamp-2 ${textTitleClass}`}>{task.title}</h4>
                    
                    <div className="flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-2">
                            <StatusBadge status={task.status} />
                            {task.size && (
                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                                    <Maximize2 size={8} />
                                    {task.size}
                                </span>
                            )}
                        </div>
                        <div className={`p-1.5 rounded-lg`}>
                             <PriorityIcon priority={task.priority} size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}, (prev, next) => {
    return (
        prev.task === next.task && 
        prev.isSelected === next.isSelected &&
        prev.isLight === next.isLight &&
        prev.isCentral === next.isCentral &&
        prev.isReadOnly === next.isReadOnly
    );
});

export const CanvasView: React.FC<CanvasViewProps> = ({ 
    tasks: initialTasks, 
    scale, 
    setScale, 
    onUpdateTask,
    onUpdateTaskConnections,
    selectedTaskId, 
    selectedTaskIds,
    onSelect, 
    onSelectTasks,
    onAdd, 
    onFocus,
    focusedParentId,
    theme,
    isReadOnly,
    onMove
}) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [cardHeights, setCardHeights] = useState<Record<string, number>>({});
    const [localTasks, setLocalTasks] = useState(initialTasks);

    useEffect(() => {
        setLocalTasks(initialTasks);
    }, [initialTasks]);

    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const [activeTool, setActiveTool] = useState<'pointer' | 'select'>('pointer');
    const [responsiveScale, setResponsiveScale] = useState(1);
    const effectiveScale = scale * responsiveScale;

    const canvasHeight = useMemo(() => {
        const maxY = Math.max(...localTasks.map(t => t.position.y), 0);
        return Math.max(4000, maxY + 800); 
    }, [localTasks]);

    const handleCardResize = useCallback((id: string, height: number) => {
        setCardHeights(prev => {
            if (prev[id] === height) return prev;
            return { ...prev, [id]: height };
        });
    }, []);

    const renderTasks = useMemo(() => {
        if (!focusedParentId) {
            const projectRoot: TaskNode = {
                id: PROJECT_ROOT_ID,
                title: 'OmniCanvas',
                description: 'Project Root',
                status: 'In Progress',
                priority: 'High',
                type: 'Milestone',
                assignee: MOCK_ASSIGNEES[0],
                startDate: '2023-01-01',
                dueDate: '2024-12-31',
                color: '#f59e0b',
                position: { x: (MAX_CANVAS_WIDTH - CARD_WIDTH) / 2, y: CENTRAL_Y },
                next: [],
                prev: [],
                childrenIds: [],
                size: 'XL',
                history: [],
                attachments: [],
                checklist: []
            };
            return [projectRoot, ...localTasks];
        }
        return localTasks;
    }, [localTasks, focusedParentId]);

    const tasksRef = useRef(renderTasks);
    tasksRef.current = renderTasks; 
    const selectedIdsRef = useRef(selectedTaskIds);
    selectedIdsRef.current = selectedTaskIds;

    const dragRef = useRef<{
        potentialDrag: boolean; 
        isDragging: boolean;
        startMouse: { x: number, y: number };
        draggedIds: string[];
        initialPositions: Record<string, {x: number, y: number}>;
        maxY: number | null; // Changed from minY to maxY
    }>({ potentialDrag: false, isDragging: false, startMouse: {x:0, y:0}, draggedIds: [], initialPositions: {}, maxY: null });


    const selectRef = useRef<{
        isSelecting: boolean;
        startX: number;
        startY: number;
        currentX: number;
        currentY: number;
    }>({ isSelecting: false, startX: 0, startY: 0, currentX: 0, currentY: 0 });
    const [selectionBox, setSelectionBox] = useState<{x: number, y: number, w: number, h: number} | null>(null);

    const connectRef = useRef<{
        isConnecting: boolean;
        startTaskId: string | null;
        startX: number;
        startY: number;
    }>({ isConnecting: false, startTaskId: null, startX: 0, startY: 0 });

    const rAF = useRef<number | null>(null);
    const mouseRef = useRef<{ x: number, y: number } | null>(null);
    const snapRef = useRef<{taskId: string, x: number, y: number} | null>(null);
    
    const [tempLine, setTempLine] = useState<{x1: number, y1: number, x2: number, y2: number} | null>(null);
    const [snapVisual, setSnapVisual] = useState<{x: number, y: number} | null>(null);

    useEffect(() => {
        const handleResize = () => {
            const ratio = Math.min(window.innerWidth / MAX_CANVAS_WIDTH, 1);
            setResponsiveScale(ratio);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const updateLoop = () => {
        if (!mouseRef.current || !canvasRef.current) { rAF.current = null; return; }
        
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = mouseRef.current.x;
        const mouseY = mouseRef.current.y;
        const canvasX = (mouseX - rect.left + canvasRef.current.scrollLeft) / effectiveScale;
        const canvasY = (mouseY - rect.top + canvasRef.current.scrollTop) / effectiveScale;

        if (!isReadOnly && dragRef.current.potentialDrag) {
            const moveDist = Math.hypot(mouseX - dragRef.current.startMouse.x, mouseY - dragRef.current.startMouse.y);
            if (moveDist > 5) {
                dragRef.current.isDragging = true;
                dragRef.current.potentialDrag = false;
            }
        }

        if (dragRef.current.isDragging && !isReadOnly) {
            const dx = (mouseX - dragRef.current.startMouse.x) / effectiveScale;
            const dy = (mouseY - dragRef.current.startMouse.y) / effectiveScale;
            const maxY = dragRef.current.maxY;

            setLocalTasks(prev => prev.map(t => {
                if (dragRef.current.draggedIds.includes(t.id)) {
                    const initial = dragRef.current.initialPositions[t.id];
                    if (initial) {
                        let newX = initial.x + dx;
                        let newY = initial.y + dy;
                        
                        newX = Math.max(0, Math.min(MAX_CANVAS_WIDTH - CARD_WIDTH, newX));
                        
                        const cardHeight = cardHeights[t.id] || 160;

                        if (maxY !== null) {
                            newY = Math.min(newY, maxY - cardHeight - 20); // 20px buffer above the line
                        }
                        
                        // General minimum Y boundary
                        newY = Math.max(newY, CENTRAL_Y + (focusedParentId ? 200 : PROJECT_ROOT_HEIGHT_BUFFER));
                        
                        return { ...t, position: { x: newX, y: newY } };
                    }
                }
                return t;
            }));
        }

        if (selectRef.current.isSelecting) {
            selectRef.current.currentX = canvasX;
            selectRef.current.currentY = canvasY;
            const x = Math.min(selectRef.current.startX, canvasX);
            const y = Math.min(selectRef.current.startY, canvasY);
            const w = Math.abs(selectRef.current.startX - canvasX);
            const h = Math.abs(selectRef.current.startY - canvasY);
            setSelectionBox({ x, y, w, h });
        }

        if (connectRef.current.isConnecting && !isReadOnly) {
            let bestSnap = null;
            let minDistanceToCenter = Infinity;

            tasksRef.current.forEach(t => {
                if (t.id === connectRef.current.startTaskId) return;
                const isCentral = (focusedParentId && t.id === focusedParentId) || t.id === PROJECT_ROOT_ID;
                const posX = isCentral ? (MAX_CANVAS_WIDTH - CARD_WIDTH) / 2 : t.position.x;
                const posY = isCentral ? CENTRAL_Y : t.position.y; 
                const height = cardHeights[t.id] || 160;
                const width = CARD_WIDTH;
                const padding = 200; 
                
                const nodes = [
                    { x: posX + width/2, y: posY }, 
                    { x: posX + width/2, y: posY + height }
                ];

                for (const node of nodes) {
                    const dist = Math.hypot(canvasX - node.x, canvasY - node.y);
                    if (dist < padding && dist < minDistanceToCenter) {
                        minDistanceToCenter = dist;
                        bestSnap = { taskId: t.id, x: node.x, y: node.y };
                    }
                }
            });
            
            snapRef.current = bestSnap;
            const newSnapVisual = bestSnap ? { x: bestSnap.x, y: bestSnap.y } : null;
            if ((!snapVisual && newSnapVisual) || (snapVisual && !newSnapVisual) || (snapVisual && newSnapVisual && (snapVisual.x !== newSnapVisual.x || snapVisual.y !== newSnapVisual.y))) {
                setSnapVisual(newSnapVisual);
            }
            
            setTempLine({
                x1: connectRef.current.startX,
                y1: connectRef.current.startY,
                x2: bestSnap ? bestSnap.x : canvasX,
                y2: bestSnap ? bestSnap.y : canvasY
            });
        }
        rAF.current = null;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleTouchMove = (e: TouchEvent) => {
            if (dragRef.current.isDragging) e.preventDefault();
            const touch = e.touches[0];
            mouseRef.current = { x: touch.clientX, y: touch.clientY };
            if (!rAF.current) rAF.current = requestAnimationFrame(updateLoop);
        };

        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
            if (!rAF.current) rAF.current = requestAnimationFrame(updateLoop);
        };

        const handleMouseUp = () => {
            if (rAF.current) { cancelAnimationFrame(rAF.current); rAF.current = null; }

            if (dragRef.current.isDragging) {
                dragRef.current.draggedIds.forEach(id => {
                    const task = tasksRef.current.find(t => t.id === id); // Use ref for latest position
                    if (task) {
                        onUpdateTask(id, { position: task.position });
                    }
                });
            }
            
            dragRef.current = { potentialDrag: false, isDragging: false, startMouse: {x:0, y:0}, draggedIds: [], initialPositions: {}, maxY: null };


            if (selectRef.current.isSelecting) {
                const { startX, startY, currentX, currentY } = selectRef.current;
                const x1 = Math.min(startX, currentX);
                const x2 = Math.max(startX, currentX);
                const y1 = Math.min(startY, currentY);
                const y2 = Math.max(startY, currentY);
                
                const ids = tasksRef.current.filter(t => {
                    if (t.id === PROJECT_ROOT_ID) return false;
                    const h = cardHeights[t.id] || 160;
                    const w = CARD_WIDTH;
                    const isCentral = (focusedParentId && t.id === focusedParentId) || (!focusedParentId && (t.type === 'Milestone'));
                    const posX = isCentral ? (MAX_CANVAS_WIDTH - CARD_WIDTH) / 2 : t.position.x;
                    const posY = isCentral && t.id === PROJECT_ROOT_ID ? CENTRAL_Y : t.position.y;
                    
                    return (
                        posX + w > x1 && posX < x2 &&
                        posY + h > y1 && posY < y2
                    );
                }).map(t => t.id);

                onSelectTasks(ids);
                selectRef.current.isSelecting = false;
                setSelectionBox(null);
            }

            if (connectRef.current.isConnecting && !isReadOnly) {
                if (snapRef.current && connectRef.current.startTaskId) {
                    const startId = connectRef.current.startTaskId;
                    const targetId = snapRef.current.taskId;

                    if (startId !== PROJECT_ROOT_ID && targetId !== PROJECT_ROOT_ID) {
                        onUpdateTaskConnections(startId, targetId);
                    }
                }
                connectRef.current = { isConnecting: false, startTaskId: null, startX: 0, startY: 0 };
                setTempLine(null);
                setSnapVisual(null);
                snapRef.current = null;
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('touchmove', handleTouchMove);
            if (rAF.current) cancelAnimationFrame(rAF.current);
        };
    }, [effectiveScale, onSelectTasks, activeTool, focusedParentId, isReadOnly, cardHeights, onUpdateTask, onUpdateTaskConnections]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (activeTool === 'pointer' && !e.defaultPrevented) onSelectTasks([]);
        if (activeTool === 'select' && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const canvasX = (e.clientX - rect.left + canvasRef.current.scrollLeft) / effectiveScale;
            const canvasY = (e.clientY - rect.top + canvasRef.current.scrollTop) / effectiveScale;
            selectRef.current = { isSelecting: true, startX: canvasX, startY: canvasY, currentX: canvasX, currentY: canvasY };
            onSelectTasks([]); 
        }
    }

    const handleNodeMouseDown = useCallback((e: React.MouseEvent, taskId: string) => {
        if (isReadOnly) return;
        e.stopPropagation();
        const task = tasksRef.current.find(t => t.id === taskId);
        if (!task) return;
        
        if (taskId === focusedParentId || taskId === PROJECT_ROOT_ID) return;

        let currentSelection = selectedIdsRef.current;
        let draggedIds = currentSelection.includes(taskId) ? currentSelection : [taskId];
        if (!e.shiftKey && !currentSelection.includes(taskId)) {
            onSelectTasks([taskId]);
            draggedIds = [taskId];
        }

        const initialPositions: Record<string, {x: number, y: number}> = {};
        draggedIds.forEach(id => {
            const t = tasksRef.current.find(x => x.id === id);
            if (t) initialPositions[id] = { ...t.position };
        });

        // Determine maxY boundary for Goals
        let maxY: number | null = null;
        if (task.type === 'Goal' && task.parentId) {
            const parentMilestone = tasksRef.current.find(t => t.id === task.parentId && t.type === 'Milestone');
            if (parentMilestone) {
                maxY = parentMilestone.position.y;
            }
        }
        
        dragRef.current = {
            potentialDrag: true,
            isDragging: false,
            startMouse: { x: e.clientX, y: e.clientY },
            draggedIds: draggedIds,
            initialPositions,
            maxY: maxY,
        };
    }, [onSelectTasks, focusedParentId, isReadOnly, cardHeights]);

    const handleConnectStart = useCallback((e: React.MouseEvent, taskId: string, offsetX: number, offsetY: number) => {
        if (isReadOnly) return;
        e.stopPropagation();
        const task = tasksRef.current.find(t => t.id === taskId);
        if (!task) return;
        const isCentral = (focusedParentId && task.id === focusedParentId) || task.id === PROJECT_ROOT_ID;
        const posX = isCentral ? (MAX_CANVAS_WIDTH - CARD_WIDTH) / 2 : task.position.x;
        const posY = isCentral ? CENTRAL_Y : task.position.y;
        connectRef.current = { isConnecting: true, startTaskId: taskId, startX: posX + offsetX, startY: posY + offsetY };
    }, [focusedParentId, isReadOnly]);

    const handleJumpToBottom = () => {
        if (canvasRef.current) canvasRef.current.scrollTo({ top: canvasHeight, behavior: 'smooth' });
    };

    const handleSmartAdd = () => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) { onAdd(); return; }
        
        const scrollTop = canvasRef.current?.scrollTop || 0;
        const scrollLeft = canvasRef.current?.scrollLeft || 0;
        const centerX = (rect.width / 2 + scrollLeft) / effectiveScale;
        const centerY = (rect.height / 2 + scrollTop) / effectiveScale;

        const safeY = Math.max(centerY, CENTRAL_Y + PROJECT_ROOT_HEIGHT_BUFFER + 100);
        const safeX = Math.max(0, Math.min(centerX - (CARD_WIDTH/2), MAX_CANVAS_WIDTH - CARD_WIDTH));

        if (!focusedParentId) {
            const hasMilestones = tasksRef.current.some(t => t.type === 'Milestone');
            if (!hasMilestones) {
                onAdd({ type: 'Milestone', position: { x: safeX, y: safeY } });
                return;
            }
        }

        onAdd({ position: { x: safeX, y: safeY } });
    };

    const controlBg = isLight ? 'bg-white/80 border-black/5 shadow-xl text-slate-700' : 'bg-black/40 border-white/10 shadow-2xl text-slate-200';
    const controlHover = isLight ? 'hover:bg-black/5 hover:text-black' : 'hover:bg-white/10 hover:text-white';
    const activeControl = isLight ? 'bg-black/5 text-black' : 'bg-brand-600 text-white';

    const milestonePins = renderTasks.filter(t => t.type === 'Milestone' && t.id !== PROJECT_ROOT_ID).map(m => ({
        id: m.id,
        title: m.title,
        topPercent: (m.position.y / canvasHeight) * 100
    }));

    return (
        <div 
            ref={canvasRef} 
            className={`w-full h-full relative overflow-auto custom-scrollbar 
            ${activeTool === 'select' ? 'cursor-crosshair' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            style={{ touchAction: 'none' }} 
        >
            <div className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-50 hidden lg:flex flex-col lg:flex-row gap-2">
                {!isReadOnly && (
                    <div className={`${controlBg} backdrop-blur-xl border p-1.5 rounded-xl flex items-center justify-center gap-1`}>
                        <button onClick={handleSmartAdd} className={`p-2 rounded-lg transition-colors ${controlHover}`} title="Add Task"><Plus size={20} /></button>
                        <div className={`w-px h-6 mx-1 ${isLight ? 'bg-black/5' : 'bg-white/10'}`}></div>
                        <button onClick={() => setActiveTool('pointer')} className={`p-2 rounded-lg transition-colors ${activeTool === 'pointer' ? activeControl : controlHover}`}><MousePointer2 size={20} /></button>
                        <button onClick={() => setActiveTool('select')} className={`p-2 rounded-lg transition-colors ${activeTool === 'select' ? activeControl : controlHover}`} title="Selection Tool"><BoxSelect size={20} /></button>
                    </div>
                )}
                <div className={`${controlBg} backdrop-blur-xl border p-1.5 rounded-xl flex items-center justify-center gap-1`}>
                    <button onClick={() => setScale(s => Math.max(s - 0.1, 0.2))} className={`p-2 rounded-lg transition-colors ${controlHover}`}><ZoomOut size={20}/></button>
                    <span className={`text-xs font-mono w-12 text-center ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{Math.round(effectiveScale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(s + 0.1, 3))} className={`p-2 rounded-lg transition-colors ${controlHover}`}><ZoomIn size={20}/></button>
                </div>
                <div className={`${controlBg} backdrop-blur-xl border p-1.5 rounded-xl flex items-center justify-center gap-1`}>
                    <button onClick={handleJumpToBottom} className={`p-2 rounded-lg transition-colors ${controlHover}`} title="Jump to Bottom"><ArrowDownToLine size={20} /></button>
                </div>
            </div>

            <div className="fixed right-2 top-20 bottom-20 w-4 pointer-events-none z-40 hidden lg:block">
                {milestonePins.map(pin => (
                    <div 
                        key={pin.id}
                        className="absolute right-0 w-3 h-3 rounded-full bg-brand-500 cursor-pointer hover:scale-150 transition-transform shadow-lg pointer-events-auto group"
                        style={{ top: `${pin.topPercent}%` }}
                        onClick={() => { if (canvasRef.current) canvasRef.current.scrollTo({ top: (pin.topPercent/100)*canvasHeight - 100, behavior: 'smooth' }) }}
                        title={pin.title}
                    ></div>
                ))}
            </div>

            <div 
                className="absolute top-0 left-0 origin-top-left transition-transform duration-75 ease-out" 
                style={{ width: MAX_CANVAS_WIDTH, height: canvasHeight, transform: `scale(${effectiveScale})` }}
            >
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                    {renderTasks.map(task => 
                        (task.next || []).map(targetId => {
                            const target = renderTasks.find(t => t.id === targetId);
                            if (!target) return null;

                            const isTaskCentral = (focusedParentId && task.id === focusedParentId) || task.id === PROJECT_ROOT_ID;
                            const isTargetCentral = (focusedParentId && target.id === focusedParentId) || target.id === PROJECT_ROOT_ID;
                            
                            const startPos = isTaskCentral ? { x: (MAX_CANVAS_WIDTH - CARD_WIDTH) / 2, y: CENTRAL_Y } : task.position;
                            const endPos = isTargetCentral ? { x: (MAX_CANVAS_WIDTH - CARD_WIDTH) / 2, y: CENTRAL_Y } : target.position;
                            
                            const startH = cardHeights[task.id] || 160;
                            const endH = cardHeights[target.id] || 160;
                            
                            const { start, end } = getConnectionPoints(startPos, endPos, startH, endH);
                            
                            return <ConnectionLine key={`conn-${task.id}-${target.id}`} start={start as any} end={end as any} color={getStatusColor(task.status)} isLight={isLight} />;
                        })
                    )}

                    {tempLine && (
                         <g>
                             <line x1={tempLine.x1} y1={tempLine.y1} x2={tempLine.x2} y2={tempLine.y2} stroke={snapVisual ? "#10b981" : "#38bdf8"} strokeWidth="2" strokeDasharray="5 5" />
                             {snapVisual && (<><circle cx={snapVisual.x} cy={snapVisual.y} r="4" fill="#10b981" /><circle cx={snapVisual.x} cy={snapVisual.y} r="8" stroke="#10b981" strokeWidth="1.5" fill="none" className="opacity-50" /></>)}
                         </g>
                    )}
                </svg>

                <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                    {renderTasks.map(task => {
                        const isProjectRoot = task.id === PROJECT_ROOT_ID;
                        const isCentralRoot = (focusedParentId && task.id === focusedParentId) || isProjectRoot;
                        
                        if (task.type !== 'Milestone' || isCentralRoot) return null;
                        
                        const boundaryY = task.position.y - 20; // 20px above the card

                        return (
                            <div 
                                key={`boundary-${task.id}`}
                                className="absolute h-px bg-red-500 opacity-50"
                                style={{ 
                                    top: boundaryY, 
                                    left: 0, 
                                    width: MAX_CANVAS_WIDTH,
                                }}
                            />
                        );
                    })}
                </div>

                {renderTasks.map(task => {
                    const isCentral = !!((focusedParentId && task.id === focusedParentId) || task.id === PROJECT_ROOT_ID);
                    
                    const renderTask = isCentral ? {
                        ...task,
                        position: { x: (MAX_CANVAS_WIDTH - CARD_WIDTH) / 2, y: CENTRAL_Y }
                    } : task;

                    return (
                        <TaskCard 
                            key={task.id}
                            task={renderTask}
                            isSelected={selectedTaskIds.includes(task.id)}
                            onMouseDown={handleNodeMouseDown}
                            onConnectStart={handleConnectStart}
                            onFocus={onFocus}
                            onDoubleClick={(id) => onSelect(id, true)}
                            isLight={isLight}
                            isCentral={isCentral}
                            isReadOnly={isReadOnly}
                            onResize={handleCardResize}
                        />
                    )
                })}
                
                {selectionBox && (
                    <div 
                        className="absolute bg-brand-500/10 border border-brand-500 pointer-events-none z-50"
                        style={{ left: selectionBox.x, top: selectionBox.y, width: selectionBox.w, height: selectionBox.h }}
                    />
                )}
            </div>
        </div>
    );
};
