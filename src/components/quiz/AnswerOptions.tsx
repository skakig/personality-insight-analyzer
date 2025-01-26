import { Button } from "@/components/ui/button";
import { useState } from "react";

const options = [
  { value: 1, label: "Strongly Disagree", color: "#ea384c" },
  { value: 2, label: "Disagree", color: "#f87171" },
  { value: 3, label: "Neutral", color: "#9ca3af" },
  { value: 4, label: "Agree", color: "#86efac" },
  { value: 5, label: "Strongly Agree", color: "#22c55e" },
];

interface AnswerOptionsProps {
  onAnswer: (value: number) => void;
}

export const AnswerOptions = ({ onAnswer }: AnswerOptionsProps) => {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const handleAnswer = (value: number) => {
    setSelectedValue(value);
    onAnswer(value);
    setTimeout(() => {
      setSelectedValue(null);
    }, 300);
  };

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex justify-between text-sm text-gray-600 px-4">
        <span>Strongly Disagree</span>
        <span>Strongly Agree</span>
      </div>
      
      <div className="flex justify-between items-center gap-2 px-4">
        {options.map((option) => (
          <div key={option.value} className="flex flex-col items-center gap-2">
            <Button
              onClick={() => handleAnswer(option.value)}
              variant={selectedValue === option.value ? "default" : "outline"}
              className={`w-12 h-12 rounded-full transition-all p-0 hover:scale-110 ${
                selectedValue === option.value 
                  ? "bg-primary text-white transform scale-110" 
                  : ""
              }`}
              style={{
                backgroundColor: selectedValue === option.value ? option.color : undefined,
                borderColor: option.color,
                color: selectedValue === option.value ? "white" : option.color
              }}
            >
              {option.value}
            </Button>
            <span className="text-xs text-gray-500 text-center hidden md:block">
              {option.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};