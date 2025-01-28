import { ArrowUpRight, CheckCircle2 } from "lucide-react";

interface GrowthRecommendationsProps {
  personalityType: string;
}

export const GrowthRecommendations = ({ personalityType }: GrowthRecommendationsProps) => {
  const getGrowthRecommendations = (level: string): string[] => {
    const recommendations: Record<string, string[]> = {
      "1": [
        "Practice making decisions that balance immediate needs with long-term stability",
        "Build trust gradually through small collaborative experiences",
        "Focus on developing emotional regulation skills",
        "Create a support network for personal growth"
      ],
      "2": [
        "Look for opportunities to help others while pursuing personal goals",
        "Practice active listening and empathy in relationships",
        "Develop skills that benefit both yourself and others",
        "Learn to balance competition with cooperation"
      ],
      "3": [
        "Strengthen your commitment to fairness in all interactions",
        "Take on responsibilities that serve the community",
        "Practice resolving conflicts through mutual understanding",
        "Build deeper, more meaningful relationships"
      ],
      "4": [
        "Develop your capacity for empathy while maintaining principles",
        "Learn to balance justice with mercy in your decisions",
        "Practice standing up for others, not just rules",
        "Seek to understand the root causes of unfairness"
      ],
      "5": [
        "Channel your emotional understanding into meaningful action",
        "Practice setting healthy boundaries while helping others",
        "Develop wisdom to guide your empathetic responses",
        "Learn to inspire positive change through understanding"
      ],
      "6": [
        "Ensure your sacrifices create lasting positive impact",
        "Balance selflessness with personal well-being",
        "Develop discernment in choosing when to give",
        "Inspire others through purposeful service"
      ],
      "7": [
        "Align your principles with universal truths",
        "Practice flexibility while maintaining integrity",
        "Lead by example without seeking recognition",
        "Help others develop their own moral compass"
      ],
      "8": [
        "Seek opportunities to mentor and guide others",
        "Balance excellence with humility",
        "Create systems that promote virtue in others",
        "Maintain growth mindset despite achievements"
      ],
      "9": [
        "Share your wisdom while remaining teachable",
        "Help others connect with universal truths",
        "Create lasting positive change in the world",
        "Maintain humility while inspiring excellence"
      ]
    };
    return recommendations[level] || [
      "Focus on personal growth and development",
      "Seek to understand your values and principles",
      "Practice mindfulness in your decisions",
      "Build meaningful connections with others"
    ];
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <ArrowUpRight className="h-5 w-5 text-primary" />
        Growth Recommendations
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {getGrowthRecommendations(personalityType).map((recommendation, index) => (
          <div key={index} className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-gray-600">{recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
