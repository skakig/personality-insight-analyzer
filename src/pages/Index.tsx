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
    currentProgress,
    personalityType,
    loading,
    error,
    currentQuestionData
  } = useQuiz(session);

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
      
      {currentStep === "questions" && currentQuestionData && (
        <Question
          question={currentQuestionData.question}
          onAnswer={handleAnswer}
          currentProgress={currentProgress}
        />
      )}
      
      {currentStep === "results" && personalityType && (
        <Results
          personalityType={personalityType}
          session={session}
        />
      )}
    </div>
  );
};

export default Index;