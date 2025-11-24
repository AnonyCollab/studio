
import React from 'react';
import { Theme } from '../types';
import { Layers, Github, Twitter, Globe } from 'lucide-react';

interface AboutProps {
    theme: Theme;
}

export const About: React.FC<AboutProps> = ({ theme }) => {
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const textMain = isLight ? "text-slate-800" : "text-slate-100";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";

    return (
        <div className="w-full h-full flex items-center justify-center p-8">
            <div className="max-w-2xl text-center space-y-8">
                <div className="w-24 h-24 bg-brand-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-brand-500/40 rotate-3 hover:rotate-0 transition-transform duration-500">
                    <Layers size={48} />
                </div>
                
                <div className="space-y-4">
                    <h1 className={`text-5xl font-bold ${textMain}`}>OmniCanvas</h1>
                    <p className={`text-xl leading-relaxed ${textMuted}`}>
                        The ultimate unified workspace for agile teams. <br />
                        Visualizing complexity, simplifying execution.
                    </p>
                </div>

                <div className={`grid grid-cols-3 gap-4 py-8 border-t border-b ${isLight ? 'border-black/10' : 'border-white/10'}`}>
                    <div>
                        <div className={`text-3xl font-bold mb-1 ${textMain}`}>v2.4</div>
                        <div className={`text-xs uppercase tracking-wider ${textMuted}`}>Version</div>
                    </div>
                    <div>
                        <div className={`text-3xl font-bold mb-1 ${textMain}`}>100%</div>
                        <div className={`text-xs uppercase tracking-wider ${textMuted}`}>Uptime</div>
                    </div>
                    <div>
                        <div className={`text-3xl font-bold mb-1 ${textMain}`}>4.2k</div>
                        <div className={`text-xs uppercase tracking-wider ${textMuted}`}>Commits</div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-6">
                    <button className={`p-3 rounded-full hover:scale-110 transition-transform ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-white'}`}>
                        <Github size={20} />
                    </button>
                    <button className={`p-3 rounded-full hover:scale-110 transition-transform ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-white'}`}>
                        <Twitter size={20} />
                    </button>
                    <button className={`p-3 rounded-full hover:scale-110 transition-transform ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-white'}`}>
                        <Globe size={20} />
                    </button>
                </div>

                <div className={`text-xs ${textMuted}`}>
                    © 2024 OmniCanvas Inc. All rights reserved.
                </div>
            </div>
        </div>
    );
};
