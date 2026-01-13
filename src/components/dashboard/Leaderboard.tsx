/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Users, Calendar, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/context/UserContext";
import { formatNumber, calculatePercentage } from "@/lib/utils";
import type { LeaderboardEntry, GroupStats } from "@/types";

// Explicitly define what a Profile looks like to prevent "never" errors
interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  daily_target: number;
  group_id: string;
}

export function Leaderboard() {
  const { profile, group } = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [groupStats, setGroupStats] = useState<GroupStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("total");
  const [progressData, setProgressData] = useState<any[]>([]);
  const [groupProfiles, setGroupProfiles] = useState<Profile[]>([]);
  const [selectedMember, setSelectedMember] = useState<LeaderboardEntry | null>(null);
  const [memberHistory, setMemberHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    if (!group) return;

    try {
      // Get all profiles in the group
      const { data, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('group_id', group.id);

      if (profilesError) throw profilesError;

      // Cast the data to our Profile type
      const profiles = data as Profile[] | null;

      if (!profiles || profiles.length === 0) {
        setIsLoading(false);
        return;
      }

      setGroupProfiles(profiles);

      // --- Prepare Progress Chart Data ---
      const userIds = profiles.map(p => p.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: allLogs } = await (supabase.from('logs') as any)
        .select('user_id, count, date')
        .in('user_id', userIds)
        .gte('date', '2026-01-01')
        .order('date', { ascending: true });

      if (allLogs) {
        // Create a map of cumulative totals per user
        const userTotals: Record<string, number> = {};
        userIds.forEach(id => userTotals[id] = 0);

        // Get all unique dates
        const uniqueDates = Array.from(new Set(allLogs.map((l: any) => l.date))).sort() as string[];
        
        // Build chart data points
        const chartData = uniqueDates.map(date => {
          const dayLogs = allLogs.filter((l: any) => l.date === date);
          
          // Update running totals
          dayLogs.forEach((log: any) => {
            if (userTotals[log.user_id] !== undefined) {
              userTotals[log.user_id] += log.count;
            }
          });

          // Create data point with current totals for everyone
          const entry: any = { date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
          profiles.forEach(p => {
            entry[p.id] = userTotals[p.id];
          });
          return entry;
        });

        // If too many data points, sample them to keep chart readable
        const sampledData = chartData.length > 30 
          ? chartData.filter((_, i) => i === 0 || i === chartData.length - 1 || i % Math.ceil(chartData.length / 30) === 0)
          : chartData;
          
        setProgressData(sampledData);
      }

      // Get total reps for each user
      const leaderboardData = await Promise.all(
        profiles.map(async (p) => {
          // We use (supabase.from('logs') as any) to ensure the chain doesn't break
          // if types are missing for the logs table
          const { data: logs } = await (supabase.from('logs') as any)
            .select('count, date')
            .eq('user_id', p.id)
            .gte('date', '2026-01-01')
            .lte('date', '2026-12-31');

          const totalReps = (logs || []).reduce((sum: number, log: any) => sum + (log.count || 0), 0);

          // Calculate streak
          const { data: streakData } = await supabase
            .rpc('calculate_streak', {
              user_uuid: p.id,
              target_reps: p.daily_target,
            });

          return {
            id: p.id,
            username: p.username,
            avatar_url: p.avatar_url,
            total_reps: totalReps,
            streak: streakData || 0,
          };
        })
      );

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [group]);

  const loadGroupStats = useCallback(async () => {
    if (!group) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('group_id', group.id);
      
      const profiles = data as { id: string }[] | null;

      if (!profiles) return;

      const userIds = profiles.map((p) => p.id);

      const { data: logs } = await (supabase.from('logs') as any)
        .select('count')
        .in('user_id', userIds)
        .gte('date', '2026-01-01')
        .lte('date', '2026-12-31');

      const totalReps = (logs || []).reduce((sum: number, log: any) => sum + (log.count || 0), 0);

      setGroupStats({
        total_reps: totalReps,
        group_target: group.group_target,
        member_count: profiles.length,
      });
    } catch (error) {
      console.error('Error loading group stats:', error);
    }
  }, [group]);

  useEffect(() => {
    if (profile && group) {
      loadLeaderboard();
      loadGroupStats();

      // Subscribe to realtime updates
      const channel = supabase
        .channel('leaderboard-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'logs',
          },
          () => {
            loadLeaderboard();
            loadGroupStats();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile, group, loadLeaderboard, loadGroupStats]);

  // Load history when a member is selected
  useEffect(() => {
    const loadMemberHistory = async () => {
      if (!selectedMember) return;
      setIsHistoryLoading(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase.from('logs') as any)
          .select('*')
          .eq('user_id', selectedMember.id)
          .order('date', { ascending: false })
          .limit(30);
        setMemberHistory(data || []);
      } catch (error) {
        console.error('Error loading member history:', error);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    loadMemberHistory();
  }, [selectedMember]);

  const getSortedLeaderboard = () => {
    if (activeTab === "total") {
      return [...leaderboard].sort((a, b) => b.total_reps - a.total_reps);
    }
    return [...leaderboard].sort((a, b) => b.streak - a.streak);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  if (!profile || !group) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading leaderboard...</div>
      </div>
    );
  }

  const sortedLeaderboard = getSortedLeaderboard();

  return (
    <div
      className="p-6 space-y-6 pb-24"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">{group.name}</h2>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{groupStats?.member_count || 0} members</span>
        </div>
      </div>

      {/* Group Progress Chart */}
      {progressData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-primary" />
                Race to the Top
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    {groupProfiles.map((p, i) => (
                      <Line
                        key={p.id}
                        type="monotone"
                        dataKey={p.id}
                        name={p.username}
                        stroke={CHART_COLORS[i % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Group Progress */}
      {groupStats && groupStats.group_target && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Group Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatNumber(groupStats.total_reps)} pushups
                </span>
                <span className="font-semibold">
                  {calculatePercentage(groupStats.total_reps, groupStats.group_target)}%
                </span>
              </div>
              <Progress
                value={calculatePercentage(groupStats.total_reps, groupStats.group_target)}
                className="h-3"
              />
              <div className="text-center text-xs text-muted-foreground">
                Goal: {formatNumber(groupStats.group_target)} pushups
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Leaderboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="total">
            <Trophy className="h-4 w-4 mr-2" />
            Total Reps
          </TabsTrigger>
          <TabsTrigger value="streak">
            <Flame className="h-4 w-4 mr-2" />
            Streak
          </TabsTrigger>
        </TabsList>

        <TabsContent value="total" className="space-y-3 mt-6">
          {sortedLeaderboard.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedMember(entry)}
            >
              <Card
                className={`glass border-none cursor-pointer hover:bg-white/5 transition-colors ${
                  entry.id === profile.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold w-12 text-center">
                      {getRankIcon(index)}
                    </div>
                    <div className="text-3xl">{entry.avatar_url || "💪"}</div>
                    <div className="flex-1">
                      <div className="font-semibold">
                        {entry.username}
                        {entry.id === profile.id && (
                          <span className="ml-2 text-xs text-primary">(You)</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatNumber(entry.total_reps)} pushups
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="streak" className="space-y-3 mt-6">
          {sortedLeaderboard.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedMember(entry)}
            >
              <Card
                className={`glass border-none cursor-pointer hover:bg-white/5 transition-colors ${
                  entry.id === profile.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold w-12 text-center">
                      {getRankIcon(index)}
                    </div>
                    <div className="text-3xl">{entry.avatar_url || "💪"}</div>
                    <div className="flex-1">
                      <div className="font-semibold">
                        {entry.username}
                        {entry.id === profile.id && (
                          <span className="ml-2 text-xs text-primary">(You)</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        {entry.streak} day streak
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Member History Modal */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{selectedMember?.avatar_url || "💪"}</span>
              <span>{selectedMember?.username}&apos;s History</span>
            </DialogTitle>
            <DialogDescription>
              Recent activity
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {isHistoryLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading history...</div>
            ) : memberHistory.length > 0 ? (
              <div className="space-y-2">
                {memberHistory.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="font-bold text-primary">
                      {formatNumber(log.count)} reps
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No logs found for 2026.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}