import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReportHeader } from "./report/ReportHeader";
import { GrowthRecommendations } from "./report/GrowthRecommendations";
import { getLevelDescription } from "@/components/assessment/utils";
import { HighlightSection } from "@/components/assessment/HighlightSection";
import { GrowthPotential } from "@/components/assessment/GrowthPotential";
import { Sparkles, Star, Heart, Scale, Lightbulb } from "lucide-react";

interface DetailedReportProps {
  personalityType: string;
  analysis: string;
  scores: Record<string, number>;
}

export const DetailedReport = ({ personalityType, analysis }: DetailedReportProps) => {
  useEffect(() => {
    const sendDetailedReport = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;

        const { error } = await supabase.functions.invoke('send-detailed-report', {
          body: {
            email: user.email,
            personalityType,
            analysis
          }
        });

        if (error) throw error;

        toast({
          title: "Report Sent!",
          description: "Check your email for your detailed report.",
        });
      } catch (error) {
        console.error('Error sending report:', error);
        toast({
          title: "Error",
          description: "Failed to send report to email. Please try again later.",
          variant: "destructive",
        });
      }
    };

    sendDetailedReport();
  }, [personalityType, analysis]);

  const getSuccessMarkers = (level: string) => {
    const markers = {
      "9": [
        {
          title: "Complete Unity of Thought and Purpose",
          description: "You exhibit natural alignment with moral principles, acting instinctively with wisdom and purpose.",
          icon: <Sparkles className="h-5 w-5 text-primary" />
        },
        {
          title: "Detachment from Ego",
          description: "You demonstrate freedom from material attachments and operate from a place of pure service.",
          icon: <Star className="h-5 w-5 text-primary" />
        },
        {
          title: "Profound Mercy and Love",
          description: "You embody unconditional love and forgiveness, seeing beyond human failures.",
          icon: <Heart className="h-5 w-5 text-primary" />
        },
        {
          title: "Divine Balance",
          description: "You understand the harmony between justice and mercy, truth and compassion.",
          icon: <Scale className="h-5 w-5 text-primary" />
        },
        {
          title: "Higher Purpose",
          description: "You live as an instrument of divine will, accepting both joy and suffering as part of your mission.",
          icon: <Lightbulb className="h-5 w-5 text-primary" />
        }
      ],
      "8": [
        {
          title: "Pursuit of Moral Excellence",
          description: "You consistently strive to improve yourself morally, viewing growth as an ongoing journey.",
          icon: <Sparkles className="h-5 w-5 text-primary" />
        },
        {
          title: "Intrinsic Motivation",
          description: "You are driven by an inner desire to do what is right, finding fulfillment in living your values.",
          icon: <Star className="h-5 w-5 text-primary" />
        },
        {
          title: "Balance of Wisdom",
          description: "You approach challenges with patience and humility, balancing reason with compassion.",
          icon: <Scale className="h-5 w-5 text-primary" />
        },
        {
          title: "Inspiring Leadership",
          description: "Your actions serve as an example for others, inspiring positive change in those around you.",
          icon: <Lightbulb className="h-5 w-5 text-primary" />
        }
      ],
      "7": [
        {
          title: "Unwavering Integrity",
          description: "You stand firmly by your principles, even when faced with difficult choices or opposition.",
          icon: <Star className="h-5 w-5 text-primary" />
        },
        {
          title: "Moral Courage",
          description: "You demonstrate the strength to stand up for what's right, even at personal cost.",
          icon: <Heart className="h-5 w-5 text-primary" />
        },
        {
          title: "Consistent Truth",
          description: "Your actions align seamlessly with your values, building trust and respect.",
          icon: <Scale className="h-5 w-5 text-primary" />
        }
      ],
      "6": [
        {
          title: "Selfless Service",
          description: "You prioritize helping others without expecting recognition or reward.",
          icon: <Heart className="h-5 w-5 text-primary" />
        },
        {
          title: "Sacrificial Spirit",
          description: "You willingly accept personal costs to benefit others and support noble causes.",
          icon: <Star className="h-5 w-5 text-primary" />
        },
        {
          title: "Protection of Others",
          description: "You use your strength to defend and uplift those who cannot protect themselves.",
          icon: <Shield className="h-5 w-5 text-primary" />
        }
      ],
      "5": [
        {
          title: "Deep Empathy",
          description: "You possess a profound understanding of others' emotions and experiences.",
          icon: <Heart className="h-5 w-5 text-primary" />
        },
        {
          title: "Emotional Intelligence",
          description: "You navigate relationships with sensitivity and understanding.",
          icon: <Sparkles className="h-5 w-5 text-primary" />
        },
        {
          title: "Compassionate Action",
          description: "You respond to others' needs with kindness and practical support.",
          icon: <HandHeart className="h-5 w-5 text-primary" />
        }
      ],
      "4": [
        {
          title: "Justice Focus",
          description: "You prioritize fairness and equality in your decisions and actions.",
          icon: <Scale className="h-5 w-5 text-primary" />
        },
        {
          title: "Ethical Leadership",
          description: "You promote accountability and fairness in your sphere of influence.",
          icon: <Users className="h-5 w-5 text-primary" />
        }
      ],
      "3": [
        {
          title: "Cooperative Spirit",
          description: "You value and actively contribute to group harmony and success.",
          icon: <Users className="h-5 w-5 text-primary" />
        },
        {
          title: "Social Responsibility",
          description: "You understand and fulfill your obligations to the community.",
          icon: <Building className="h-5 w-5 text-primary" />
        }
      ],
      "2": [
        {
          title: "Strategic Thinking",
          description: "You make calculated decisions that benefit your long-term success.",
          icon: <Brain className="h-5 w-5 text-primary" />
        },
        {
          title: "Personal Growth",
          description: "You actively work on self-improvement and skill development.",
          icon: <ArrowUp className="h-5 w-5 text-primary" />
        }
      ],
      "1": [
        {
          title: "Survival Skills",
          description: "You demonstrate strong instincts for self-preservation and basic needs.",
          icon: <Shield className="h-5 w-5 text-primary" />
        },
        {
          title: "Basic Stability",
          description: "You maintain fundamental security and resource management.",
          icon: <Home className="h-5 w-5 text-primary" />
        }
      ]
    };
    return markers[level as keyof typeof markers] || [];
  };

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-8 p-4"
    >
      <Card className="overflow-hidden border-none shadow-lg bg-white">
        <CardContent className="p-8">
          <ReportHeader personalityType={personalityType} />
          
          <div className="mt-8 space-y-8">
            {/* Level Overview */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Your Moral Development Level</h2>
              <div className="bg-primary/5 rounded-lg p-6">
                <HighlightSection level={personalityType} />
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {getLevelDescription(personalityType)}
                </p>
              </div>
            </section>

            {/* Success Markers */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Key Success Markers</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {getSuccessMarkers(personalityType).map((marker, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-start gap-3">
                      {marker.icon}
                      <div>
                        <h3 className="font-medium text-gray-900">{marker.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{marker.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Growth Path */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Your Growth Path</h2>
              <GrowthPotential level={personalityType} />
            </section>

            {/* Detailed Analysis */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Your Detailed Analysis</h2>
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-gray-600 leading-relaxed">
                  {getDetailedAnalysis(personalityType)}
                </p>
              </div>
            </section>

            {/* Growth Recommendations */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Your Growth Recommendations</h2>
              <GrowthRecommendations personalityType={personalityType} />
            </section>

            {/* Final Reflection */}
            <section className="bg-secondary/5 rounded-lg p-6 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Final Reflection</h2>
              <p className="text-gray-600">
                Your journey in moral development is unique and valuable. Each step you take toward higher understanding
                and awareness contributes to both your personal growth and the betterment of those around you. Continue
                to embrace this path of growth while maintaining balance and compassion for yourself and others.
              </p>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  A copy of this report has been sent to your email for future reference.
                </p>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};