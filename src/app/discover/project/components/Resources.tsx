
import React, { useMemo } from 'react';
import { Theme, ResourcesViewMode, FileItem } from '../types';
import { FileText, Link, Image, Download, Search, Folder, MoreVertical, File, Video, Archive } from 'lucide-react';

interface ResourcesProps {
    theme: Theme;
    viewMode: ResourcesViewMode;
    files: FileItem[];
}

export const Resources: React.FC<ResourcesProps> = ({ theme, viewMode, files }) => {
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    
    const containerClass = isLight ? "bg-white/60 border-black/5" : "bg-black/40 border-white/10";
    const cardClass = isLight ? "bg-white/80 border-black/5 hover:bg-white" : "bg-[#18181b]/80 border-white/5 hover:bg-[#202023]";
    const textMain = isLight ? "text-slate-800" : "text-slate-100";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";
    const inputClass = isLight ? "bg-white border-slate-200 text-slate-700" : "bg-[#18181b] border-white/10 text-slate-200";

    const folders = ['Design Assets', 'Documentation', 'Legal Contracts', 'Marketing'];

    const displayedFiles = useMemo(() => {
        if (viewMode === 'Folders') return []; // Hide files if in Folders view
        if (viewMode === 'All' || viewMode === 'Files') return files;
        
        // Filter by specific type
        return files.filter(f => {
            if (viewMode === 'Image') return f.type === 'Image' || f.type === 'PNG' || f.type === 'JPG';
            if (viewMode === 'Video') return f.type === 'Video' || f.type === 'MP4';
            return f.type.includes(viewMode);
        });
    }, [viewMode, files]);

    const showFolders = viewMode === 'All' || viewMode === 'Folders';

    return (
        <div className="w-full h-full p-4 md:p-8 overflow-y-auto custom-scrollbar pb-32 md:pb-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${textMain}`}>{viewMode === 'All' ? 'Resources' : viewMode}</h1>
                        <p className={textMuted}>Central repository for project assets and documents.</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                         <div className="relative w-full md:w-auto">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} size={16} />
                            <input 
                                type="text" 
                                placeholder="Search files..." 
                                className={`pl-10 pr-4 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-brand-500/20 w-full md:w-64 transition-all ${inputClass}`}
                            />
                         </div>
                    </div>
                </div>

                {/* Recent Folders */}
                {showFolders && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                        {folders.map((folder, i) => (
                            <div key={i} className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${cardClass}`}>
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-brand-500/10 text-brand-500 flex-shrink-0`}>
                                    <Folder size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className={`font-bold text-sm truncate ${textMain}`}>{folder}</h3>
                                    <p className={`text-xs ${textMuted}`}>12 items</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Files List */}
                {displayedFiles.length > 0 ? (
                    <div className={`rounded-2xl border overflow-hidden ${containerClass}`}>
                        <div className="overflow-x-auto">
                            <div className="min-w-[700px]">
                                <div className={`grid grid-cols-12 p-4 border-b text-xs font-bold uppercase tracking-wider ${textMuted} ${isLight ? 'border-black/5 bg-slate-50/50' : 'border-white/5 bg-white/5'}`}>
                                    <div className="col-span-5">Name</div>
                                    <div className="col-span-2">Type</div>
                                    <div className="col-span-2">Size</div>
                                    <div className="col-span-2">Date</div>
                                    <div className="col-span-1 text-right">Action</div>
                                </div>
                                
                                <div className="divide-y divide-white/5">
                                    {displayedFiles.map((file, idx) => (
                                        <div key={idx} className={`grid grid-cols-12 p-4 items-center transition-colors group ${isLight ? 'hover:bg-black/5 border-black/5' : 'hover:bg-white/5 border-white/5'}`}>
                                            <div className="col-span-5 flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${file.bg} ${file.color}`}>
                                                    {file.type === 'PDF' ? <FileText size={20} /> : 
                                                     file.type === 'ZIP' ? <Archive size={20} /> :
                                                     file.type === 'Image' ? <Image size={20} /> :
                                                     file.type === 'Video' ? <Video size={20} /> : <File size={20} />}
                                                </div>
                                                <span className={`font-medium truncate ${textMain}`}>{file.name}</span>
                                            </div>
                                            <div className={`col-span-2 text-sm ${textMuted}`}>{file.type}</div>
                                            <div className={`col-span-2 text-sm font-mono ${textMuted}`}>{file.size}</div>
                                            <div className={`col-span-2 text-sm ${textMuted}`}>{file.date}</div>
                                            <div className="col-span-1 flex justify-end">
                                                <button className={`p-2 rounded opacity-100 md:opacity-0 group-hover:opacity-100 transition-all ${isLight ? 'hover:bg-white shadow-sm' : 'hover:bg-white/10'}`}>
                                                    <MoreVertical size={16} className={textMuted} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                     viewMode !== 'Folders' && (
                         <div className={`text-center py-12 ${textMuted}`}>
                             No files found for this filter.
                         </div>
                     )
                )}
            </div>
        </div>
    );
};