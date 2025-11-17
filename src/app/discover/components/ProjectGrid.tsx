
import { Project, ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  theme: "light" | "dark";
}

export function ProjectGrid({ projects, theme }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} theme={theme} />
      ))}
    </div>
  );
}
