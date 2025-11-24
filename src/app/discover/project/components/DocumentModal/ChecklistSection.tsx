
import React, { useState } from 'react';
import { ChecklistItem, Theme } from '../../types';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';

interface ChecklistSectionProps {
    checklist: ChecklistItem[];
    onUpdate: (checklist: ChecklistItem[]) => void;
    theme: Theme;
    isReadOnly?: boolean;
}

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({ checklist, onUpdate, theme, isReadOnly }) => {
    const [newItemText, setNewItemText] = useState('');
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);

    const textMain = isLight ? "text-slate-800" : "text-slate-200";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";
    const inputClass = isLight ? "bg-slate-50 text-slate-800 placeholder:text-slate-400" : "bg-white/5 text-slate-200 placeholder:text-slate-500";

    const handleAdd = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newItemText.trim()) return;
        const newItem: ChecklistItem = {
            id: `cl-${Date.now()}`,
            text: newItemText,
            checked: false
        };
        onUpdate([...checklist, newItem]);
        setNewItemText('');
    };

    const handleToggle = (id: string) => {
        if (isReadOnly) return;
        const updated = checklist.map(item => 
            item.id === id ? { ...item, checked: !item.checked } : item
        );
        onUpdate(updated);
    };

    const handleDelete = (id: string) => {
        if (isReadOnly) return;
        const updated = checklist.filter(item => item.id !== id);
        onUpdate(updated);
    };

    const completed = checklist.filter(i => i.checked).length;
    const total = checklist.length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className={`uppercase text-xs font-bold tracking-wider flex items-center gap-2 ${textMuted}`}>
                    <CheckSquare size={14} />
                    Checklist
                </h3>
                {total > 0 && (
                    <span className={`text-xs font-mono ${textMuted}`}>{completed}/{total} ({progress}%)</span>
                )}
            </div>

            {total > 0 && (
                <div className="h-1 w-full bg-slate-200/20 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
            )}

            <div className="space-y-2">
                {checklist.map(item => (
                    <div key={item.id} className="flex items-center gap-3 group">
                        <button 
                            onClick={() => handleToggle(item.id)}
                            className={`transition-colors ${item.checked ? 'text-brand-500' : textMuted} ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:text-brand-400'}`}
                        >
                            {item.checked ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                        <span className={`flex-1 text-sm transition-all ${item.checked ? 'line-through opacity-50' : ''} ${textMain}`}>
                            {item.text}
                        </span>
                        {!isReadOnly && (
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className={`opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-red-500 transition-all`}
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {!isReadOnly && (
                <form onSubmit={handleAdd} className="flex items-center gap-3 mt-2">
                    <Plus size={18} className={textMuted} />
                    <input 
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder="Add an item..."
                        className={`flex-1 bg-transparent outline-none text-sm border-b border-transparent focus:border-brand-500/50 transition-all pb-1 ${textMain} placeholder:text-slate-500`}
                    />
                </form>
            )}
        </div>
    );
};
