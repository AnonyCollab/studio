import AnimatedReveal from "@/app/landing/components/AnimatedReveal";
import GradientText from "@/app/landing/components/GradientText";
import NeonBadge from "@/app/landing/components/NeonBadge";
import GlowingOrb from "@/app/landing/components/GlowingOrb";
import { workflowHighlights } from "../data/landingContent";

const WorkflowSection = () => {
  return (
    <section className="relative mx-auto mt-12 w-full max-w-6xl overflow-hidden px-6 pb-28 sm:px-12 lg:px-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.22),rgba(8,10,27,0)_55%)]" />
      <GlowingOrb size={360} blur={160} color="rgba(56,189,248,0.25)" className="left-[-120px] top-[-120px]" />

      <AnimatedReveal direction="horizontal" distance={180}>
        <div className="flex flex-col items-start gap-6">
          <NeonBadge label="Workflow Architecture" variant="violet" />
          <h2 className="max-w-3xl text-3xl font-light text-white sm:text-4xl lg:text-5xl">
            Synchronize mindshare with <GradientText gradient="violet-cyan">ritual-ready cycles</GradientText>
          </h2>
          <p className="max-w-2xl text-lg text-white/70">
            Align distributed squads, automate rituals, and track outcomes with a command center that bends to your team’s rhythm.
          </p>
        </div>
      </AnimatedReveal>

      <div className="mt-16 grid gap-12 md:grid-cols-3">
        {workflowHighlights.map((stage, index) => (
          <AnimatedReveal key={stage.title} delay={index * 0.12} direction="vertical" distance={140}>
            <div className="relative flex h-full flex-col rounded-[32px] border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_60px_rgba(14,12,46,0.55)] backdrop-blur-xl">
              <span className="text-sm uppercase tracking-[0.32em] text-white/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-2xl font-semibold text-white">{stage.title}</h3>
              <p className="mt-4 text-white/70">{stage.description}</p>
              <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-white/5 opacity-50" />
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </AnimatedReveal>
        ))}
      </div>
    </section>
  );
};

export default WorkflowSection;
