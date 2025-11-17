import { motion } from "motion/react";

interface GlowingOrbProps {
  size?: number;
  color?: string;
  blur?: number;
  className?: string;
}

const GlowingOrb = ({
  size = 280,
  color = "rgba(56, 189, 248, 0.35)",
  blur = 120,
  className = "",
}: GlowingOrbProps) => {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
        filter: `blur(${blur}px)`,
      }}
      animate={{
        scale: [0.95, 1.05, 0.95],
        opacity: [0.5, 0.85, 0.5],
      }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
  );
};

export default GlowingOrb;
