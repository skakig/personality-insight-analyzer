import { ArrowUpRight } from "lucide-react";

interface GrowthPotentialProps {
  level: string;
}

export const GrowthPotential = ({ level }: GrowthPotentialProps) => {
  const getGrowthPotential = (level: string) => {
    const nextLevelNum = parseInt(level) + 1;
    const nextLevel = nextLevelNum.toString() as "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
    
    if (nextLevelNum > 9) return null;
    
    const potential = {
      "2": "Discover how to build meaningful connections while maintaining success",
      "3": "Learn to balance personal goals with collective harmony",
      "4": "Develop deeper empathy while upholding justice",
      "5": "Transform emotional understanding into purposeful action",
      "6": "Align your selfless actions with enduring principles",
      "7": "Elevate your principles to inspire lasting change",
      "8": "Connect your excellence with universal wisdom",
      "9": "Achieve perfect alignment with eternal truths",
    };
    return potential[nextLevel];
  };

  const growthText = getGrowthPotential(level);
  
  if (!growthText) return null;

  return (
    <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
      <div className="flex items-start gap-3">
        <ArrowUpRight className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <p className="font-medium text-gray-900">Your Growth Potential</p>
          <p className="text-gray-600 mt-1">{growthText}</p>
        </div>
      </div>
    </div>
  );
};