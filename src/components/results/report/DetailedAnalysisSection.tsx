import { FileText } from "lucide-react";

interface DetailedAnalysisSectionProps {
  personalityType: string;
}

export const DetailedAnalysisSection = ({ personalityType }: DetailedAnalysisSectionProps) => {
  const getDetailedAnalysis = (level: string) => {
    const analyses = {
      "9": "At Level 9, you have reached a state of transcendent morality where your actions naturally align with higher principles. You demonstrate remarkable unity between thought and action, operating from a place of deep spiritual awareness and selfless service. Your decisions flow naturally from a place of wisdom and divine purpose, without internal conflict or hesitation. This level of moral development is characterized by profound mercy, unconditional love, and a complete detachment from ego-driven desires. You understand that your life serves a greater purpose, and you accept both joy and suffering as part of your spiritual journey. While this level brings great peace and fulfillment, it also carries unique challenges, such as feeling isolated in a world that operates at different moral frequencies. Your challenge now is to maintain this elevated consciousness while remaining effectively engaged with society, serving as a beacon of light and wisdom for others on their moral journey.",
      "8": "At Level 8, you exemplify virtuous living through consistent moral excellence. Your actions are guided by deep wisdom and an intrinsic desire to do what is right, rather than external rewards or recognition. You demonstrate a remarkable balance between reason and compassion, approaching challenges with patience and humility. Your presence naturally inspires others to aspire to higher moral standards, not through preaching but through the example you set. While you maintain high personal standards, you also show understanding for others' moral struggles, recognizing that everyone's journey is unique. Your current challenge is to maintain this level of virtue while remaining humble and connected to those around you, using your moral advancement to uplift rather than separate.",
      "7": "At Level 7, you demonstrate unwavering commitment to your principles, consistently choosing what is right over what is expedient. Your moral compass is strong and reliable, guiding your decisions even in difficult circumstances. You show remarkable courage in standing up for your beliefs, even when it comes at personal cost. Your integrity has earned you the trust and respect of others, though you may sometimes feel the weight of maintaining such high standards. The challenge ahead is to balance your strong principles with flexibility and understanding, recognizing that moral growth is a journey for everyone.",
      "6": "At Level 6, you exhibit remarkable selflessness and willingness to sacrifice for others' benefit. Your actions are motivated by a genuine desire to help, without expectation of reward or recognition. You show particular strength in defending those who cannot protect themselves, often putting others' needs before your own comfort or safety. While this level of altruism is admirable, your challenge is to maintain healthy boundaries and ensure your sacrifices are sustainable and truly beneficial to those you aim to help.",
      "5": "At Level 5, you display strong emotional intelligence and deep empathy for others. Your ability to understand and connect with others' experiences makes you a natural mediator and source of emotional support. You navigate relationships with sensitivity and genuine care, often helping others process their emotions and challenges. Your challenge is to balance this emotional awareness with proper boundaries, ensuring you don't become overwhelmed by carrying others' emotional burdens.",
      "4": "At Level 4, you show a strong commitment to fairness and justice in your decisions and actions. You actively work to ensure equal treatment and accountability in your sphere of influence. Your sense of justice helps create more equitable environments, though you may sometimes struggle with balancing strict fairness against individual circumstances. Your challenge is to integrate mercy with justice, understanding that true fairness sometimes requires flexibility and compassion.",
      "3": "At Level 3, you demonstrate strong cooperative abilities and understanding of social contracts. You work well within group settings and understand the importance of mutual responsibility. Your commitment to community standards and group harmony makes you a reliable team member. Your challenge is to maintain your cooperative nature while developing stronger individual principles and moral independence.",
      "2": "At Level 2, you show pragmatic understanding of self-interest and strategic thinking. You make calculated decisions that benefit your long-term success while generally staying within societal rules. While you're focused on personal advancement, you're beginning to understand the value of ethical behavior in achieving your goals. Your challenge is to expand your perspective beyond pure self-interest to consider broader impacts of your choices.",
      "1": "At Level 1, you demonstrate basic survival awareness and self-preservation skills. You manage fundamental needs effectively and show potential for developing more sophisticated moral reasoning. While your focus is primarily on immediate security and stability, you're beginning to look beyond pure survival to consider longer-term implications of your choices. Your challenge is to build on this foundation to develop more complex moral understanding and decision-making capabilities."
    };
    return analyses[level as keyof typeof analyses] || "Your moral development level indicates potential for growth and advancement through the hierarchy. Continue reflecting on your choices and their impacts on yourself and others.";
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Your Detailed Analysis</h2>
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <FileText className="h-5 w-5 text-primary mt-1" />
          <p className="text-gray-600 leading-relaxed">
            {getDetailedAnalysis(personalityType)}
          </p>
        </div>
      </div>
    </section>
  );
};