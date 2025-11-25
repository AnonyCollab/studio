
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileItem } from '../types';
import { Download, X, File, Image as ImageIcon, Video, Music, Archive, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FilePreviewProps {
    file: FileItem;
    isOpen: boolean;
    onClose: () => void;
    theme: 'light' | 'dark';
}

const getFileIcon = (type?: string, size = 48) => {
    if (!type) return <File size={size} />;
    if (type.startsWith('image/')) return <ImageIcon size={size} />;
    if (type.startsWith('video/')) return <Video size={size} />;
    if (type.startsWith('audio/')) return <Music size={size} />;
    if (type.includes('zip') || type.includes('archive')) return <Archive size={size} />;
    if (type.includes('pdf')) return <FileText size={size} />;
    return <File size={size} />;
};

export const FilePreview: React.FC<FilePreviewProps> = ({ file, isOpen, onClose, theme }) => {
    const isLight = theme === 'light';
    const isImage = file.fileType?.startsWith('image/');
    const isVideo = file.fileType?.startsWith('video/');
    const isAudio = file.fileType?.startsWith('audio/');
    
    // Check if the browser can likely embed the file type
    const canEmbed = file.fileType && (
        file.fileType.startsWith('text/') ||
        file.fileType === 'application/pdf'
    );

    const renderPreview = () => {
        if (!file.url) return <p>No preview available.</p>;

        if (isImage) {
            return <img src={file.url} alt={file.name} className="max-h-[70vh] max-w-full rounded-lg object-contain" />;
        }
        if (isVideo) {
            return <video src={file.url} controls className="w-full rounded-lg max-h-[70vh]" />;
        }
        if (isAudio) {
            return <audio src={file.url} controls className="w-full" />;
        }
        // Use embed for PDFs and other text-based files
        if (canEmbed) {
            return <embed src={file.url} type={file.fileType} className="w-full h-[75vh] rounded-lg border" />;
        }
        // Fallback for file types that cannot be embedded (like .docx, .xlsx)
        return (
            <div className={`flex flex-col items-center justify-center text-center p-8 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-white/5'}`}>
                <div className={`mb-4 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>{getFileIcon(file.fileType, 64)}</div>
                <h3 className={`text-lg font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>No preview available</h3>
                <p className={`text-sm mb-6 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>This file type can't be shown here, but you can download it.</p>
                <a href={file.url} download={file.name} onClick={(e) => e.stopPropagation()}>
                    <Button variant={isLight ? 'default' : 'secondary'} size="lg" className="gap-2">
                        <Download size={18} />
                        Download File
                    </Button>
                </a>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 border overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-[#18181b] border-white/10'}`}>
                <DialogHeader className={`flex flex-row items-center justify-between p-4 border-b shrink-0 ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
                    <DialogTitle className="flex items-center gap-2 min-w-0">
                        <div className={`shrink-0 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{getFileIcon(file.fileType, 20)}</div>
                        <span className={`truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{file.name}</span>
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                        <a href={file.url} download={file.name} onClick={(e) => e.stopPropagation()}>
                            <Button variant={isLight ? 'outline' : 'secondary'} size="sm" className="gap-2">
                                <Download size={16} />
                                Download
                            </Button>
                        </a>
                    </div>
                </DialogHeader>

                <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-black/10">
                    {renderPreview()}
                </div>
            </DialogContent>
        </Dialog>
    );
};
