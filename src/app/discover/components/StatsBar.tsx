import { Folder, Users, TrendingUp, Eye } from "lucide-react";

interface StatsBarProps {
  theme: "light" | "dark";
}

export function StatsBar({ theme }: StatsBarProps) {
  const isDark = theme === "dark";

  const stats = [
    { label: "Total Projects", value: "10", icon: Folder, change: "+2 this week" },
    { label: "Team Members", value: "47", icon: Users, change: "+5 this week" },
    { label: "Active Projects", value: "8", icon: TrendingUp, change: "80% active" },
    { label: "Total Views", value: "1.2K", icon: Eye, change: "+12% this week" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`p-4 rounded-lg border ${
              isDark
                ? "bg-[#131823] border-white/10"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`p-2 rounded-lg ${
                  isDark
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "bg-cyan-100 text-cyan-700"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className={`mb-1 ${isDark ? "text-[#e5e7eb]" : "text-gray-900"}`}>
              {stat.value}
            </div>
            <div className={`mb-2 ${isDark ? "text-[#94a3b8]" : "text-gray-600"}`}>
              {stat.label}
            </div>
            <div
              className={`${
                isDark ? "text-emerald-300" : "text-emerald-600"
              }`}
            >
              {stat.change}
            </div>
          </div>
        );
      })}
    </div>
  );
}
