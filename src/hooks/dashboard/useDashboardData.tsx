
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { QuizResult } from "@/types/quiz";
import { toast } from "@/hooks/use-toast";

export const useDashboardData = (session: Session | null) => {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [previousAssessments, setPreviousAssessments] = useState<QuizResult[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<QuizResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage);
  
  const paginatedAssessments = filteredAssessments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchData = async () => {
    try {
      if (!session?.user?.id) {
        console.error('No user ID found in session:', session);
        setError('User session is invalid');
        return;
      }

      console.log('Fetching data for user:', session.user.id);

      // Fetch subscription data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('corporate_subscriptions')
        .select('*')
        .eq('organization_id', session.user.id)
        .maybeSingle();

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError);
        setError('Failed to load subscription data');
      } else {
        setSubscription(subscriptionData);
      }

      // Fetch previous assessments
      const { data: assessments, error: assessmentsError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (assessmentsError) {
        console.error('Error fetching assessments:', assessmentsError);
        setError('Failed to load assessment history');
      } else {
        // Convert the raw data to QuizResult type with proper type handling
        const typedAssessments: QuizResult[] = assessments ? assessments.map(assessment => ({
          id: assessment.id,
          user_id: assessment.user_id,
          personality_type: assessment.personality_type,
          is_purchased: assessment.is_purchased || false,
          is_detailed: assessment.is_detailed || false,
          purchase_status: assessment.purchase_status || '',
          access_method: assessment.access_method || '',
          stripe_session_id: assessment.stripe_session_id || '',
          guest_email: assessment.guest_email || '',
          guest_access_token: assessment.guest_access_token || '',
          purchase_initiated_at: assessment.purchase_initiated_at,
          purchase_completed_at: assessment.purchase_completed_at,
          created_at: assessment.created_at,
          updated_at: assessment.updated_at || assessment.created_at,
          detailed_analysis: assessment.detailed_analysis || '',
          category_scores: typeof assessment.category_scores === 'string' 
            ? JSON.parse(assessment.category_scores) 
            : (assessment.category_scores as Record<string, number> | null),
          answers: assessment.answers,
          temp_access_token: assessment.temp_access_token || '',
          temp_access_expires_at: assessment.temp_access_expires_at,
          guest_access_expires_at: assessment.guest_access_expires_at,
          purchase_date: assessment.purchase_date,
          purchase_amount: assessment.purchase_amount,
          primary_level: assessment.primary_level || null,
          conversions: assessment.conversions || 0
        })) : [];
        
        setPreviousAssessments(typedAssessments);
        setFilteredAssessments(typedAssessments);
      }
    } catch (err: any) {
      console.error('Error in fetchData:', {
        error: err,
        session: session,
        userId: session?.user?.id
      });
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const searchAssessments = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredAssessments(previousAssessments);
    } else {
      const normalizedQuery = query.toLowerCase().trim();
      const filtered = previousAssessments.filter(assessment => {
        const createdDate = new Date(assessment.created_at).toLocaleDateString();
        const level = assessment.primary_level ? `Level ${assessment.primary_level}` : '';
        
        return (
          createdDate.toLowerCase().includes(normalizedQuery) ||
          level.toLowerCase().includes(normalizedQuery)
        );
      });
      setFilteredAssessments(filtered);
    }
    // Reset to first page when searching
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const changeItemsPerPage = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
      
      // Set up real-time subscription for quiz_results
      const channel = supabase
        .channel('dashboard-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'quiz_results',
            filter: `user_id=eq.${session.user.id}`
          },
          () => {
            console.log('Quiz results updated, refreshing data...');
            fetchData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session]);

  return {
    loading,
    subscription,
    error,
    previousAssessments,
    paginatedAssessments,
    filteredAssessments,
    searchQuery,
    currentPage,
    totalPages,
    itemsPerPage,
    fetchData,
    searchAssessments,
    goToPage,
    changeItemsPerPage
  };
};
