import { useEffect } from "react";
import { QuestionHeader } from "./quiz/QuestionHeader";
import { AnswerOptions } from "./quiz/AnswerOptions";
import { ProgressBar } from "./quiz/ProgressBar";
import { QuestionExplanation } from "./quiz/QuestionExplanation";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface QuestionProps {
  question: string;
  onAnswer: (value: number) => void;
  currentProgress: number;
  category?: string;
  subcategory?: string;
  explanation?: string;
}

export const Question = ({ 
  question, 
  onAnswer, 
  currentProgress,
  category,
  subcategory,
  explanation 
}: QuestionProps) => {
  useEffect(() => {
    console.log("Question component mounted with:", { question, currentProgress });
  }, [question, currentProgress]);

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card className="p-6">
          <CardContent className="pt-6">
            <ProgressBar currentProgress={currentProgress} />
            
            <QuestionHeader 
              question={question}
              category={category}
              subcategory={subcategory}
            />
            
            <AnswerOptions onAnswer={onAnswer} />

            {explanation && (
              <QuestionExplanation explanation={explanation} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};