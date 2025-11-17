interface NeonBadgeProps {
    label: string;
    variant?: "cyan" | "magenta" | "violet";
    className?: string;
  }
  
  const badgeVariants: Record<NonNullable<NeonBadgeProps["variant"]>, string> = {
    cyan: "from-cyan-400 via-cyan-300 to-cyan-500",
    magenta: "from-fuchsia-400 via-pink-400 to-fuchsia-500",
    violet: "from-purple-400 via-violet-400 to-purple-500",
  };
  
  const NeonBadge = ({ label, variant = "cyan", className = "" }: NeonBadgeProps) => {
    return (
      <span
        className={`inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.32em] text-white/80 shadow-[0_0_30px_rgba(56,189,248,0.45)] backdrop-blur ${badgeVariants[variant]} bg-gradient-to-r ${className}`}
      >
        {label}
      </span>
    );
  };
  
  export default NeonBadge;
  