
import React from 'react';
import { Theme } from '../types';
import { Palette, Grid as GridIcon, Dot, X } from 'lucide-react';

interface SettingsPageProps {
    theme: Theme;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ theme }) => {
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const textMain = isLight ? "text-slate-800" : "text-slate-100";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";
    const cardClass = isLight ? "bg-white/80 border-black/5" : "bg-[#18181b]/80 border-white/5";

    return (
        <div className="w-full h-full p-8 overflow-y-auto custom-scrollbar pb-32 md:pb-24">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className={`text-3xl font-bold mb-2 ${textMain}`}>Project Settings</h1>
                    <p className={textMuted}>Manage your project's appearance and configuration.</p>
                </div>
                
                <div className={`p-6 rounded-2xl border shadow-lg ${cardClass}`}>
                    <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textMain}`}>
                        <Palette size={20} className="text-brand-500" />
                        Appearance
                    </h2>

                    {/* This is a placeholder for settings. In a real app, you would have state management here. */}
                    <div className="space-y-6">
                        <div>
                            <label className={`text-sm font-bold block mb-2 ${textMain}`}>Theme</label>
                            <p className={`text-xs mb-3 ${textMuted}`}>Current theme is set globally from your profile.</p>
                        </div>
                        <div>
                            <label className={`text-sm font-bold block mb-2 ${textMain}`}>Background</label>
                            <p className={`text-xs mb-3 ${textMuted}`}>Current background is set globally from your profile.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
