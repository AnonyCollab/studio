import { Star, Users } from "lucide-react";

interface StarredProject {
  id: string;
  title: string;
  sector: string;
  totalMembers: number;
}

interface StarredProjectsListProps {
  theme: "light" | "dark";
}

export function StarredProjectsList({ theme }: StarredProjectsListProps) {
  const isDark = theme === "dark";

  const starredProjects: StarredProject[] = [
    { id: "1", title: "AnonyCollab Platform", sector: "Technology", totalMembers: 12 },
    { id: "6", title: "OpenSource DevTools", sector: "Open Source", totalMembers: 142 },
    { id: "3", title: "EduLearn Platform", sector: "Education", totalMembers: 15 },
  ];

  return (
    <div
      className={`rounded-lg border mt-6 ${
        isDark ? "bg-[#131823] border-white/10" : "bg-white border-gray-200"
      }`}
    >
      <div className="p-4">
        <div className={`mb-4 flex items-center gap-2 ${isDark ? "text-[#e5e7eb]" : "text-gray-900"}`}>
          <Star className={`h-5 w-5 ${isDark ? "text-cyan-400 fill-cyan-400" : "text-cyan-600 fill-cyan-600"}`} />
          <span>Starred Projects</span>
        </div>
        <div className="space-y-2">
          {starredProjects.map((project) => (
            <button
              key={project.id}
              className={`w-full p-3 rounded-lg border transition-all text-left ${
                isDark
                  ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-cyan-400/50"
                  : "bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-cyan-500/50"
              }`}
            >
              <div className={`mb-1 line-clamp-1 ${isDark ? "text-[#e5e7eb]" : "text-gray-900"}`}>
                {project.title}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded-full ${
                    isDark
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "bg-cyan-100 text-cyan-700"
                  }`}
                >
                  {project.sector}
                </span>
                <span
                  className={`flex items-center gap-1 ${
                    isDark ? "text-[#94a3b8]" : "text-gray-600"
                  }`}
                >
                  <Users className="h-3 w-3" />
                  {project.totalMembers}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
