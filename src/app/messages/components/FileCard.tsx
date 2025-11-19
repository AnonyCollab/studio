
'use client';

import { File, Download, FileText, Image, Video, Music, Archive } from "lucide-react";

interface FileCardProps {
  fileInfo: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
  theme: 'light' | 'dark';
}

const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-8 h-8 text-cyan-400" />;
    if (type.startsWith('video/')) return <Video className="w-8 h-8 text-purple-400" />;
    if (type.startsWith('audio/')) return <Music className="w-8 h-8 text-pink-400" />;
    if (type.includes('zip') || type.includes('archive')) return <Archive className="w-8 h-8 text-orange-400" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="w-8 h-8 text-blue-400" />;
    return <File className="w-8 h-8 text-gray-400" />;
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};


export function FileCard({ fileInfo, theme }: FileCardProps) {
  const isDark = theme === 'dark';

  return (
    <div
      className={`mt-2 p-3 rounded-lg border flex items-center gap-4 transition-all ${
        isDark 
          ? 'bg-[#131823] border-white/10' 
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex-shrink-0">
        {getFileIcon(fileInfo.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold truncate mb-1 ${isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>
          {fileInfo.name}
        </p>
        <p className={`text-xs ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`}>
          {formatFileSize(fileInfo.size)}
        </p>
      </div>
      <a
        href={fileInfo.url}
        target="_blank"
        rel="noopener noreferrer"
        download={fileInfo.name}
        className={`p-2 rounded-lg transition-colors ${
            isDark 
            ? 'bg-white/10 text-cyan-400 hover:bg-cyan-400/20'
            : 'bg-gray-100 text-cyan-600 hover:bg-cyan-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <Download className="w-5 h-5" />
      </a>
    </div>
  );
}
