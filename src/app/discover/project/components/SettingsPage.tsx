
import React, { useState, useEffect } from 'react';
import { Theme, CurrentUser } from '../types';
import { Palette, Grid as GridIcon, Dot, X, Edit } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SettingsPageProps {
    theme: Theme;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ theme }) => {
    const { currentUser, projectData, updateProject } = useStore();
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const { toast } = useToast();
    
    const [title, setTitle] = useState(projectData?.title || '');

    useEffect(() => {
      setTitle(projectData?.title || '');
    }, [projectData?.title]);

    const handleSave = () => {
        if (projectData && title.trim() && title.trim() !== projectData.title) {
            updateProject({ title: title.trim() });
            toast({ title: "Project updated", description: "The project name has been saved." });
        }
    };

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
                
                {currentUser.role === 'Owner' && (
                     <div className={`p-6 rounded-2xl border shadow-lg mb-8 ${cardClass}`}>
                        <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textMain}`}>
                            <Edit size={20} className="text-brand-500" />
                            General
                        </h2>
                        <div className="space-y-4 max-w-lg">
                             <div>
                                <label htmlFor="project-name" className={`text-sm font-bold block mb-2 ${textMain}`}>Project Name</label>
                                <div className="flex items-center gap-2">
                                <Input
                                    id="project-name"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}
                                />
                                <Button onClick={handleSave} disabled={title === projectData?.title || !title.trim()}>
                                    Save
                                </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
