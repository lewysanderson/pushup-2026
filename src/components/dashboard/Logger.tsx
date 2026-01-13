"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CircularProgress } from "./CircularProgress";
import { LogModal } from "./LogModal";
import { Plus, Flame } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/context/UserContext";
import { getTodayString } from "@/lib/utils";
import type { SetBreakdown } from "@/types";

interface StreakLog {
  count: number;
  date: string;
}

const calculateStreak = (logs: StreakLog[], target: number) => {
  const validDates = new Set(
    logs
      .filter((log) => log.count >= target)
      .map((log) => log.date)
  );

  let streak = 0;
  let currentStr = getTodayString();

  // If today is not valid (not entered or target not met), start checking from yesterday
  // This prevents the streak from showing as 0 just because today isn't done yet
  if (!validDates.has(currentStr)) {
    const d = new Date(currentStr);
    d.setDate(d.getDate() - 1);
    currentStr = d.toISOString().split('T')[0];
  }

  while (validDates.has(currentStr)) {
    streak++;
    const d = new Date(currentStr);
    d.setDate(d.getDate() - 1);
    currentStr = d.toISOString().split('T')[0];
  }

  return streak;
};

export function Logger() {
  const { profile } = useUser();
  const [todayCount, setTodayCount] = useState(0);
  const [todayBreakdown, setTodayBreakdown] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const loadTodayData = useCallback(async () => {
    if (!profile) return;

    try {
      const today = getTodayString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('logs') as any)
        .select('count, sets_breakdown')
        .eq('user_id', profile.id)
        .eq('date', today)
        .single();

      setTodayCount(data?.count || 0);

      if (data?.sets_breakdown) {
        const breakdown = Array.isArray(data.sets_breakdown)
          ? data.sets_breakdown
          : typeof data.sets_breakdown === 'string'
            ? JSON.parse(data.sets_breakdown)
            : [];
        setTodayBreakdown(breakdown);
      } else {
        setTodayBreakdown([]);
      }
    } catch (error) {
      console.error('Error loading today data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [profile]);

  const loadStreak = useCallback(async () => {
    if (!profile) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: logs } = await (supabase.from('logs') as any)
        .select('date, count')
        .eq('user_id', profile.id)
        .gte('date', '2026-01-01')
        .order('date', { ascending: false });

      if (logs) {
        const currentStreak = calculateStreak(logs, profile.daily_target);
        setStreak(currentStreak);
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      loadTodayData();
      loadStreak();
    }
  }, [profile, loadTodayData, loadStreak]);

  const handleLogPushups = async (count: number, setsBreakdown?: SetBreakdown) => {
    if (!profile) return;

    setIsLoading(true);

    try {
      const today = getTodayString();
      const newTotal = todayCount + count;

      let newSets: number[] = [];
      if (setsBreakdown && setsBreakdown.sets > 0) {
        newSets = Array(setsBreakdown.sets).fill(setsBreakdown.reps);
      } else {
        // If just total is entered, treat it as a single set
        newSets = [count];
      }

      const updatedBreakdown = [...todayBreakdown, ...newSets];

      // Optimistic update
      setTodayCount(newTotal);
      setTodayBreakdown(updatedBreakdown);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('logs') as any)
        .upsert({
          user_id: profile.id,
          date: today,
          count: newTotal,
          sets_breakdown: updatedBreakdown,
        }, {
          onConflict: 'user_id,date',
        });

      if (error) throw error;

      setIsModalOpen(false);

      // Check if streak should update
      if (newTotal >= profile.daily_target && todayCount < profile.daily_target) {
        setStreak((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error logging pushups:', error);
      // Revert optimistic update
      setTodayCount(todayCount);
      setTodayBreakdown(todayBreakdown);
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen p-6 space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-6xl mb-4"
          >
            {profile.avatar_url || "💪"}
          </motion.div>
          <h2 className="text-2xl font-bold">{profile.username}</h2>
          <div className="text-sm text-muted-foreground">Today&apos;s Progress</div>
        </div>

        {/* Circular Progress */}
        <CircularProgress
          current={todayCount}
          target={profile.daily_target}
        />

        {/* Quick Add Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="xl"
            className="rounded-full h-20 w-20 shadow-2xl shadow-primary/50"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-10 w-10" />
          </Button>
        </motion.div>

        {/* Streak Card */}
        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass border-none p-6">
              <div className="flex items-center gap-3">
                <Flame className="h-6 w-6 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{streak} Day Streak</div>
                  <div className="text-sm text-muted-foreground">
                    Keep it going!
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Log Modal */}
      <LogModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleLogPushups}
        isLoading={isLoading}
      />
    </>
  );
}
