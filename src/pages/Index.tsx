
import { useEffect } from "react";
import { WelcomePage } from "@/components/WelcomePage";
import { Question } from "@/components/Question";
import { Results } from "@/components/Results";
import { useQuiz } from "@/hooks/useQuiz";
import { Loader2 } from "lucide-react";
import { Session } from "@supabase/supabase-js";

interface IndexProps {
  session: Session | null;
}

const Index = ({ session }: IndexProps) => {
  const {
    currentStep,
    currentQuestion,
    handleStart,
    handleAnswer,
    progress,
    personalityType,
    loading,
    error,
    quizResultId
  } = useQuiz(session);

  useEffect(() => {
    console.log("Index component state:", {
      currentStep,
      hasCurrentQuestion: !!currentQuestion,
      progress,
      loading,
      error,
      quizResultId: quizResultId || null
    });
  }, [currentStep, currentQuestion, progress, loading, error, quizResultId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === "welcome" && <WelcomePage onStart={handleStart} />}
      
      {currentStep === "questions" && currentQuestion && (
        <Question
          question={currentQuestion.question}
          category={currentQuestion.category}
          subcategory={currentQuestion.subcategory}
          explanation={currentQuestion.explanation}
          level={currentQuestion.level}
          onAnswer={(value) => handleAnswer(currentQuestion.id, value)}
          currentProgress={progress}
        />
      )}
      
      {currentStep === "results" && personalityType && (
        <Results
          personalityType={personalityType}
          session={session}
          quizResultId={quizResultId}
        />
      )}
    </div>
  );
};

export default Index;
