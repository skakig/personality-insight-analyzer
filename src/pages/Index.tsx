import { WelcomePage } from "@/components/WelcomePage";
import { Question } from "@/components/Question";
import { Results } from "@/components/Results";
import { personalityQuestions } from "@/data/personalityQuestions";
import { useQuiz } from "@/hooks/useQuiz";

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

  return (
    <div className="min-h-screen bg-gray-50">
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