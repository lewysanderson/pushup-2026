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

export function Logger() {
  const { profile } = useUser();
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const loadTodayData = useCallback(async () => {
    if (!profile) return;

    try {
      const today = getTodayString();
      const { data } = await supabase
        .from('logs')
        .select('count')
        .eq('user_id', profile.id)
        .eq('date', today)
        .single();

      setTodayCount(data?.count || 0);
    } catch (error) {
      console.error('Error loading today data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [profile]);

  const loadStreak = useCallback(async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .rpc('calculate_streak', {
          user_uuid: profile.id,
          target_reps: profile.daily_target,
        });

      if (!error && data !== null) {
        setStreak(data);
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

      // Optimistic update
      setTodayCount(newTotal);

      const { error } = await supabase
        .from('logs')
        .upsert({
          user_id: profile.id,
          date: today,
          count: newTotal,
          sets_breakdown: setsBreakdown ? JSON.stringify(setsBreakdown) : null,
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
