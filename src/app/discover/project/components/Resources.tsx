
'use client';

import React, { useMemo, useState } from 'react';
import { Theme, ResourcesViewMode, FileItem } from '../types';
import { FileText, Link, Image, Download, Search, Folder, MoreVertical, File, Video, Archive, Plus, Upload, ChevronRight, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilePreview } from './FilePreview';

const getFileIcon = (type?: string) => {
    if (!type) return <File size={20} />;
    if (type.startsWith('image/')) return <Image size={20} />;
    if (type.startsWith('video/')) return <Video size={20} />;
    if (type.includes('zip') || type.includes('archive')) return <Archive size={20} />;
    if (type.includes('pdf')) return <FileText size={20} />;
    return <File size={20} />;
};

const getFileColor = (type?: string) => {
    if (!type) return 'text-gray-400';
    if (type.startsWith('image/')) return 'text-emerald-500';
    if (type.startsWith('video/')) return 'text-pink-500';
    if (type.includes('zip') || type.includes('archive')) return 'text-blue-500';
    if (type.includes('pdf')) return 'text-red-500';
    return 'text-gray-400';
};

interface ResourcesProps {
    theme: Theme;
    viewMode: ResourcesViewMode;
    files: FileItem[];
}

export const Resources: React.FC<ResourcesProps> = ({ theme, viewMode }) => {
    const { files, addFile, resourcePath, setResourcePath } = useStore();
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
    
    const containerClass = isLight ? "bg-white/60 border-black/5" : "bg-black/40 border-white/10";
    const cardClass = isLight ? "bg-white/80 border-black/5 hover:bg-white" : "bg-[#18181b]/80 border-white/5 hover:bg-[#202023]";
    const textMain = isLight ? "text-slate-800" : "text-slate-100";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";
    const inputClass = isLight ? "bg-white border-slate-200 text-slate-700" : "bg-[#18181b] border-white/10 text-slate-200";

    const currentFolderId = resourcePath[resourcePath.length - 1];
    
    const currentItems = useMemo(() => {
        return files.filter(file => file.parentId === currentFolderId);
    }, [files, currentFolderId]);

    const folders = useMemo(() => currentItems.filter(item => item.type === 'folder'), [currentItems]);
    const fileItems = useMemo(() => currentItems.filter(item => item.type === 'file'), [currentItems]);

    const breadcrumbs = useMemo(() => {
        const path = [{ id: null, name: 'Resources' }];
        resourcePath.slice(1).forEach(folderId => {
            const folder = files.find(f => f.id === folderId);
            if(folder) path.push({ id: folder.id, name: folder.name });
        });
        return path;
    }, [resourcePath, files]);

    const handleNavigate = (folderId: string) => {
        setResourcePath([...resourcePath, folderId]);
    };

    const handleBreadcrumbClick = (index: number) => {
        setResourcePath(resourcePath.slice(0, index + 1));
    };

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) {
            setIsCreatingFolder(false);
            return;
        }
        addFile({ name: newFolderName, type: 'folder', parentId: currentFolderId });
        setNewFolderName('');
        setIsCreatingFolder(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        addFile({
            name: file.name,
            type: 'file',
            fileType: file.type,
            size: `${(file.size / 1024).toFixed(2)} KB`,
            parentId: currentFolderId,
            url: URL.createObjectURL(file)
        });
    }

    return (
        <>
            <div className="w-full h-full p-4 md:p-8 overflow-y-auto custom-scrollbar pb-32 md:pb-24">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                        <div>
                            <div className="flex items-center gap-1.5 text-sm mb-2">
                                {breadcrumbs.map((crumb, index) => (
                                    <React.Fragment key={crumb.id || 'root'}>
                                        <button 
                                            onClick={() => handleBreadcrumbClick(index)}
                                            className={`transition-colors ${
                                                index === breadcrumbs.length - 1
                                                ? `font-bold ${textMain}`
                                                : `${textMuted} hover:text-brand-500`
                                            }`}
                                        >
                                            {crumb.name}
                                        </button>
                                        {index < breadcrumbs.length - 1 && (
                                            <ChevronRight size={16} className={textMuted} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
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
                            <Button onClick={() => setIsCreatingFolder(true)} className="flex items-center gap-2">
                                <Plus size={16} /> New Folder
                            </Button>
                            <Button variant="outline" onClick={() => document.getElementById('file-upload-input')?.click()}>
                                <Upload size={16} className="mr-2"/> Upload File
                            </Button>
                            <input type="file" id="file-upload-input" className="hidden" onChange={handleFileUpload} />
                        </div>
                    </div>
                    
                    {(folders.length > 0 || isCreatingFolder) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                            {isCreatingFolder && (
                                <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${cardClass}`}>
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-brand-500/10 text-brand-500 flex-shrink-0`}>
                                        <Folder size={24} />
                                    </div>
                                    <div className="min-w-0">
                                        <Input
                                            autoFocus
                                            value={newFolderName}
                                            onChange={(e) => setNewFolderName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleCreateFolder();
                                                if (e.key === 'Escape') {
                                                    setNewFolderName('');
                                                    setIsCreatingFolder(false);
                                                }
                                            }}
                                            onBlur={handleCreateFolder}
                                            placeholder="Folder name"
                                            className={`font-bold truncate h-auto bg-transparent border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm ${textMain}`}
                                        />
                                    </div>
                                </div>
                            )}
                            {folders.map((folder, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => handleNavigate(folder.id)}
                                    className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${cardClass}`}
                                >
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-brand-500/10 text-brand-500 flex-shrink-0`}>
                                        <Folder size={24} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className={`font-bold text-sm truncate ${textMain}`}>{folder.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {fileItems.length > 0 ? (
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
                                        {fileItems.map((file, idx) => (
                                            <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className={`grid grid-cols-12 p-4 items-center transition-colors group cursor-pointer ${isLight ? 'hover:bg-black/5 border-black/5' : 'hover:bg-white/5 border-white/5'}`}>
                                                <div className="col-span-5 flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-opacity-10 ${getFileColor(file.fileType)}`}>
                                                        {getFileIcon(file.fileType)}
                                                    </div>
                                                    <span className={`font-medium truncate ${textMain}`}>{file.name}</span>
                                                </div>
                                                <div className={`col-span-2 text-sm ${textMuted}`}>{file.fileType || 'File'}</div>
                                                <div className={`col-span-2 text-sm font-mono ${textMuted}`}>{file.size}</div>
                                                <div className={`col-span-2 text-sm ${textMuted}`}>{file.date}</div>
                                                <div className="col-span-1 flex justify-end">
                                                    {file.url && (
                                                        <a href={file.url} download={file.name} onClick={(e) => e.stopPropagation()} className={`p-2 rounded opacity-100 md:opacity-0 group-hover:opacity-100 transition-all ${isLight ? 'hover:bg-white shadow-sm' : 'hover:bg-white/10'}`}>
                                                            <Download size={16} className={textMuted} />
                                                        </a>
                                                    )}
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        (folders.length === 0 && !isCreatingFolder) && (
                            <div className={`text-center py-16 ${textMuted}`}>
                                <Folder size={48} className="mx-auto mb-4 opacity-30" />
                                <p className="text-lg">This folder is empty.</p>
                                <p>Upload a file or create a new folder to get started.</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {previewFile && (
                <FilePreview 
                    file={previewFile}
                    isOpen={!!previewFile}
                    onClose={() => setPreviewFile(null)}
                    theme={theme}
                />
            )}
        </>
    );
};
