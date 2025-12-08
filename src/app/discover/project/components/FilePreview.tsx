
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileItem, Theme, Attachment } from '../types';
import { Download, X, File, Image as ImageIcon, Video, Music, Archive, FileText, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { ResourcePickerModal } from './DocumentModal/ResourcePickerModal';

const Editor = dynamic(() => import('@/app/news/components/Editor'), { 
    ssr: false,
    loading: () => <div className="h-64 w-full bg-muted/50 animate-pulse rounded-lg" />
});


const getFileIcon = (type?: string, size = 48) => {
    if (type === 'folder') return <Folder size={size} />;
    if (!type) return <File size={size} />;
    if (type.startsWith('image/')) return <ImageIcon size={size} />;
    if (type.startsWith('video/')) return <Video size={size} />;
    if (type.startsWith('audio/')) return <Music size={size} />;
    if (type.includes('zip') || type.includes('archive')) return <Archive size={size} />;
    if (type.includes('pdf')) return <FileText size={size} />;
    if (type.includes('application/json')) return <FileText size={size} />;
    if (type.includes('word') || type.includes('excel') || type.includes('spreadsheet') || type.includes('presentation')) return <FileText size={size} />;
    return <File size={size} />;
};

interface FilePreviewProps {
    file: FileItem;
    onClose: () => void;
    theme: Theme;
    isSideView?: boolean;
    attachments?: Attachment[];
    onSelectAttachment?: (file: FileItem) => void;
}


export const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose, theme, isSideView = false, attachments = [], onSelectAttachment }) => {
    const isLight = theme === 'light';
    const isImage = file.fileType?.startsWith('image/');
    const isVideo = file.fileType?.startsWith('video/');
    const isAudio = file.fileType?.startsWith('audio/');
    const isBlockNote = file.fileType === 'application/json';
    const isPdf = file.fileType === 'application/pdf';
    const [showResourcePicker, setShowResourcePicker] = useState(false);

    const isOfficeDoc = file.fileType && (
        file.fileType.includes('msword') ||
        file.fileType.includes('vnd.openxmlformats-officedocument.wordprocessingml') || // .docx
        file.fileType.includes('vnd.ms-excel') ||
        file.fileType.includes('vnd.openxmlformats-officedocument.spreadsheetml') || // .xlsx
        file.fileType.includes('vnd.ms-powerpoint') ||
        file.fileType.includes('vnd.openxmlformats-officedocument.presentationml') // .pptx
    );

    const canEmbed = file.fileType && (
        file.fileType.startsWith('text/') ||
        isPdf
    ) && !isOfficeDoc;

    const renderPreview = () => {
        if (isBlockNote && file.content) {
            return <Editor initialContent={file.content} editable={false} />;
        }
        if (!file.url) {
            return (
                <div className={`flex flex-col items-center justify-center text-center p-8 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-white/5'}`}>
                    <h3 className={`text-lg font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>No Preview Available</h3>
                    <p className={`text-sm mb-6 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>It may have been moved, edited, or deleted.</p>
                </div>
            );
        }

        if (isImage) {
            return <img src={file.url} alt={file.name} className="max-h-[70vh] max-w-full rounded-lg object-contain" />;
        }
        if (isVideo) {
            return <video src={file.url} controls className="w-full rounded-lg max-h-[70vh]" />;
        }
        if (isAudio) {
            return <audio src={file.url} controls className="w-full" />;
        }
        if (canEmbed) {
            return <embed src={file.url} type={file.fileType} className="w-full h-[75vh] rounded-lg border" />;
        }

        return (
            <div className={`flex flex-col items-center justify-center text-center p-8 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-white/5'}`}>
                <div className={`mb-4 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>{getFileIcon(file.fileType, 64)}</div>
                <h3 className={`text-lg font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>
                  {isOfficeDoc ? 'Office Document' : 'No Preview Available'}
                </h3>
                <p className={`text-sm mb-6 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  This file type can't be shown here, but you can download it to view.
                </p>
                <a href={file.url} download={file.name} onClick={(e) => e.stopPropagation()}>
                    <Button variant={isLight ? 'default' : 'secondary'} size="lg" className="gap-2">
                        <Download size={18} />
                        Download File
                    </Button>
                </a>
            </div>
        );
    };
    
    const content = (
        <div
            className={cn(
                "w-full h-full flex flex-col p-0 gap-0 border overflow-hidden",
                isLight ? 'bg-white border-gray-200' : 'bg-[#18181b] border-white/10',
                isSideView ? "lg:rounded-l-none lg:rounded-r-xl" : "lg:rounded-xl"
            )}
        >
            <div className={`flex flex-row items-center justify-between p-2 pl-3 border-b shrink-0 ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
                <div className="flex items-center gap-1 min-w-0">
                    <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
                        {attachments.map(att => (
                            <button
                                key={att.id}
                                onClick={() => onSelectAttachment?.(att as FileItem)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap",
                                    file.id === att.id ? (isLight ? 'bg-slate-100' : 'bg-white/10') : (isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5')
                                )}
                            >
                                {getFileIcon(att.type, 14)}
                                <span className={cn("text-xs font-medium", isLight ? 'text-slate-700' : 'text-slate-300')}>{att.name}</span>
                            </button>
                        ))}
                         <button onClick={() => setShowResourcePicker(true)} className={cn("p-2 rounded-md", isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-slate-400')}>
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2 pl-2">
                    {file.url && (
                            <a href={file.url} download={file.name} onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download size={16} />
                            </Button>
                        </a>
                    )}
                        <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className={`flex-1 flex items-center justify-center p-4 overflow-auto ${isBlockNote ? '' : (isLight ? 'bg-gray-50' : 'bg-black/20')}`}>
                {renderPreview()}
            </div>
            {showResourcePicker && (
                <ResourcePickerModal 
                    onClose={() => setShowResourcePicker(false)}
                    onSelect={(f) => {
                        // This needs to be wired up to add the attachment to the task
                        console.log("Selected resource to add:", f);
                        setShowResourcePicker(false);
                    }}
                    isLight={isLight}
                />
            )}
        </div>
    );
    
    if (isSideView) {
        return content;
    }

    // This part is for the modal (non-side-view) implementation, which is now deprecated for this component's use-case but kept for safety.
    return (
        <div
            className="fixed inset-0 z-[200] p-0 lg:p-4 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full h-full lg:max-w-4xl lg:h-auto lg:max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {content}
            </div>
        </div>
    );
};
