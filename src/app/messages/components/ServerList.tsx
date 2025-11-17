import { Home, Plus, Users, Gamepad2, Music, Code } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const servers = [
  { id: 'home', name: 'Home', icon: Home, isHome: true },
  { id: 'server1', name: 'Gaming Squad', icon: Gamepad2, color: 'bg-emerald-500' },
  { id: 'server2', name: 'Music Lovers', icon: Music, color: 'bg-pink-500' },
  { id: 'server3', name: 'Developers', icon: Code, color: 'bg-cyan-500' },
  { id: 'server4', name: 'Friends', icon: Users, color: 'bg-purple-500' },
];

interface ServerListProps {
  selectedServer: string;
  onSelectServer: (id: string) => void;
  theme: 'light' | 'dark';
}

export function ServerList({ selectedServer, onSelectServer, theme }: ServerListProps) {
  const isDark = theme === 'dark';
  return (
    <TooltipProvider delayDuration={100}>
      <div className={`w-20 flex-shrink-0 flex flex-col items-center py-3 gap-2 ${
        isDark ? 'bg-[#0a0e1a] border-r border-white/10' : 'bg-white border-r border-gray-200'
      }`}>
        {servers.map((server) => {
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
                      : server.color
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
                  <Icon className="w-6 h-6 text-white" />
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
            <button className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 hover:rounded-xl hover:scale-110 mt-2 border-2 border-dashed ${
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
    </TooltipProvider>
  );
}
