
import { 
    Folder, 
    Users, 
    Globe, 
    Lock, 
    TrendingUp, 
    Star, 
    Clock,
    BarChart3
  } from "lucide-react";
  
  interface SideNavigationProps {
    theme: "light" | "dark";
    activeSection?: string;
    onSectionChange?: (section: string) => void;
  }
  
  export function SideNavigation({ theme, activeSection, onSectionChange }: SideNavigationProps) {
    const isDark = theme === "dark";
  
    const navItems = [
      { id: "overview", label: "Overview", icon: BarChart3 },
      { id: "my", label: "My Projects", icon: Folder, count: 3 },
      { id: "team", label: "Team Projects", icon: Users, count: 2 },
      { id: "public", label: "Public", icon: Globe, count: 3 },
      { id: "invite", label: "Invite-Only", icon: Lock, count: 2 },
      { id: "trending", label: "Trending", icon: TrendingUp },
      { id: "starred", label: "Starred", icon: Star },
      { id: "recent", label: "Recent", icon: Clock },
    ];
  
    return (
      <div
        className={`rounded-lg border flex flex-col flex-1 ${
          isDark ? "bg-[#131823] border-white/10" : "bg-white border-gray-200"
        }`}
      >
        <div className="p-6">
          <div className={`mb-6 ${isDark ? "text-[#94a3b8]" : "text-gray-600"}`}>
            Quick Access
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange?.(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${
                    isActive
                      ? isDark
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-cyan-100 text-cyan-700"
                      : isDark
                      ? "text-[#94a3b8] hover:bg-white/5 hover:text-cyan-300"
                      : "text-gray-600 hover:bg-gray-100 hover:text-cyan-700"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count && (
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        isActive
                          ? isDark
                            ? "bg-cyan-400 text-white"
                            : "bg-cyan-600 text-white"
                          : isDark
                          ? "bg-white/10 text-[#6b7280]"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    );
  }
  
