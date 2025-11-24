
import { Project, ProjectCard } from "./ProjectCard";
import type { User } from 'firebase/auth';

interface ProjectGridProps {
  projects: Project[];
  theme: "light" | "dark";
  onJoinProject: (projectId: string) => void;
  user: User | null;
}

export function ProjectGrid({ projects, theme, onJoinProject, user }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} theme={theme} onJoinProject={onJoinProject} user={user} />
      ))}
    </div>
  );
}
