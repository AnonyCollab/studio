
'use client';

import React, { useState, useMemo } from 'react';
import { X, Search, FileText, Image, Video, Archive, Link, Folder, CheckCircle2, File as FileIcon } from 'lucide-react';
import { Attachment, FileItem, Theme } from '../../types';
import { useStore } from '../../store/useStore';


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


interface ResourcePickerModalProps {
  onClose: () => void;
  onSelect: (file: Partial<Attachment>) => void;
  isLight: boolean;
}

export const ResourcePickerModal: React.FC<ResourcePickerModalProps> = ({ onClose, onSelect, isLight }) => {
  const { files: allFiles } = useStore();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = ['All', 'PDF', 'Image', 'Video', 'ZIP', 'Document'];

  const filteredFiles = useMemo(() => {
      return (allFiles || []).filter(file => {
          if (file.type === 'folder') return false; // Exclude folders
          const matchesFilter = filter === 'All' 
              || (file.fileType && file.fileType.toLowerCase().includes(filter.toLowerCase()))
              || (filter === 'Document' && file.fileType === 'application/json');

          const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesFilter && matchesSearch;
      });
  }, [filter, searchQuery, allFiles]);

  const handleAttach = () => {
      const file = allFiles.find(f => f.id === selectedFileId);
      if (file) {
          onSelect({
              name: file.name,
              type: file.fileType || 'file',
              id: file.id
          });
      }
  };

  // Styles
  const overlayClass = isLight ? "bg-black/40 backdrop-blur-sm" : "bg-black/70 backdrop-blur-sm";
  const containerClass = isLight ? "bg-white border-slate-200 shadow-2xl" : "bg-[#18181b] border-white/10 shadow-2xl";
  const textMain = isLight ? "text-slate-900" : "text-white";
  const textMuted = isLight ? "text-slate-500" : "text-slate-400";
  const inputClass = isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-slate-200";
  const itemClass = isLight ? "hover:bg-slate-50 border-slate-100" : "hover:bg-white/5 border-white/5";
  const selectedClass = isLight ? "bg-brand-50 border-brand-200 ring-1 ring-brand-500" : "bg-brand-500/10 border-brand-500/50 ring-1 ring-brand-500";

  return (
    <>
        <div className={`fixed inset-0 z-[200] ${overlayClass}`} onClick={onClose} />
        
        <div className={`fixed inset-x-0 bottom-0 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 z-[210] w-full lg:w-[600px] h-[85vh] lg:h-[600px] flex flex-col rounded-t-3xl lg:rounded-2xl border overflow-hidden transition-all animate-in slide-in-from-bottom-10 lg:zoom-in-95 duration-300 ${containerClass}`}>
            
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b flex-shrink-0 ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
                <h2 className={`text-xl font-bold ${textMain}`}>Link Resource</h2>
                <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-slate-400'}`}>
                    <X size={20} />
                </button>
            </div>

            {/* Search & Filters */}
            <div className="p-4 space-y-4">
                <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} size={16} />
                    <input 
                        type="text" 
                        placeholder="Search files..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-brand-500/20 ${inputClass}`}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border ${
                                filter === f 
                                ? 'bg-brand-500 text-white border-brand-500 shadow-md' 
                                : `border-transparent ${isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 space-y-2">
                {filteredFiles.length === 0 && (
                    <div className={`flex flex-col items-center justify-center py-12 ${textMuted}`}>
                        <Folder size={32} className="mb-2 opacity-50" />
                        <p>No files found.</p>
                    </div>
                )}
                {filteredFiles.map(file => {
                    const icon = getFileIcon(file.fileType, 20);
                    const color = getFileColor(file.fileType);
                    return (
                        <div 
                            key={file.id}
                            onClick={() => setSelectedFileId(file.id)}
                            className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all group ${selectedFileId === file.id ? selectedClass : itemClass}`}
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-opacity-10 ${color}`}>
                                {icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className={`font-bold text-sm truncate ${textMain}`}>{file.name}</h4>
                                <div className={`flex items-center gap-2 text-xs ${textMuted}`}>
                                    <span>{file.fileType || 'File'}</span>
                                    {file.size && <><span>•</span><span>{file.size}</span></>}
                                    {file.createdAt && <><span>•</span><span>{new Date(file.createdAt.seconds * 1000).toLocaleDateString()}</span></>}
                                </div>
                            </div>
                            {selectedFileId === file.id && (
                                <CheckCircle2 size={20} className="text-brand-500" />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Footer */}
            <div className={`p-4 border-t mt-auto flex justify-end gap-3 ${isLight ? 'border-slate-100 bg-slate-50' : 'border-white/10 bg-white/5'}`}>
                <button 
                    onClick={onClose}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/10 text-slate-300'}`}
                >
                    Cancel
                </button>
                <button 
                    onClick={handleAttach}
                    disabled={!selectedFileId}
                    className="px-8 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    Attach Resource
                </button>
            </div>
        </div>
    </>
  );
};
