import { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  gradient?: "cyan-magenta" | "violet-cyan" | "magenta-orange";
  className?: string;
}

const gradients: Record<NonNullable<GradientTextProps["gradient"]>, string> = {
  "cyan-magenta": "bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500",
  "violet-cyan": "bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400",
  "magenta-orange": "bg-gradient-to-r from-rose-400 via-orange-400 to-yellow-300",
};

const GradientText = ({
  children,
  gradient = "cyan-magenta",
  className = "",
}: GradientTextProps) => {
  return (
    <span className={`bg-clip-text text-transparent ${gradients[gradient]} ${className}`}>
      {children}
    </span>
  );
};

export default GradientText;
