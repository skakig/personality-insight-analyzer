import { useState } from "react";
import { personalityQuestions } from "@/data/personalityQuestions";
import { calculatePersonalityType } from "@/utils/personalityCalculator";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export const useQuiz = (session: any) => {
  const [currentStep, setCurrentStep] = useState<"welcome" | "questions" | "results">("welcome");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleStart = () => {
    setCurrentStep("questions");
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    
    if (currentQuestion < personalityQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentStep("results");
    }
  };

  const handlePurchase = async () => {
    try {
      if (!session?.user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to purchase detailed results.",
          variant: "destructive",
        });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!profile?.id) {
        toast({
          title: "Error",
          description: "User profile not found.",
          variant: "destructive",
        });
        return;
      }

      const personalityType = calculatePersonalityType(answers);

      const { error } = await supabase
        .from('quiz_results')
        .insert({
          personality_type: personalityType,
          answers: answers as Json,
          user_id: profile.id
        });

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

  return {
    currentStep,
    currentQuestion,
    answers,
    handleStart,
    handleAnswer,
    handlePurchase,
    totalQuestions: personalityQuestions.length,
    currentProgress: (currentQuestion / personalityQuestions.length) * 100,
    personalityType: answers.length === personalityQuestions.length ? calculatePersonalityType(answers) : null,
  };
};