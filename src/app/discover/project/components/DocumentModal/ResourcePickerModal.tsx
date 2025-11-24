
import React, { useState, useMemo } from 'react';
import { X, Search, FileText, Image, Video, Archive, Link, Folder, CheckCircle2 } from 'lucide-react';
import { Attachment } from '../../types';

interface ResourcePickerModalProps {
  onClose: () => void;
  onSelect: (file: Partial<Attachment>) => void;
  isLight: boolean;
}

export const ResourcePickerModal: React.FC<ResourcePickerModalProps> = ({ onClose, onSelect, isLight }) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock Files (Consistent with Resources Page)
  const allFiles = [
      { id: 'f1', name: 'Brand_Guidelines_v2.pdf', type: 'PDF', size: '4.2 MB', date: 'Oct 12', icon: FileText, color: 'text-red-500', bg: 'bg-red-500/10' },
      { id: 'f2', name: 'Q4_Roadmap_Presentation.pptx', type: 'PPTX', size: '12.5 MB', date: 'Oct 10', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10' },
      { id: 'f3', name: 'Hero_Banner_Assets.zip', type: 'ZIP', size: '145 MB', date: 'Oct 08', icon: Archive, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { id: 'f4', name: 'UI_Kit_v3.fig', type: 'Figma', size: 'Link', date: 'Oct 05', icon: Link, color: 'text-purple-500', bg: 'bg-purple-500/10' },
      { id: 'f5', name: 'Landing_Page_Mockup.png', type: 'Image', size: '2.1 MB', date: 'Sep 28', icon: Image, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { id: 'f6', name: 'Demo_Walkthrough.mp4', type: 'Video', size: '450 MB', date: 'Sep 25', icon: Video, color: 'text-pink-500', bg: 'bg-pink-500/10' },
      { id: 'f7', name: 'Legal_Contracts.pdf', type: 'PDF', size: '1.2 MB', date: 'Sep 20', icon: FileText, color: 'text-red-500', bg: 'bg-red-500/10' },
      { id: 'f8', name: 'Social_Media_Kit.zip', type: 'ZIP', size: '56 MB', date: 'Sep 15', icon: Archive, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  const filters = ['All', 'PDF', 'Image', 'Video', 'ZIP'];

  const filteredFiles = useMemo(() => {
      return allFiles.filter(file => {
          const matchesFilter = filter === 'All' || file.type === filter || (filter === 'Image' && file.type === 'PNG');
          const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesFilter && matchesSearch;
      });
  }, [filter, searchQuery, allFiles]);

  const handleAttach = () => {
      const file = allFiles.find(f => f.id === selectedFileId);
      if (file) {
          onSelect({
              name: file.name,
              type: file.type,
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
                {filteredFiles.map(file => (
                    <div 
                        key={file.id}
                        onClick={() => setSelectedFileId(file.id)}
                        className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all group ${selectedFileId === file.id ? selectedClass : itemClass}`}
                    >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${file.bg} ${file.color}`}>
                            <file.icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-sm truncate ${textMain}`}>{file.name}</h4>
                            <div className={`flex items-center gap-2 text-xs ${textMuted}`}>
                                <span>{file.type}</span>
                                <span>•</span>
                                <span>{file.size}</span>
                                <span>•</span>
                                <span>{file.date}</span>
                            </div>
                        </div>
                        {selectedFileId === file.id && (
                            <CheckCircle2 size={20} className="text-brand-500" />
                        )}
                    </div>
                ))}
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
