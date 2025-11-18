'use client';

import GlowingOrb from "@/app/landing/components/GlowingOrb";

interface AnimatedBackgroundProps {
  theme: "light" | "dark";
}

export default function AnimatedBackground({ theme }: AnimatedBackgroundProps) {
  const isDark = theme === "dark";

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {isDark ? (
        <>
          <GlowingOrb size={500} color="rgba(34, 211, 238, 0.15)" className="-top-1/4 left-1/4" />
          <GlowingOrb size={400} color="rgba(56, 189, 248, 0.1)" className="top-1/3 right-1/4" />
          <GlowingOrb size={450} color="rgba(168, 85, 247, 0.1)" className="bottom-0 left-1/2 -translate-x-1/2" />
        </>
      ) : (
        <>
          <GlowingOrb size={500} color="rgba(34, 211, 238, 0.2)" className="-top-1/4 left-1/4" />
          <GlowingOrb size={400} color="rgba(56, 189, 248, 0.15)" className="top-1/3 right-1/4" />
          <GlowingOrb size={450} color="rgba(168, 85, 247, 0.15)" className="bottom-0 left-1/2 -translate-x-1/2" />
        </>
      )}
    </div>
  );
}
