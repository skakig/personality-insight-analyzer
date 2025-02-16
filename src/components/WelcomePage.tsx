
import { HeroSection } from "./landing/HeroSection";
import { HowItWorks } from "./landing/HowItWorks";
import { WhatYoullLearn } from "./landing/WhatYoullLearn";
import { FinalCTA } from "./landing/FinalCTA";
import { Footer } from "./layout/Footer";

export const WelcomePage = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="min-h-screen overflow-hidden">
      <HeroSection onStart={onStart} />
      <HowItWorks />
      <WhatYoullLearn />
      <FinalCTA onStart={onStart} />
      <Footer />
    </div>
  );
};
