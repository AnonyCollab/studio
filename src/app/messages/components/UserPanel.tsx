import { Mic, Headphones, Settings, MicOff, HeadphoneOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';

interface UserPanelProps {
  theme: 'light' | 'dark';
}

export function UserPanel({ theme }: UserPanelProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const isDark = theme === 'dark';

  return (
    <div className={`h-16 px-3 flex items-center justify-between gap-2 ${
      isDark ? 'bg-[#131823] border-t border-white/10' : 'bg-white border-t border-gray-200'
    }`}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="relative">
          <Avatar className={`w-10 h-10 ${isDark ? 'ring-2 ring-white/20' : 'ring-2 ring-gray-200'}`}>
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
          <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ${
            isDark ? 'border-2 border-[#131823]' : 'border-2 border-white'
          }`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm truncate ${isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>YourUsername</p>
          <p className={`text-xs truncate ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`}>Online</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2 rounded-lg transition-all ${
            isMuted
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : isDark
              ? 'bg-[#131823] border border-white/10 text-white/70 hover:text-[#22d3ee] hover:bg-white/10'
              : 'bg-gray-100 border border-gray-200 text-gray-600 hover:text-cyan-600 hover:bg-gray-200'
          }`}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setIsDeafened(!isDeafened)}
          className={`p-2 rounded-lg transition-all ${
            isDeafened
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : isDark
              ? 'bg-[#131823] border border-white/10 text-white/70 hover:text-[#22d3ee] hover:bg-white/10'
              : 'bg-gray-100 border border-gray-200 text-gray-600 hover:text-cyan-600 hover:bg-gray-200'
          }`}
        >
          {isDeafened ? <HeadphoneOff className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
        </button>
        <button className={`p-2 rounded-lg transition-all ${
          isDark 
            ? 'bg-[#131823] border border-white/10 text-white/70 hover:text-[#22d3ee] hover:bg-white/10' 
            : 'bg-gray-100 border border-gray-200 text-gray-600 hover:text-cyan-600 hover:bg-gray-200'
        }`}>
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
