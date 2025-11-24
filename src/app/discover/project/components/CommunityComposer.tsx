
import React, { useState } from 'react';
import { ArrowLeft, X, Send, Plus, Trash2, Star, Paperclip, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Theme, UserPost } from '../types';

type PostType = 'Help' | 'Feedback' | 'Update' | 'Poll';

interface CommunityComposerProps {
    type: PostType;
    onClose: () => void;
    onBack: () => void;
    theme: Theme;
    onAddPost?: (post: Partial<UserPost>) => void;
}

export const CommunityComposer: React.FC<CommunityComposerProps> = ({ type, onClose, onBack, theme, onAddPost }) => {
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    
    // Poll State
    const [pollOptions, setPollOptions] = useState(['', '']);
    
    // Feedback State
    const [rating, setRating] = useState(0);
    
    // Help State
    const [urgency, setUrgency] = useState('Normal');

    // Styles
    const textMain = isLight ? "text-slate-900" : "text-white";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";
    const inputClass = isLight 
        ? "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white" 
        : "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10";
    const borderClass = isLight ? "border-slate-200" : "border-white/10";

    const handleAddPollOption = () => setPollOptions([...pollOptions, '']);
    const handleRemovePollOption = (idx: number) => setPollOptions(pollOptions.filter((_, i) => i !== idx));
    const handlePollOptionChange = (idx: number, val: string) => {
        const newOptions = [...pollOptions];
        newOptions[idx] = val;
        setPollOptions(newOptions);
    };

    const handleSubmit = () => {
        if (onAddPost) {
            let finalContent = content;
            if (type === 'Poll') {
                finalContent += `\n\nPoll Options:\n` + pollOptions.map(o => `- ${o}`).join('\n');
            } else if (type === 'Help') {
                finalContent = `[Urgency: ${urgency}] ${content}`;
            } else if (type === 'Feedback') {
                finalContent = `[Rating: ${rating}/5 Stars] ${content}`;
            }

            const tags: string[] = [type];
            if (title) tags.push('Discussion');

            onAddPost({
                type,
                content: title ? `**${title}**\n${finalContent}` : finalContent,
                tags
            });
        }
        onClose();
    };

    const renderSpecificFields = () => {
        switch (type) {
            case 'Help':
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${textMuted}`}>Urgency</label>
                            <div className="flex gap-2">
                                {['Low', 'Normal', 'High', 'Critical'].map(u => (
                                    <button
                                        key={u}
                                        onClick={() => setUrgency(u)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                                            urgency === u 
                                            ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20' 
                                            : `border-transparent ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-slate-400'}`
                                        }`}
                                    >
                                        {u}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={`p-4 rounded-xl border ${isLight ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-blue-500/10 border-blue-500/20 text-blue-200'} flex gap-3 items-start`}>
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <p className="text-sm">Describe what you've tried so far and paste any relevant error logs below.</p>
                        </div>
                    </div>
                );
            case 'Feedback':
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${textMuted}`}>Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`p-2 transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : (isLight ? 'text-slate-200' : 'text-white/10')}`}
                                    >
                                        <Star size={32} fill={star <= rating ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'Poll':
                return (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${textMuted}`}>Options</label>
                        {pollOptions.map((opt, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input 
                                    value={opt}
                                    onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                                    placeholder={`Option ${idx + 1}`}
                                    className={`flex-1 p-3 rounded-xl border outline-none transition-all ${inputClass}`}
                                />
                                {pollOptions.length > 2 && (
                                    <button onClick={() => handleRemovePollOption(idx)} className={`p-3 rounded-xl ${isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-white/40 hover:bg-white/10'}`}>
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button 
                            onClick={handleAddPollOption}
                            className={`w-full py-3 rounded-xl border border-dashed flex items-center justify-center gap-2 font-bold text-sm transition-colors ${isLight ? 'border-slate-300 text-slate-500 hover:bg-slate-50' : 'border-white/20 text-slate-400 hover:bg-white/5'}`}
                        >
                            <Plus size={16} /> Add Option
                        </button>
                    </div>
                );
            case 'Update':
                return (
                    <div className="flex gap-2 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button className={`p-2 rounded-lg transition-colors ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-slate-400'}`}>
                            <ImageIcon size={20} />
                        </button>
                        <button className={`p-2 rounded-lg transition-colors ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-slate-400'}`}>
                            <Paperclip size={20} />
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[85vh]">
            {/* Header */}
            <div className={`flex items-center justify-between px-6 pb-4 border-b flex-shrink-0 ${borderClass}`}>
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className={`p-2 rounded-full -ml-2 ${isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-white'}`}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className={`text-xl font-bold ${textMain}`}>
                        {type === 'Help' ? 'Ask for Help' : 
                         type === 'Feedback' ? 'Submit Feedback' : 
                         type === 'Poll' ? 'Create Poll' : 'Post Update'}
                    </h2>
                </div>
                <button onClick={onClose} className={`p-2 rounded-full ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-white'}`}>
                    <X size={20} />
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                
                {/* Title Input */}
                <div>
                    <input 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={type === 'Poll' ? "Ask a question..." : "Title"}
                        className={`w-full bg-transparent border-none outline-none text-2xl font-bold placeholder:opacity-50 ${textMain}`}
                    />
                </div>

                {/* Main Content */}
                <div>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={
                            type === 'Help' ? "Explain the issue in detail..." :
                            type === 'Feedback' ? "Tell us what you think..." :
                            type === 'Update' ? "What's happening with the project?" :
                            "Add some context (optional)..."
                        }
                        className={`w-full min-h-[120px] bg-transparent border-none outline-none text-base resize-none placeholder:opacity-50 ${textMain}`}
                    />
                </div>

                {renderSpecificFields()}

            </div>

            {/* Footer */}
            <div className={`p-4 border-t mt-auto ${borderClass}`}>
                <button 
                    onClick={handleSubmit}
                    className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                    <Send size={20} />
                    Post {type === 'Poll' ? 'Poll' : type === 'Feedback' ? 'Feedback' : ''}
                </button>
            </div>
        </div>
    );
};