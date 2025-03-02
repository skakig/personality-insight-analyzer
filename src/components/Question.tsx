
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
  level?: number;
}

export const Question = ({ 
  question, 
  onAnswer, 
  currentProgress,
  category,
  subcategory,
  explanation,
  level
}: QuestionProps) => {
  useEffect(() => {
    console.log("Question component mounted with:", { question, currentProgress, level });
  }, [question, currentProgress, level]);

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12 px-2 md:px-4">
      <div className="container mx-auto max-w-3xl">
        <Card className="p-3 md:p-6">
          <CardContent className="pt-4 md:pt-6">
            <ProgressBar currentProgress={currentProgress} />
            
            <QuestionHeader 
              question={question}
              category={category}
              subcategory={subcategory}
            />
            
            <AnswerOptions onAnswer={onAnswer} />

            <QuestionExplanation explanation={explanation} level={level} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
