import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MoralExample {
  level: string;
  title: string;
  description: string;
}

export const GiftSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const level = searchParams.get("level") || "1";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkGiftStatus = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.user) {
          navigate("/auth");
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error("Error checking gift status:", error);
        toast({
          title: "Error",
          description: "Failed to verify gift status. Please try again.",
          variant: "destructive",
        });
        navigate("/assessment");
      }
    };

    checkGiftStatus();
  }, [navigate]);

  const getMoralExamples = (level: string): MoralExample[] => {
    // Examples based on the moral hierarchy levels
    const examples: { [key: string]: MoralExample[] } = {
      "1": [
        {
          level: "1",
          title: "Building Stability",
          description: "Like Viktor Frankl, who found meaning and helped others while surviving in concentration camps, demonstrating how one can maintain dignity even in the most challenging circumstances."
        }
      ],
      "2": [
        {
          level: "2",
          title: "Strategic Growth",
          description: "Similar to Benjamin Franklin's early career, using practical wisdom and self-improvement to achieve success while laying the groundwork for greater contributions."
        }
      ],
      "3": [
        {
          level: "3",
          title: "Community Building",
          description: "Following the example of Jane Addams, who established Hull House to create cooperative communities and support networks for immigrants."
        }
      ],
      "4": [
        {
          level: "4",
          title: "Justice Advocacy",
          description: "Like Thurgood Marshall, who dedicated his life to fighting for equal rights and justice through the legal system, showing how principled action can transform society."
        }
      ],
      "5": [
        {
          level: "5",
          title: "Empathetic Leadership",
          description: "Similar to Nelson Mandela's approach to reconciliation, demonstrating how understanding and forgiveness can heal deep societal wounds."
        }
      ],
      "6": [
        {
          level: "6",
          title: "Selfless Service",
          description: "Following Mother Teresa's example of dedicating one's life to serving others, particularly those most in need and forgotten by society."
        }
      ],
      "7": [
        {
          level: "7",
          title: "Principled Living",
          description: "Like Dietrich Bonhoeffer, who stood firmly by his principles even in the face of extreme adversity and personal danger."
        }
      ],
      "8": [
        {
          level: "8",
          title: "Moral Excellence",
          description: "Similar to Martin Luther King Jr.'s commitment to nonviolent resistance and universal love, exemplifying how moral excellence can transform society."
        }
      ],
      "9": [
        {
          level: "9",
          title: "Transcendent Impact",
          description: "Following the Buddha's example of complete dedication to truth and enlightenment, showing how alignment with universal principles can create lasting positive change."
        }
      ]
    };

    return examples[level] || examples["1"];
  };

  const examples = getMoralExamples(level);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-block p-3 bg-green-100 rounded-full">
            <Gift className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Gift Sent Successfully!</h1>
          <p className="text-gray-600">
            Your gift has been sent successfully. The recipient will receive an email with instructions to access their assessment.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            Inspiring Examples of Level {level} Moral Development
          </h2>
          
          {examples.map((example, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{example.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{example.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-8">
          <Button 
            onClick={() => navigate("/assessment")}
            className="flex items-center gap-2"
          >
            Take Another Assessment
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};