import AnimatedReveal from "@/app/landing/components/AnimatedReveal";
import GradientText from "@/app/landing/components/GradientText";
import NeonBadge from "@/app/landing/components/NeonBadge";
import RotatingMesh from "@/app/landing/components/RotatingMesh";
import GlowingOrb from "@/app/landing/components/GlowingOrb";
import { heroContent } from "../data/landingContent";

const HeroSection = () => {
  return (
    <section className="relative mx-auto flex min-h-[90vh] w-full max-w-7xl flex-col justify-center overflow-hidden px-6 pb-16 pt-24 sm:px-12 md:flex-row md:items-center md:gap-12 lg:px-16">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/[0.04] via-transparent to-transparent" />
      <GlowingOrb size={520} blur={180} className="left-[-140px] top-[120px] hidden md:block" />
      <GlowingOrb size={420} blur={140} color="rgba(243, 95, 208, 0.35)" className="right-[-160px] top-[50%] hidden lg:block" />
      <div className="relative z-10 flex flex-1 flex-col gap-8">
        <AnimatedReveal direction="horizontal" distance={200}>
          <NeonBadge label={heroContent.eyebrow} variant="cyan" className="w-fit" />
        </AnimatedReveal>
        <AnimatedReveal>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            {heroContent.title.split(" ").slice(0, 3).join(" ")}{" "}
            <GradientText>{heroContent.title.split(" ").slice(3).join(" ")}</GradientText>
          </h1>
        </AnimatedReveal>
        <AnimatedReveal delay={0.12}>
          <p className="max-w-xl text-lg text-white/70 sm:text-xl">
            {heroContent.subtitle}
          </p>
        </AnimatedReveal>
        <AnimatedReveal delay={0.24}>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={heroContent.primaryCta.href}
              className="group inline-flex items-center rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_16px_40px_rgba(56,189,248,0.55)] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(232,121,249,0.65)]"
            >
              {heroContent.primaryCta.label}
            </a>
            <a
              href={heroContent.secondaryCta.href}
              className="inline-flex items-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/70 transition-colors duration-300 hover:border-white/40 hover:text-white"
            >
              {heroContent.secondaryCta.label}
            </a>
          </div>
        </AnimatedReveal>

        <AnimatedReveal delay={0.32}>
          <div className="mt-6 flex flex-wrap gap-8 text-white/70">
            {heroContent.metrics.map((metric) => (
              <div key={metric.label} className="min-w-[120px]">
                <p className="text-sm uppercase tracking-[0.32em] text-white/40">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{metric.value}</p>
              </div>
            ))}
          </div>
        </AnimatedReveal>
      </div>

      <AnimatedReveal direction="horizontal" reverse distance={240}>
        <div className="relative mt-12 flex flex-1 items-center justify-center md:mt-0">
          <div className="absolute inset-0 -z-20 rounded-full bg-[radial-gradient(circle_at_center,rgba(76,29,149,0.45)_0%,rgba(10,13,32,0)_68%)]" />
          <div className="relative w-full max-w-[520px] overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(23,7,71,0.55)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-white/5" />
            <RotatingMesh />
          </div>
        </div>
      </AnimatedReveal>
    </section>
  );
};

export default HeroSection;
