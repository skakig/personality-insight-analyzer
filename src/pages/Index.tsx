import { useState } from "react";
import { WelcomePage } from "@/components/WelcomePage";
import { Question } from "@/components/Question";
import { Results } from "@/components/Results";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const questions = [
  // Extraversion (E) vs. Introversion (I)
  "You regularly make new friends.",
  "You spend a lot of time exploring various random topics that pique your interest.",
  "You enjoy being the center of attention.",
  "You prefer to be directly involved in a situation rather than observing from the sidelines.",
  "You feel more energized after spending time with a group of people.",
  "You enjoy initiating conversations with others.",
  "You often take initiative in social situations.",
  "You feel comfortable in crowds.",
  
  // Sensing (S) vs. Intuition (N)
  "You prefer focusing on details rather than the big picture.",
  "You trust experience more than theoretical alternatives.",
  "You prefer practical, concrete solutions over abstract concepts.",
  "You often pay attention to small details in your environment.",
  "You prefer step-by-step instructions over figuring things out as you go.",
  "You value concrete facts more than abstract theories.",
  "You consider yourself more practical than creative.",
  "You prefer traditional methods over experimental approaches.",
  
  // Thinking (T) vs. Feeling (F)
  "You find it easy to make decisions based purely on logic.",
  "You prioritize efficiency over cooperation.",
  "You tend to analyze situations before reacting emotionally.",
  "You prefer making decisions based on objective criteria.",
  "You value truth over tact.",
  "You often consider the logical consequences before the personal impact.",
  "You believe that being right is more important than being liked.",
  "You prefer to organize tasks based on logical principles.",
  
  // Judging (J) vs. Perceiving (P)
  "You like to have a detailed plan before starting a project.",
  "You prefer having a structured daily routine.",
  "You always complete your tasks before relaxing.",
  "You like to have clear rules and guidelines.",
  "You prefer planning activities in advance.",
  "You feel stressed when things are disorganized.",
  "You prefer having a schedule over being spontaneous.",
  "You like to have everything decided and settled."
];

interface IndexProps {
  session: any;
}

const Index = ({ session }: IndexProps) => {
  const [currentStep, setCurrentStep] = useState<"welcome" | "questions" | "results">("welcome");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleStart = () => {
    setCurrentStep("questions");
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentStep("results");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const calculatePersonalityType = () => {
    const scores = {
      E: 0, I: 0,
      S: 0, N: 0,
      T: 0, F: 0,
      J: 0, P: 0
    };

    // E/I questions (0-7)
    for (let i = 0; i < 8; i++) {
      if (answers[i] > 3) scores.E += 1;
      else if (answers[i] < 3) scores.I += 1;
    }

    // S/N questions (8-15)
    for (let i = 8; i < 16; i++) {
      if (answers[i] > 3) scores.S += 1;
      else if (answers[i] < 3) scores.N += 1;
    }

    // T/F questions (16-23)
    for (let i = 16; i < 24; i++) {
      if (answers[i] > 3) scores.T += 1;
      else if (answers[i] < 3) scores.F += 1;
    }

    // J/P questions (24-31)
    for (let i = 24; i < 32; i++) {
      if (answers[i] > 3) scores.J += 1;
      else if (answers[i] < 3) scores.P += 1;
    }

    const type = [
      scores.E > scores.I ? 'E' : 'I',
      scores.S > scores.N ? 'S' : 'N',
      scores.T > scores.F ? 'T' : 'F',
      scores.J > scores.P ? 'J' : 'P'
    ].join('');

    return type;
  };

  const handlePurchase = async () => {
    try {
      const personalityType = calculatePersonalityType();
      const { error } = await supabase
        .from('quiz_results')
        .insert([
          {
            personality_type: personalityType,
            answers: answers
          }
        ]);

      if (error) throw error;

      toast({
        title: "Results Saved!",
        description: "Your personality type has been saved to your profile.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {session && (
        <div className="absolute top-4 right-4">
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      )}

      {currentStep === "welcome" && <WelcomePage onStart={handleStart} />}
      
      {currentStep === "questions" && (
        <Question
          question={questions[currentQuestion]}
          onAnswer={handleAnswer}
          currentProgress={(currentQuestion / questions.length) * 100}
        />
      )}
      
      {currentStep === "results" && (
        <Results
          personalityType={calculatePersonalityType()}
          onPurchase={handlePurchase}
          session={session}
        />
      )}
    </div>
  );
};

export default Index;
