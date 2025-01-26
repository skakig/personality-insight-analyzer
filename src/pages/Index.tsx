import { useState } from "react";
import { WelcomePage } from "@/components/WelcomePage";
import { Question } from "@/components/Question";
import { Results } from "@/components/Results";
import { toast } from "@/components/ui/use-toast";

// Sample questions - in a real app, you'd have many more
const questions = [
  "You find it difficult to introduce yourself to other people.",
  "You often get so lost in thoughts that you ignore or forget your surroundings.",
  "You try to respond to your emails as soon as possible and cannot stand a messy inbox.",
  "You find it easy to stay relaxed and focused even when there is some pressure.",
  "You do not usually initiate conversations.",
];

const Index = () => {
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

  const handlePurchase = () => {
    toast({
      title: "Coming Soon!",
      description: "Detailed reports will be available in the next update.",
    });
  };

  // Simple personality type calculation (just for demo)
  const calculatePersonalityType = () => {
    const avg = answers.reduce((a, b) => a + b, 0) / answers.length;
    return avg > 3 ? "ENFJ" : "INTJ";
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
        />
      )}
    </div>
  );
};

export default Index;