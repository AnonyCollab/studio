import { ReactNode, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface AnimatedRevealProps {
  children: ReactNode;
  distance?: number;
  direction?: "vertical" | "horizontal";
  reverse?: boolean;
  duration?: number;
  ease?: string | ((progress: number) => number);
  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  threshold?: number;
  delay?: number;
  className?: string;
}

const AnimatedReveal = ({
  children,
  distance = 120,
  direction = "vertical",
  reverse = false,
  duration = 0.9,
  ease = "power3.out",
  initialOpacity = 0,
  animateOpacity = true,
  scale = 0.98,
  threshold = 0.2,
  delay = 0,
  className,
}: AnimatedRevealProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const axis = direction === "horizontal" ? "x" : "y";
    const offset = reverse ? -distance : distance;

    gsap.set(element, {
      [axis]: offset,
      scale,
      opacity: animateOpacity ? initialOpacity : 1,
    });

    const animation = gsap.to(element, {
      [axis]: 0,
      scale: 1,
      opacity: 1,
      duration,
      ease,
      delay,
      scrollTrigger: {
        trigger: element,
        start: `top ${100 - threshold * 100}%`,
        toggleActions: "play none none none",
        once: true,
        onRefresh: (self) => {
          if (self && self.animation?.progress() !== 0) {
            gsap.set(element, { [axis]: 0, scale: 1, opacity: 1 });
          }
        },
      },
    });

    triggerRef.current = animation.scrollTrigger ?? null;

    return () => {
      animation.kill();
      triggerRef.current?.kill();
    };
  }, [
    animateOpacity,
    delay,
    direction,
    distance,
    duration,
    ease,
    initialOpacity,
    reverse,
    scale,
    threshold,
  ]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default AnimatedReveal;
