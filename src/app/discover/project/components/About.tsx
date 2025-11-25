
import React from 'react';
import { Theme, CurrentUser } from '../types';
import { Layers, Github, Twitter, Globe, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AboutProps {
    theme: Theme;
    currentUser: CurrentUser;
    onLeaveProject: () => void;
    isLeaving: boolean;
}

export const About: React.FC<AboutProps> = ({ theme, currentUser, onLeaveProject, isLeaving }) => {
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const textMain = isLight ? "text-slate-800" : "text-slate-100";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";
    const cardBg = isLight ? "bg-white/60 border-black/5" : "bg-black/40 border-white/10";

    const canLeave = currentUser.role === 'Member' || currentUser.role === 'Team Lead' || currentUser.role === 'Coordinator';

    return (
        <div className="w-full h-full flex items-center justify-center p-8 overflow-y-auto custom-scrollbar pb-32">
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

                {canLeave && (
                     <div className={`p-6 rounded-2xl border ${cardBg}`}>
                        <h3 className={`text-lg font-bold mb-2 ${textMain}`}>Project Actions</h3>
                        <p className={`text-sm mb-4 ${textMuted}`}>
                           If you no longer wish to be a part of this project, you can leave at any time. You will need to rejoin to regain access.
                        </p>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full md:w-auto" disabled={isLeaving}>
                                    {isLeaving ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Leaving...</>
                                    ) : (
                                        <><LogOut className="mr-2 h-4 w-4" /> Leave Project</>
                                    )}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className={isLight ? 'bg-white' : 'bg-[#18181b] border-white/10'}>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
                                <AlertDialogDescription className={textMuted}>
                                    You will lose access to all project boards and resources. You can rejoin the project later if you change your mind.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel className={isLight ? '' : 'bg-transparent text-white hover:bg-white/10'}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onLeaveProject} className="bg-red-600 hover:bg-red-700">Leave</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                     </div>
                )}

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
