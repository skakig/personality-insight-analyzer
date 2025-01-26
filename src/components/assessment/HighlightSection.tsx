interface HighlightSectionProps {
  level: string;
}

export const HighlightSection = ({ level }: HighlightSectionProps) => {
  const getHighlightText = (level: string) => {
    const highlights = {
      "1": "You're focused on building stability and security in your life.",
      "2": "You understand how to navigate and succeed in social situations.",
      "3": "You value fairness and cooperation in your relationships.",
      "4": "You have a strong sense of justice and accountability.",
      "5": "Your emotional intelligence sets you apart from others.",
      "6": "Your selfless nature makes a real difference in people's lives.",
      "7": "Your unwavering principles inspire those around you.",
      "8": "You embody excellence and inspire positive change.",
      "9": "Your actions align naturally with universal truths.",
    };
    return highlights[level as keyof typeof highlights] || "Your journey of moral growth continues.";
  };

  return (
    <p className="text-xl font-medium text-gray-900 leading-relaxed">
      {getHighlightText(level)}
    </p>
  );
};