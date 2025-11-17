import { ArrowRight, Users, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface FeaturedProjectCardProps {
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
  tags: string[];
  theme: "light" | "dark";
  size?: "large" | "medium" | "small";
}

export function FeaturedProjectCard({
  title,
  description,
  image,
  sector,
  owner,
  totalMembers,
  tags,
  theme,
  size = "medium",
}: FeaturedProjectCardProps) {
  const isDark = theme === "dark";

  const sizeClasses = {
    large: "col-span-2 row-span-2",
    medium: "col-span-1 row-span-2",
    small: "col-span-1 row-span-1",
  };

  const heightClasses = {
    large: "h-[600px]",
    medium: "h-[600px]",
    small: "h-[290px]",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border cursor-pointer transition-all ${
        sizeClasses[size]
      } ${heightClasses[size]} ${
        isDark
          ? "bg-[#131823] border-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
          : "bg-white border-gray-200 hover:border-cyan-500/50 hover:shadow-2xl"
      }`}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div
          className={`absolute inset-0 ${
            size === "large"
              ? isDark
                ? "bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/80 to-transparent"
                : "bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"
              : isDark
              ? "bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/90 to-[#0a0e1a]/20"
              : "bg-gradient-to-t from-gray-900 via-gray-900/90 to-gray-900/20"
          }`}
        />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6">
        {/* Sector Badge */}
        <div className="absolute top-4 right-4">
          <Badge
            className={`backdrop-blur-sm border ${
              isDark
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                : "bg-cyan-100 text-cyan-700 border-cyan-300"
            }`}
          >
            {sector}
          </Badge>
        </div>

        {/* Tags */}
        {size !== "small" && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, size === "large" ? 4 : 2).map((tag) => (
              <span
                key={tag}
                className={`px-3 py-1 rounded-full backdrop-blur-sm border ${
                  isDark
                    ? "bg-white/10 text-white border-white/20"
                    : "bg-white/30 text-white border-white/40"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-white mb-3 group-hover:text-cyan-300 transition-colors">
          {title}
        </h3>

        {/* Description - Only on large size */}
        {size === "large" && (
          <p className="text-gray-300 mb-4 line-clamp-2">{description}</p>
        )}

        {/* Owner and Stats */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-white/20">
              <AvatarImage src={owner.avatar} alt={owner.name} />
              <AvatarFallback className="bg-cyan-500 text-white">
                {owner.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-white">{owner.name}</div>
              {size !== "small" && (
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {totalMembers}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Active
                  </span>
                </div>
              )}
            </div>
          </div>

          {size === "large" && (
            <div
              className={`p-3 rounded-full transition-all ${
                isDark
                  ? "bg-cyan-500/20 text-cyan-300 group-hover:bg-cyan-400 group-hover:text-white"
                  : "bg-cyan-100 text-cyan-700 group-hover:bg-cyan-600 group-hover:text-white"
              }`}
            >
              <ArrowRight className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}