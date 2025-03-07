
export const calculatePersonalityType = (answers: Record<string, number> | number[]): string => {
  // If answers is an array (old format)
  if (Array.isArray(answers)) {
    // Calculate the average score
    const sum = answers.reduce((acc, curr) => acc + curr, 0);
    const average = sum / answers.length;

    // Map the average score to a moral hierarchy level (1-9)
    if (average <= 1.5) return "1";
    if (average <= 2.0) return "2";
    if (average <= 2.5) return "3";
    if (average <= 3.0) return "4";
    if (average <= 3.5) return "5";
    if (average <= 4.0) return "6";
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

    // Map the average score to a moral hierarchy level (1-9)
    if (average <= 1.5) return "1";
    if (average <= 2.0) return "2";
    if (average <= 2.5) return "3";
    if (average <= 3.0) return "4";
    if (average <= 3.5) return "5";
    if (average <= 4.0) return "6";
    if (average <= 4.5) return "7";
    if (average <= 4.8) return "8";
    return "9";
  }
};
