export interface Team {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'member';
  created_at: string;
}

export interface TeamAssessmentResult {
  id: string;
  team_id: string;
  assessment_date: string;
  average_level: number;
  individual_results: Record<string, any>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string;
  created_at: string;
}