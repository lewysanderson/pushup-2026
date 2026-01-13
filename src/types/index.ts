import type { Database } from './database';

export type Group = Database['public']['Tables']['groups']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Log = Database['public']['Tables']['logs']['Row'];

export interface SetBreakdown {
  sets: number;
  reps: number;
}

export interface DailyStats {
  date: string;
  count: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  total_reps: number;
  streak: number;
}

export interface GroupStats {
  total_reps: number;
  group_target: number | null;
  member_count: number;
}
