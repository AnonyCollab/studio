import { motion, useMotionValue, useSpring } from "motion/react";
import { ReactNode, useMemo } from "react";

interface TiltCardProps {
  children: ReactNode;
  intensity?: number;
  glare?: boolean;
  className?: string;
}

const springConfig = {
  damping: 30,
  stiffness: 200,
  mass: 1.2,
};

const TiltCard = ({
  children,
  intensity = 12,
  glare = true,
  className = "",
}: TiltCardProps) => {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  const scale = useSpring(1, springConfig);

  const glareStyle = useMemo(
    () => ({
      background:
        "radial-gradient(circle at 30% -20%, rgba(255,255,255,0.6), rgba(0,0,0,0) 55%)",
      mixBlendMode: "screen" as const,
    }),
    []
  );

  return (
    <motion.div
      className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.02] shadow-[0_20px_40px_rgba(14,14,64,0.45)] backdrop-blur-xl transition-[box-shadow] duration-500 hover:shadow-[0_26px_60px_rgba(16,16,80,0.65)] ${className}`}
      style={{
        perspective: 1000,
      }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const halfWidth = rect.width / 2;
        const halfHeight = rect.height / 2;

        rotateY.set(((x - halfWidth) / halfWidth) * intensity);
        rotateX.set(((halfHeight - y) / halfHeight) * intensity);
      }}
      onMouseEnter={() => {
        scale.set(1.015);
      }}
      onMouseLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
        scale.set(1);
      }}
    >
      <motion.div
        className="h-full w-full"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          scale,
          transformStyle: "preserve-3d",
        }}
      >
        <div className="relative z-10 h-full w-full p-5 sm:p-6 lg:p-8">
          {children}
        </div>
        {glare && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={glareStyle}
            animate={{ opacity: [0.22, 0.48, 0.22] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 border border-white/10 opacity-70" />
      </motion.div>
    </motion.div>
  );
};

export default TiltCard;
