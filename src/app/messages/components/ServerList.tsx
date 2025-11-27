
import { Home, Plus, Users, Gamepad2, Music, Code } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';
import { CreateServerDialog } from './CreateServerDialog';

interface Server {
  id: string;
  name: string;
  iconUrl?: string;
}

interface ServerListProps {
  servers: Server[];
  selectedServer: string;
  onSelectServer: (id: string) => void;
  theme: 'light' | 'dark';
}

export function ServerList({ servers, selectedServer, onSelectServer, theme }: ServerListProps) {
  const isDark = theme === 'dark';
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const allServers = [
    { id: 'home', name: 'Home', icon: Home, isHome: true },
    ...servers.map(s => ({
        id: s.id,
        name: s.name,
        iconUrl: s.iconUrl
    }))
  ];


  return (
    <TooltipProvider delayDuration={100}>
      <div className={`w-20 h-full flex-shrink-0 flex flex-col items-center py-3 gap-2 ${
        isDark ? 'bg-[#0a0e1a] border-r border-white/10' : 'bg-white border-r border-gray-200'
      }`}>
        {allServers.map((server) => {
          const Icon = server.icon;
          const isSelected = selectedServer === server.id;
          
          return (
            <Tooltip key={server.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelectServer(server.id)}
                  className={`relative group w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 hover:rounded-xl ${
                    server.isHome
                      ? isDark
                        ? 'bg-[#131823] border border-white/10 hover:border-cyan-400/50'
                        : 'bg-gray-100 border border-gray-200 hover:border-cyan-500/50'
                      : isDark ? 'bg-gray-700' : 'bg-gray-400'
                  } ${
                    isSelected 
                      ? `rounded-xl scale-110 ${
                          isDark 
                            ? 'shadow-[0_0_20px_rgba(34,211,238,0.15)] border-cyan-400/50' 
                            : 'shadow-lg'
                        }` 
                      : 'hover:scale-110'
                  }`}
                >
                  {Icon ? (
                    <Icon className="w-6 h-6 text-white" />
                  ) : (
                    server.iconUrl ? (
                      <img src={server.iconUrl} alt={server.name} className="w-full h-full object-cover rounded-2xl group-hover:rounded-xl transition-all duration-300" />
                    ) : (
                      <span className="text-white font-bold">{server.name.charAt(0)}</span>
                    )
                  )}
                  {isSelected && (
                    <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${
                      isDark ? 'bg-[#22d3ee]' : 'bg-cyan-600'
                    }`}></div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{server.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Add server button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={() => setIsCreateOpen(true)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 hover:rounded-xl hover:scale-110 mt-2 border-2 border-dashed ${
              isDark 
                ? 'bg-[#131823] border-white/30 hover:bg-emerald-500/20 hover:border-emerald-400/50' 
                : 'bg-gray-100 border-gray-300 hover:bg-emerald-100 hover:border-emerald-500/50'
            }`}>
              <Plus className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-700'}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Add a Server</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <CreateServerDialog isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} theme={theme} />
    </TooltipProvider>
  );
}
