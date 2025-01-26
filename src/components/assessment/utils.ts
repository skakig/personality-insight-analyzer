export const getLevelDescription = (level: string): string => {
  const descriptions: Record<string, string> = {
    "1": "Self-Preservation: Focused on meeting basic needs and survival instincts. This level is characterized by reactive decision-making and strong self-preservation tendencies.",
    "2": "Self-Interest: Pragmatic approach with understanding of societal rules. Your moral framework centers on personal success while following beneficial social norms.",
    "3": "Social Contract: Your morality is based on cooperation and mutual benefit. You understand the importance of fairness and shared responsibilities.",
    "4": "Justice: Strong focus on fairness and accountability. You prioritize equity and balance rights with responsibilities in your moral decisions.",
    "5": "Empathy: Deep understanding of others' perspectives. Your morality is guided by emotional awareness and compassion.",
    "6": "Altruism: Selfless actions for the greater good. You often prioritize others' well-being over personal comfort.",
    "7": "Integrity: Consistent adherence to principles. Your actions align naturally with your core values and beliefs.",
    "8": "Virtue: Natural embodiment of moral excellence. You aspire to higher standards and inspire others through example.",
    "9": "Self-Actualization: Perfect alignment with universal truths. Your actions naturally serve the greater good and eternal principles.",
  };
  return descriptions[level] || "Understanding your moral development journey.";
};