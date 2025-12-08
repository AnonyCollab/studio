
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { FileItem, Theme } from '../types';
import { Download, X, File, Image as ImageIcon, Video, Music, Archive, FileText } from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const Editor = dynamic(() => import('@/app/news/components/Editor'), { 
    ssr: false,
    loading: () => <div className="h-64 w-full bg-muted/50 animate-pulse rounded-lg" />
});


const getFileIcon = (type?: string, size = 48) => {
    if (!type) return <File size={size} />;
    if (type.startsWith('image/')) return <ImageIcon size={size} />;
    if (type.startsWith('video/')) return <Video size={size} />;
    if (type.startsWith('audio/')) return <Music size={size} />;
    if (type.includes('zip') || type.includes('archive')) return <Archive size={size} />;
    if (type.includes('pdf')) return <FileText size={size} />;
    // Add specific check for office documents
    if (type.includes('word') || type.includes('excel') || type.includes('spreadsheet') || type.includes('presentation')) return <FileText size={size} />;
    return <File size={size} />;
};

interface FilePreviewProps {
    file: FileItem;
    isOpen: boolean;
    onClose: () => void;
    theme: Theme;
    isSideView?: boolean;
}


export const FilePreview: React.FC<FilePreviewProps> = ({ file, isOpen, onClose, theme, isSideView = false }) => {
    const isLight = theme === 'light';
    const isImage = file.fileType?.startsWith('image/');
    const isVideo = file.fileType?.startsWith('video/');
    const isAudio = file.fileType?.startsWith('audio/');
    const isBlockNote = file.fileType === 'application/json';
    const isPdf = file.fileType === 'application/pdf';

    const isOfficeDoc = file.fileType && (
        file.fileType.includes('msword') ||
        file.fileType.includes('vnd.openxmlformats-officedocument.wordprocessingml') || // .docx
        file.fileType.includes('vnd.ms-excel') ||
        file.fileType.includes('vnd.openxmlformats-officedocument.spreadsheetml') || // .xlsx
        file.fileType.includes('vnd.ms-powerpoint') ||
        file.fileType.includes('vnd.openxmlformats-officedocument.presentationml') // .pptx
    );

    // General embeddable types, including PDF but excluding office docs
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

        // Default case for office docs or any other un-embeddable type
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
                isSideView ? 'lg:rounded-l-none lg:rounded-r-2xl' : 'lg:rounded-2xl'
            )}
        >
            <div className={`flex flex-row items-center justify-between p-4 border-b shrink-0 ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
                <div className="flex items-center gap-2 min-w-0">
                    <div className={`shrink-0 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{getFileIcon(file.fileType, 20)}</div>
                    <span className={`truncate font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{file.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    {file.url && (
                            <a href={file.url} download={file.name} onClick={(e) => e.stopPropagation()}>
                            <Button variant={isLight ? 'outline' : 'secondary'} size="sm" className="gap-2">
                                <Download size={16} />
                                Download
                            </Button>
                        </a>
                    )}
                        <Button onClick={onClose} variant="ghost" size="icon" className={`h-9 w-9 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className={`flex-1 flex items-center justify-center p-4 overflow-auto ${isBlockNote ? '' : (isLight ? 'bg-gray-50' : 'bg-black/20')}`}>
                {renderPreview()}
            </div>
        </div>
    );
    
    if (isSideView) {
        return content;
    }

    if (!isOpen) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-[200] p-0 lg:p-4 flex items-center justify-center",
                !isSideView && "bg-black/60 backdrop-blur-sm"
            )}
            onClick={onClose}
        >
            <div
                className={cn(
                    "w-full h-full lg:max-w-4xl lg:h-auto lg:max-h-[90vh]",
                    isSideView ? "lg:w-1/2" : "lg:w-full"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {content}
            </div>
        </div>
    );
};
