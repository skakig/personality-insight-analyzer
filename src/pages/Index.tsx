import { WelcomePage } from "@/components/WelcomePage";
import { Question } from "@/components/Question";
import { Results } from "@/components/Results";
import { Button } from "@/components/ui/button";
import { personalityQuestions } from "@/data/personalityQuestions";
import { useQuiz } from "@/hooks/useQuiz";
import { supabase } from "@/integrations/supabase/client";

interface IndexProps {
  session: any;
}

const Index = ({ session }: IndexProps) => {
  const {
    currentStep,
    currentQuestion,
    handleStart,
    handleAnswer,
    handlePurchase,
    currentProgress,
    personalityType
  } = useQuiz(session);

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
          question={personalityQuestions[currentQuestion]}
          onAnswer={handleAnswer}
          currentProgress={currentProgress}
        />
      )}
      
      {currentStep === "results" && personalityType && (
        <Results
          personalityType={personalityType}
          onPurchase={handlePurchase}
          session={session}
        />
      )}
    </div>
  );
};

export default Index;