
export const calculatePersonalityType = (answers: Record<string, number> | number[]): string => {
  // If answers is an array (old format)
  if (Array.isArray(answers)) {
    // Calculate the average score
    const sum = answers.reduce((acc, curr) => acc + curr, 0);
    const average = sum / answers.length;

    // Map the average score to a moral hierarchy level (1-9) with more appropriate thresholds
    if (average <= 1.5) return "1";
    if (average <= 2.2) return "2";
    if (average <= 2.8) return "3";
    if (average <= 3.2) return "4";
    if (average <= 3.7) return "5";
    if (average <= 4.2) return "6";
    if (average <= 4.5) return "7";
    if (average <= 4.8) return "8";
    return "9";
  } 
  
  // If answers is an object (new format)
  else {
    // Convert object values to array and calculate average
    const values = Object.values(answers);
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const average = sum / values.length;

    // Map the average score to a moral hierarchy level (1-9) with more appropriate thresholds
    if (average <= 1.5) return "1";
    if (average <= 2.2) return "2";
    if (average <= 2.8) return "3";
    if (average <= 3.2) return "4";
    if (average <= 3.7) return "5";
    if (average <= 4.2) return "6";
    if (average <= 4.5) return "7";
    if (average <= 4.8) return "8";
    return "9";
  }
};
