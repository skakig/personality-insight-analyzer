import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QuizQuestion } from "@/types/quiz";

export const fetchQuizQuestions = async () => {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('No questions available');

  return data;
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