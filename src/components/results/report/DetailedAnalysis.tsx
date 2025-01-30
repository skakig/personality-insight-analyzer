import { FileText, ChartBar, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DetailedAnalysisProps {
  analysis: string;
  scores: Record<string, number>;
  personalityType: string;
}

export const DetailedAnalysis = ({ analysis, scores, personalityType }: DetailedAnalysisProps) => {
  const getKeyCharacteristics = (level: string): string[] => {
    const characteristics = {
      "1": [
        "Focus on basic needs and survival",
        "Reactive decision-making",
        "Strong self-preservation instincts"
      ],
      "2": [
        "Pragmatic approach to decisions",
        "Understanding of societal rules",
        "Focus on personal success"
      ],
      "3": [
        "Emphasis on fairness and cooperation",
        "Strong sense of responsibility",
        "Value mutual benefit"
      ],
      "4": [
        "Strong sense of justice",
        "Balance rights with responsibilities",
        "Focus on accountability"
      ],
      "5": [
        "Deep emotional understanding",
        "Strong relational awareness",
        "Guided by empathy"
      ],
      "6": [
        "Selfless decision-making",
        "Focus on others' well-being",
        "Willing to sacrifice for greater good"
      ],
      "7": [
        "Strong moral principles",
        "Consistent ethical framework",
        "Integrity in action"
      ],
      "8": [
        "Natural moral excellence",
        "Inspiring through example",
        "Balance of wisdom and virtue"
      ],
      "9": [
        "Alignment with universal truths",
        "Transcendent perspective",
        "Legacy of positive impact"
      ]
    };
    return characteristics[level as keyof typeof characteristics] || [
      "Developing moral awareness",
      "Building ethical framework",
      "Growing in understanding"
    ];
  };

  const getGrowthPotential = (level: string): string => {
    const nextLevel = parseInt(level) + 1;
    if (nextLevel > 9) return "";
    
    const potentials = {
      "2": "Your journey leads toward building meaningful connections while maintaining success",
      "3": "Your path forward involves balancing personal goals with collective harmony",
      "4": "Your growth involves developing deeper empathy while upholding justice",
      "5": "Your next step is transforming emotional understanding into purposeful action",
      "6": "Your progression requires aligning selfless actions with enduring principles",
      "7": "Your advancement means elevating principles to inspire lasting change",
      "8": "Your evolution involves connecting excellence with universal wisdom",
      "9": "Your ultimate goal is achieving perfect alignment with eternal truths"
    };
    return potentials[nextLevel.toString() as keyof typeof potentials] || "";
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          Key Characteristics
        </h3>
        <div className="grid gap-4">
          {getKeyCharacteristics(personalityType).map((char, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
              <p className="text-gray-600">{char}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          Detailed Analysis
        </h3>
        <p className="text-gray-600 leading-relaxed">{analysis}</p>
      </Card>

      {scores && Object.keys(scores).length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <ChartBar className="h-5 w-5 text-primary" />
            Category Scores
          </h3>
          <div className="space-y-4">
            {Object.entries(scores).map(([category, score]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{category}</span>
                  <span className="font-medium">{score}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                    style={{ width: `${(score / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {getGrowthPotential(personalityType) && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <ArrowUpRight className="h-5 w-5 text-primary" />
            Growth Potential
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {getGrowthPotential(personalityType)}
          </p>
        </Card>
      )}
    </div>
  );
};