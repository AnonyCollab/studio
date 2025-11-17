import { Users, Calendar, Clock, Tag } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  sector: string;
  owner: {
    name: string;
    avatar: string;
    initials: string;
  };
  totalMembers: number;
  createdDate: string;
  lastEditDate: string;
  tags: string[];
}

interface ProjectCardProps {
  project: Project;
  theme: "light" | "dark";
  onClick?: () => void;
}

export function ProjectCard({ project, theme, onClick }: ProjectCardProps) {
  const isDark = theme === "dark";

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded-lg border transition-all overflow-hidden ${
        isDark
          ? "bg-[#131823] border-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
          : "bg-white border-gray-200 hover:border-cyan-500/50 hover:shadow-lg"
      }`}
    >
      {/* Project Image */}
      <div className="relative w-full h-48 overflow-hidden">
        <ImageWithFallback
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div
          className={`absolute top-3 right-3 px-3 py-1 rounded-full backdrop-blur-sm ${
            isDark
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "bg-cyan-100 text-cyan-700 border border-cyan-300"
          }`}
        >
          {project.sector}
        </div>
      </div>

      {/* Project Content */}
      <div className="p-4">
        {/* Title */}
        <h3
          className={`mb-2 ${
            isDark ? "text-[#e5e7eb]" : "text-gray-900"
          }`}
        >
          {project.title}
        </h3>

        {/* Description */}
        <p
          className={`mb-4 line-clamp-2 ${
            isDark ? "text-[#94a3b8]" : "text-gray-600"
          }`}
        >
          {project.description}
        </p>

        {/* Owner Info */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b ${
          isDark ? 'border-white/5' : 'border-gray-100'
        }">
          <Avatar className="h-8 w-8">
            <AvatarImage src={project.owner.avatar} alt={project.owner.name} />
            <AvatarFallback
              className={
                isDark
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "bg-cyan-100 text-cyan-700"
              }
            >
              {project.owner.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div
              className={`truncate ${
                isDark ? "text-[#e5e7eb]" : "text-gray-900"
              }`}
            >
              {project.owner.name}
            </div>
            <div
              className={`${
                isDark ? "text-[#6b7280]" : "text-gray-500"
              }`}
            >
              Owner
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Users
              className={`h-4 w-4 ${
                isDark ? "text-cyan-400" : "text-cyan-600"
              }`}
            />
            <span
              className={`${
                isDark ? "text-[#94a3b8]" : "text-gray-600"
              }`}
            >
              {project.totalMembers} members
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Tag
              className={`h-4 w-4 ${
                isDark ? "text-cyan-400" : "text-cyan-600"
              }`}
            />
            <span
              className={`${
                isDark ? "text-[#94a3b8]" : "text-gray-600"
              }`}
            >
              {project.tags.length} tags
            </span>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Calendar
              className={`h-4 w-4 ${
                isDark ? "text-[#6b7280]" : "text-gray-500"
              }`}
            />
            <span
              className={`${
                isDark ? "text-[#6b7280]" : "text-gray-500"
              }`}
            >
              Created: {project.createdDate}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock
              className={`h-4 w-4 ${
                isDark ? "text-[#6b7280]" : "text-gray-500"
              }`}
            />
            <span
              className={`${
                isDark ? "text-[#6b7280]" : "text-gray-500"
              }`}
            >
              Last edit: {project.lastEditDate}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag, index) => {
            const tagColors = [
              isDark
                ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                : "bg-purple-100 text-purple-700 border-purple-300",
              isDark
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                : "bg-cyan-100 text-cyan-700 border-cyan-300",
              isDark
                ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                : "bg-orange-100 text-orange-700 border-orange-300",
              isDark
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-emerald-100 text-emerald-700 border-emerald-300",
              isDark
                ? "bg-pink-500/20 text-pink-300 border-pink-500/30"
                : "bg-pink-100 text-pink-700 border-pink-300",
            ];
            return (
              <Badge
                key={tag}
                variant="outline"
                className={`${tagColors[index % tagColors.length]} border`}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}