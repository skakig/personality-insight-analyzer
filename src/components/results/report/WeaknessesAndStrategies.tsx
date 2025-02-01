import { Card } from "@/components/ui/card";
import { ArrowUpRight, AlertTriangle, CheckCircle2 } from "lucide-react";

interface WeaknessAndStrategy {
  weakness: string;
  howToFix: string;
  example: string;
}

interface WeaknessesAndStrategiesProps {
  level: string;
}

export const WeaknessesAndStrategies = ({ level }: WeaknessesAndStrategiesProps) => {
  const getWeaknessesForLevel = (level: string): WeaknessAndStrategy[] => {
    const weaknesses: Record<string, WeaknessAndStrategy[]> = {
      "1": [
        {
          weakness: "Short-Term Thinking",
          howToFix: "Develop future-focused thinking by mapping out goals and consequences. Practice self-discipline and commit to long-term investments.",
          example: "A person who consistently skips investing in their skills and career, only to struggle later."
        },
        {
          weakness: "Fear-Based Choices",
          howToFix: "Learn to think clearly under pressure and develop strategies for emotional regulation.",
          example: "Making impulsive decisions during financial stress instead of planning for recovery."
        },
        {
          weakness: "Vulnerability to Manipulation",
          howToFix: "Build self-reliance and learn to identify exploitation attempts.",
          example: "Falling for get-rich-quick schemes out of desperation."
        }
      ],
      "2": [
        {
          weakness: "Over-Reliance on External Validation",
          howToFix: "Define personal success instead of relying on society's standards. Build self-confidence through aligned choices.",
          example: "Choosing a career solely for status rather than fulfillment."
        },
        {
          weakness: "Ruthlessness in Pursuit of Goals",
          howToFix: "Recognize that trust and reputation matter long-term. Develop principles beyond financial success.",
          example: "Burning bridges for short-term gains, damaging future opportunities."
        }
      ],
      "3": [
        {
          weakness: "Over-Conformity",
          howToFix: "Question norms that don't align with personal values. Advocate for positive change when needed.",
          example: "Supporting outdated traditions out of fear of disrupting status quo."
        },
        {
          weakness: "Conflict Avoidance",
          howToFix: "View conflict as an opportunity for growth. Learn constructive communication techniques.",
          example: "Letting important issues fester to maintain surface harmony."
        }
      ],
      "4": [
        {
          weakness: "Over-idealism and Rigidity",
          howToFix: "Balance idealism with practical solutions. Recognize that fairness exists on a spectrum.",
          example: "Refusing to compromise, delaying important reforms."
        },
        {
          weakness: "Excessive Focus on Punishment",
          howToFix: "Focus on restorative practices that promote healing and growth.",
          example: "Prioritizing retribution over understanding and rehabilitation."
        }
      ],
      "5": [
        {
          weakness: "Over-Identification with Others' Pain",
          howToFix: "Practice emotional detachment while maintaining compassion. Develop strong self-care habits.",
          example: "A counselor who burns out from absorbing clients' trauma."
        },
        {
          weakness: "Neglecting Personal Needs",
          howToFix: "Set healthy boundaries. Learn to say no without guilt.",
          example: "Exhausting yourself helping others while ignoring self-care."
        }
      ],
      "6": [
        {
          weakness: "The Martyr Complex",
          howToFix: "Remember that true sacrifice is about impact, not suffering. Set healthy limits.",
          example: "Believing personal suffering makes you morally superior."
        },
        {
          weakness: "Helping the Wrong People",
          howToFix: "Learn to discern between genuine need and manipulation.",
          example: "Enabling destructive behavior through misguided help."
        }
      ],
      "7": [
        {
          weakness: "Perfectionism and Self-Criticism",
          howToFix: "Recognize that integrity doesn't mean perfection. Learn from mistakes without self-punishment.",
          example: "Excessive guilt over minor ethical compromises."
        },
        {
          weakness: "Alienation and Loneliness",
          howToFix: "Find like-minded individuals while maintaining principles.",
          example: "Losing connections due to unwavering moral stances."
        }
      ],
      "8": [
        {
          weakness: "The Isolation of Being Highly Moral",
          howToFix: "Accept that being virtuous doesn't mean separating from society. Guide others rather than withdraw.",
          example: "Withdrawing from community due to moral differences."
        },
        {
          weakness: "Struggling to Relate to Others",
          howToFix: "Remember everyone's moral journey is different. Approach others with guidance, not judgment.",
          example: "Becoming impatient with those at different moral stages."
        }
      ],
      "9": [
        {
          weakness: "The Burden of Knowing",
          howToFix: "Accept that not everyone is ready for higher truths. Lead by gentle example.",
          example: "Feeling frustrated by humanity's resistance to change."
        },
        {
          weakness: "Misinterpretation by Others",
          howToFix: "Maintain humility and clarity, regardless of others' perceptions.",
          example: "Being either worshipped or vilified due to misunderstanding."
        }
      ]
    };
    
    return weaknesses[level] || [];
  };

  const weaknesses = getWeaknessesForLevel(level);

  if (!weaknesses.length) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <ArrowUpRight className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold text-gray-900">Weaknesses and Strategies for Growth</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {weaknesses.map((item, index) => (
          <Card key={index} className="p-6 bg-gray-50/50 border border-gray-100">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">{item.weakness}</h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">{item.howToFix}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
                <CheckCircle2 className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Example</h4>
                  <p className="mt-1 text-gray-600">{item.example}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};