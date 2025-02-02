import { WelcomePage } from "@/components/WelcomePage";
import { Question } from "@/components/Question";
import { Results } from "@/components/Results";
import { useQuiz } from "@/hooks/useQuiz";
import { Loader2 } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface IndexProps {
  session: Session | null;
}

const Index = ({ session }: IndexProps) => {
  const navigate = useNavigate();
  const {
    currentStep,
    currentQuestion,
    handleStart,
    handleAnswer,
    progress,
    personalityType,
    loading,
    error
  } = useQuiz(session);

  useEffect(() => {
    console.log("Index component state:", {
      currentStep,
      hasCurrentQuestion: !!currentQuestion,
      progress,
      loading,
      error,
      sessionExists: !!session
    });

    // Redirect to auth if no session
    if (!session && currentStep !== "welcome") {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with the quiz.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [currentStep, currentQuestion, progress, loading, error, session, navigate]);

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

  const handleQuizStart = () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start the quiz.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    handleStart();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === "welcome" && <WelcomePage onStart={handleQuizStart} />}
      
      {currentStep === "questions" && currentQuestion && (
        <Question
          question={currentQuestion.question}
          category={currentQuestion.category}
          subcategory={currentQuestion.subcategory}
          explanation={currentQuestion.explanation}
          onAnswer={(value) => handleAnswer(currentQuestion.id, value)}
          currentProgress={progress}
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