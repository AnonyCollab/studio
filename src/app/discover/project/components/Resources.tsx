
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Theme, ResourcesViewMode, FileItem } from '../types';
import { FileText, Link, Image, Download, Search, Folder, MoreVertical, File as FileIcon, Video, Archive, Plus, ChevronRight, Edit, Upload, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilePreview } from './FilePreview';
import { NewFileEditor } from './NewFileEditor';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AddFromUrlDialog } from './AddFromUrlDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const getFileIcon = (type?: string, size = 20) => {
    if (type === 'folder') return <Folder size={size} />;
    if (type === 'application/json') return <FileText size={size} />;
    if (!type) return <FileIcon size={size} />;
    if (type.startsWith('image/')) return <Image size={size} />;
    if (type.startsWith('video/')) return <Video size={size} />;
    if (type.includes('zip') || type.includes('archive')) return <Archive size={size} />;
    if (type.includes('pdf')) return <FileText size={size} />;
    return <FileIcon size={size} />;
};

const getFileColor = (type?: string) => {
    if (type === 'folder') return 'text-brand-500';
    if (type === 'application/json') return 'text-green-500';
    if (!type) return 'text-gray-400';
    if (type.startsWith('image/')) return 'text-emerald-500';
    if (type.startsWith('video/')) return 'text-pink-500';
    if (type.includes('zip') || type.includes('archive')) return 'text-blue-500';
    if (type.includes('pdf')) return 'text-red-500';
    return 'text-gray-400';
};

interface ResourcesProps {
}

export const Resources: React.FC<ResourcesProps> = () => {
    const { files, addFile, deleteFile, resourcePath, setResourcePath, currentUser, theme } = useStore();
    useEffect(() => {
        console.log("Current user role in ResourcesPage:", currentUser?.role);
    }, [currentUser]);
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
    
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

    const handleSaveNewFile = (name: string, content: string) => {
        addFile({
          name: name,
          type: 'file',
          fileType: 'application/json', // Blocknote content is saved as JSON
          size: `${(content.length / 1024).toFixed(2)} KB`,
          parentId: currentFolderId,
          content: content,
        });
        setIsCreatingFile(false);
      };
      
    const handleSaveFromUrl = (name: string, url: string) => {
        let fileType = 'link';
        if (url.endsWith('.pdf')) fileType = 'application/pdf';
        // Add more file type detections if needed
        addFile({
          name,
          type: 'file',
          fileType: fileType,
          url: url,
          parentId: currentFolderId,
          size: 'Link'
        });
        setIsUrlDialogOpen(false);
    };

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
                             <Button variant="outline" onClick={() => setIsCreatingFile(true)}>
                                <Edit size={16} className="mr-2"/> New File
                            </Button>
                            <Button onClick={() => setIsCreatingFolder(true)} className="flex items-center gap-2">
                                <Plus size={16} /> New Folder
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Upload size={16} className="mr-2"/> Upload
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className={theme === 'dark' ? 'bg-[#18181b] border-white/10 text-white' : ''}>
                                    <DropdownMenuItem onClick={() => document.getElementById('file-upload-input')?.click()}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload from computer
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setIsUrlDialogOpen(true)}>
                                        <Link className="mr-2 h-4 w-4" />
                                        Add from URL
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <input type="file" id="file-upload-input" className="hidden" onChange={handleFileUpload} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                            {folders.map((folder) => (
                                <div 
                                    key={folder.id} 
                                    onClick={() => handleNavigate(folder.id)}
                                    className={`p-4 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${cardClass}`}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-brand-500/10 text-brand-500 flex-shrink-0`}>
                                            {getFileIcon(folder.type, 24)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className={`font-bold text-sm truncate ${textMain}`}>{folder.name}</h3>
                                        </div>
                                    </div>
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className={isLight ? 'bg-white' : 'bg-[#1e1e1e] border-white/10'}>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                     <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="text-red-500 focus:bg-red-500/10 focus:text-red-500">
                                                        <Trash2 size={14} className="mr-2" /> Delete Folder
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className={isLight ? 'bg-white' : 'bg-[#18181b] border-white/10'}>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription className={textMuted}>
                                                           This will permanently delete the folder and all its contents. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className={isLight ? '' : 'bg-transparent hover:bg-white/10'}>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => deleteFile(folder.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                             {isCreatingFolder && (
                                <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${cardClass}`}>
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-brand-500/10 text-brand-500 flex-shrink-0`}>
                                        {getFileIcon('folder', 24)}
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
                        </div>

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
                                            <div key={idx} onClick={() => setPreviewFile(file)} className={`grid grid-cols-12 p-4 items-center transition-colors group cursor-pointer ${isLight ? 'hover:bg-black/5 border-black/5' : 'hover:bg-white/5 border-white/5'}`}>
                                                <div className="col-span-5 flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-opacity-10 ${getFileColor(file.fileType)}`}>
                                                        {getFileIcon(file.fileType)}
                                                    </div>
                                                    <span className={`font-medium truncate ${textMain}`}>{file.name}</span>
                                                </div>
                                                <div className={`col-span-2 text-sm ${textMuted}`}>{file.fileType || 'File'}</div>
                                                <div className={`col-span-2 text-sm font-mono ${textMuted}`}>{file.size}</div>
                                                <div className={`col-span-2 text-sm ${textMuted}`}>{file.createdAt ? new Date(file.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</div>
                                                <div className="col-span-1 flex justify-end">
                                                     <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                                                <MoreVertical size={16} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className={isLight ? 'bg-white' : 'bg-[#1e1e1e] border-white/10'}>
                                                            {file.url && (
                                                                <a href={file.url} download={file.name}>
                                                                    <DropdownMenuItem><Download size={14} className="mr-2" /> Download</DropdownMenuItem>
                                                                </a>
                                                            )}
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                     <DropdownMenuItem onSelect={(e) => { e.preventDefault(); e.stopPropagation(); }} onClick={(e) => e.stopPropagation()} className="text-red-500 focus:bg-red-500/10 focus:text-red-500">
                                                                        <Trash2 size={14} className="mr-2" /> Delete
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className={isLight ? 'bg-white' : 'bg-[#18181b] border-white/10'}>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription className={textMuted}>
                                                                           This will permanently delete the file. This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel className={isLight ? '' : 'bg-transparent hover:bg-white/10'}>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
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
            
            <NewFileEditor
                isOpen={isCreatingFile}
                onClose={() => setIsCreatingFile(false)}
                onSave={handleSaveNewFile}
                theme={theme}
            />

            <AddFromUrlDialog 
                isOpen={isUrlDialogOpen}
                onOpenChange={setIsUrlDialogOpen}
                onSave={handleSaveFromUrl}
                theme={theme}
            />

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
}
