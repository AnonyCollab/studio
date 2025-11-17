import HeroSection from "../sections/HeroSection";
import FeaturesSection from "../sections/FeaturesSection";
import WorkflowSection from "../sections/WorkflowSection";

const LandingPage = () => {
  return (
    <div className="relative overflow-hidden bg-black text-white">
      <HeroSection />
      <FeaturesSection />
      <WorkflowSection />
    </div>
  );
};

export default LandingPage;
