"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Target, Zap, Calendar, Award } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/context/UserContext";
import { formatNumber } from "@/lib/utils";
import type { DailyStats, Log } from "@/types";

export function Analytics() {
  const { profile } = useUser();
  const [stats, setStats] = useState<{
    total2026: number;
    maxDay: number;
    maxSet: number;
    daysLogged: number;
    chartData: DailyStats[];
  }>({
    total2026: 0,
    maxDay: 0,
    maxSet: 0,
    daysLogged: 0,
    chartData: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadAnalytics();
    }
  }, [profile]);

  const loadAnalytics = async () => {
    if (!profile) return;

    try {
      // Fetch all logs for 2026
      const { data: logs, error } = await supabase
        .from('logs')
        .select('date, count, sets_breakdown')
        .eq('user_id', profile.id)
        .gte('date', '2026-01-01')
        .lte('date', '2026-12-31')
        .order('date', { ascending: true });

      if (error) throw error;

      const validLogs: Array<Pick<Log, 'date' | 'count' | 'sets_breakdown'>> = logs || [];

      if (validLogs.length === 0) {
        setIsLoading(false);
        return;
      }

      // Calculate stats
      const total = validLogs.reduce((sum, log) => sum + log.count, 0);
      const max = Math.max(...validLogs.map((log) => log.count));
      const daysLogged = validLogs.length;

      // Calculate max set (largest single set)
      let maxSet = 0;
      validLogs.forEach(log => {
        if (log.sets_breakdown) {
          try {
            const breakdown = typeof log.sets_breakdown === 'string'
              ? JSON.parse(log.sets_breakdown)
              : log.sets_breakdown;

            if (Array.isArray(breakdown)) {
              const maxInThisLog = Math.max(...breakdown);
              if (maxInThisLog > maxSet) {
                maxSet = maxInThisLog;
              }
            }
          } catch {
            // Ignore parse errors
          }
        }
      });

      // Prepare chart data (last 30 days or all data)
      const chartData = validLogs.slice(-30).map((log) => ({
        date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: log.count,
      }));

      setStats({
        total2026: total,
        maxDay: max,
        maxSet,
        daysLogged,
        chartData,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProjection = () => {
    if (!profile || stats.daysLogged === 0) return 0;
    const avgPerDay = stats.total2026 / stats.daysLogged;
    const daysInYear = 365;
    return Math.round(avgPerDay * daysInYear);
  };

  const calculateDailyNeeded = () => {
    if (!profile) return 0;
    const targetEOY = profile.daily_target * 365;
    const daysLeft = 365 - stats.daysLogged;
    const remaining = targetEOY - stats.total2026;
    if (daysLeft <= 0 || remaining <= 0) return 0;
    return Math.ceil(remaining / daysLeft);
  };

  if (!profile) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading analytics...</div>
      </div>
    );
  }

  const projection = calculateProjection();
  const dailyNeeded = calculateDailyNeeded();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6 pb-24"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Your Analytics</h2>
        <p className="text-muted-foreground">Track your progress through 2026</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-none">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatNumber(stats.total2026)}</div>
                  <div className="text-xs text-muted-foreground">Total 2026</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass border-none">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Zap className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatNumber(stats.maxDay)}</div>
                  <div className="text-xs text-muted-foreground">Max in One Day</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-none">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Award className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatNumber(stats.maxSet)}</div>
                  <div className="text-xs text-muted-foreground">Max Single Set</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass border-none">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.daysLogged}</div>
                  <div className="text-xs text-muted-foreground">Days Logged</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="col-span-2"
        >
          <Card className="glass border-none">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Target className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatNumber(projection)}</div>
                  <div className="text-xs text-muted-foreground">Projected End of Year</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Chart */}
      {stats.chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass border-none">
            <CardHeader>
              <CardTitle>Progress Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.chartData}>
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Tip */}
      {dailyNeeded > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="gradient-card border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Target className="h-5 w-5" />
                  <span className="font-semibold">Smart Tip</span>
                </div>
                <p className="text-sm">
                  To hit your 2026 goal of <span className="font-bold">{formatNumber(profile.daily_target * 365)}</span> pushups,
                  you need to average <span className="font-bold text-primary">{dailyNeeded} reps/day</span> for the rest of the year.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
