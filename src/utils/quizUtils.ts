import { supabase } from "@/integrations/supabase/client";
import { QuizQuestion } from "@/types/quiz";
import { toast } from "@/components/ui/use-toast";

export const fetchQuizQuestions = async (): Promise<QuizQuestion[]> => {
  try {
    // Get count of questions per level to ensure balanced selection
    const { data: levelCounts } = await supabase
      .from('quiz_questions')
      .select('level')
      .order('level');

    if (!levelCounts) {
      throw new Error('Failed to fetch question counts');
    }

    // Create a map of levels and how many questions we want from each
    const questionsPerLevel = 2; // We'll take 2 questions from each level
    const levels = Array.from(new Set(levelCounts.map(q => q.level))).sort();

    // Build our query to get all questions and handle randomization in memory
    const { data: allQuestions, error } = await supabase
      .from('quiz_questions')
      .select('*');

    if (error) throw error;
    if (!allQuestions || allQuestions.length === 0) {
      throw new Error('No questions found');
    }

    // Group questions by level
    const questionsByLevel = levels.reduce((acc, level) => {
      acc[level] = allQuestions.filter(q => q.level === level);
      return acc;
    }, {} as Record<number, QuizQuestion[]>);

    // Select random questions from each level
    const selectedQuestions = levels.flatMap(level => {
      const levelQuestions = questionsByLevel[level] || [];
      return shuffleArray(levelQuestions).slice(0, questionsPerLevel);
    });

    // Shuffle the final array to mix questions from different levels
    return shuffleArray(selectedQuestions);
  } catch (error: any) {
    console.error('Error fetching quiz questions:', error);
    throw new Error('Failed to fetch quiz questions');
  }
};

// Fisher-Yates shuffle algorithm for randomizing question order
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const saveQuizResults = async (
  personalityType: string, 
  userId: string, 
  answers: Record<string, number>
) => {
  const { error: insertError } = await supabase
    .from('quiz_results')
    .insert({
      personality_type: personalityType,
      answers,
      user_id: userId
    });

  if (insertError) throw insertError;
};

export const updateQuizProgress = async (userId: string) => {
  const { data: progressData, error: progressError } = await supabase
    .from('quiz_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (progressError && progressError.code !== 'PGRST116') {
    throw progressError;
  }

  if (!progressData) {
    const { error: insertProgressError } = await supabase
      .from('quiz_progress')
      .insert({
        user_id: userId,
        current_level: 1,
        completed_levels: [1]
      });

    if (insertProgressError) throw insertProgressError;
  }
};
