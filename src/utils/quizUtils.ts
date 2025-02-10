import { supabase } from "@/integrations/supabase/client";
import { QuizQuestion } from "@/types/quiz";
import { toast } from "@/hooks/use-toast";

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const fetchQuizQuestions = async (): Promise<QuizQuestion[]> => {
  try {
    console.log('Starting quiz questions fetch...');
    
    const { data: allQuestions, error } = await supabase
      .from('quiz_questions')
      .select('*');

    if (error) {
      console.error('Supabase error fetching questions:', {
        error,
        errorMessage: error.message,
        details: error.details
      });
      throw error;
    }
    
    if (!allQuestions || allQuestions.length === 0) {
      console.error('No questions found in database');
      throw new Error('No questions found in the database. Please add some questions first.');
    }

    console.log(`Successfully fetched ${allQuestions.length} questions`);

    // Group questions by level
    const questionsByLevel = allQuestions.reduce((acc, question) => {
      acc[question.level] = acc[question.level] || [];
      acc[question.level].push(question);
      return acc;
    }, {} as Record<number, QuizQuestion[]>);

    // Select 2 questions from each level (1-9)
    const selectedQuestions: QuizQuestion[] = [];
    for (let level = 1; level <= 9; level++) {
      const levelQuestions = questionsByLevel[level] || [];
      if (levelQuestions.length === 0) {
        console.warn(`No questions found for level ${level}`);
        continue;
      }
      const shuffled = shuffleArray(levelQuestions);
      selectedQuestions.push(...shuffled.slice(0, 2));
    }

    if (selectedQuestions.length === 0) {
      throw new Error('No questions could be selected from the database');
    }

    console.log(`Selected ${selectedQuestions.length} questions for the quiz`);
    return shuffleArray(selectedQuestions);
  } catch (error: any) {
    console.error('Error in fetchQuizQuestions:', {
      error,
      message: error.message,
      stack: error.stack
    });
    throw new Error(error.message || 'Failed to fetch quiz questions');
  }
};

export const saveQuizResults = async (
  personalityType: string, 
  userId: string, 
  answers: Record<string, number>
) => {
  try {
    const { error: insertError } = await supabase
      .from('quiz_results')
      .insert({
        personality_type: personalityType,
        answers,
        user_id: userId
      });

    if (insertError) throw insertError;
  } catch (error: any) {
    console.error('Error saving quiz results:', error);
    throw new Error('Failed to save quiz results');
  }
};

export const updateQuizProgress = async (userId: string) => {
  try {
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
  } catch (error: any) {
    console.error('Error updating quiz progress:', error);
    throw new Error('Failed to update quiz progress');
  }
};
