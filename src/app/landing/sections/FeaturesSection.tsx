import AnimatedReveal from "@/app/landing/components/AnimatedReveal";
import GradientText from "@/app/landing/components/GradientText";
import NeonBadge from "@/app/landing/components/NeonBadge";
import TiltCard from "@/app/landing/components/TiltCard";
import { features } from "../data/landingContent";

const accentMap = {
  cyan: "from-cyan-400 via-sky-400 to-cyan-500",
  magenta: "from-fuchsia-400 via-rose-400 to-fuchsia-500",
  violet: "from-purple-400 via-indigo-400 to-purple-500",
};

const FeaturesSection = () => {
  return (
    <section id="features" className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24 pt-12 sm:px-12 lg:px-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <AnimatedReveal direction="horizontal" distance={180}>
        <div className="flex flex-col items-start gap-6">
          <NeonBadge label="Platform Modules" variant="magenta" className="mb-2" />
          <h2 className="max-w-3xl text-3xl font-light text-white sm:text-4xl lg:text-5xl">
            A neural-grade operating system for <GradientText gradient="magenta-orange">connected product teams</GradientText>
          </h2>
          <p className="max-w-2xl text-lg text-white/70">
            PulseMesh weaves every conversation, decision, and ritual into a living dataset—giving executives the clarity they crave without slowing teams down.
          </p>
        </div>
      </AnimatedReveal>

      <div className="mt-14 grid gap-10 md:grid-cols-3">
        {features.map((feature) => (
          <AnimatedReveal key={feature.id} delay={0.18}>
            <TiltCard className="h-full">
              <div className="flex h-full flex-col gap-6">
                <span className={`inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-white/70 shadow-[0_0_30px_rgba(255,255,255,0.12)]`}> 
                  {feature.badge}
                </span>
                <h3 className="text-2xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-white/70">
                  {feature.description}
                </p>
                <ul className="mt-auto space-y-3 text-sm text-white/60">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className={`mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-gradient-to-r ${accentMap[feature.accent as keyof typeof accentMap]}`} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TiltCard>
          </AnimatedReveal>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
