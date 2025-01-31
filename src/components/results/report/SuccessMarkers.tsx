import { 
  Sparkles, Star, Heart, Scale, Lightbulb, ShieldCheck, 
  HeartHandshake, Users, Building2, Brain, ArrowUp, Home 
} from "lucide-react";

interface SuccessMarkersProps {
  personalityType: string;
}

export const SuccessMarkers = ({ personalityType }: SuccessMarkersProps) => {
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
          icon: <ShieldCheck className="h-5 w-5 text-primary" />
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
          icon: <HeartHandshake className="h-5 w-5 text-primary" />
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
          icon: <Building2 className="h-5 w-5 text-primary" />
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
          icon: <ShieldCheck className="h-5 w-5 text-primary" />
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

  return (
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
  );
};