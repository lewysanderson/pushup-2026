"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Target, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

interface ProfileSetupProps {
  groupId: string;
  groupCode?: string;
  onComplete: (profile: Profile) => void;
}

const AVATAR_OPTIONS = ["💪", "🔥", "⚡", "🦾", "🚀", "👑", "🎯", "💯"];

export function ProfileSetup({ groupId, groupCode, onComplete }: ProfileSetupProps) {
  const [username, setUsername] = useState("");
  const [dailyTarget, setDailyTarget] = useState("50");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleComplete = async () => {
    if (!username.trim()) {
      setError("Please enter your name");
      return;
    }

    const target = parseInt(dailyTarget) || 50;
    if (target < 1 || target > 1000) {
      setError("Daily target must be between 1 and 1000");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert({
          username: username.trim(),
          avatar_url: selectedAvatar,
          daily_target: target,
          group_id: groupId,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      onComplete(data);
    } catch (err) {
      console.error('Error creating profile:', err);
      setError("Failed to create profile. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
    >
      <div className="max-w-md w-full space-y-6">
        {groupCode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">Group Code: <span className="font-mono font-bold">{groupCode}</span></span>
            </div>
            <p className="text-xs text-muted-foreground">Share this code with friends to join your group</p>
          </motion.div>
        )}

        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="text-2xl">Create Your Profile</CardTitle>
            <CardDescription>
              Personalize your account and set your daily pushup goal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Choose Your Avatar
              </label>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`
                      aspect-square rounded-xl text-3xl flex items-center justify-center
                      transition-all active:scale-95
                      ${selectedAvatar === emoji
                        ? 'bg-primary/20 ring-2 ring-primary scale-110'
                        : 'glass hover:bg-white/10'
                      }
                    `}
                    disabled={isLoading}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Name</label>
              <Input
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={30}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                💡 Remember this! You'll use your name + group code to log back in.
              </p>
            </div>

            {/* Daily Target */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Daily Pushup Target
              </label>
              <Input
                type="number"
                placeholder="50"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(e.target.value)}
                min="1"
                max="1000"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Your personal goal for each day. You can change this later.
              </p>
            </div>

            {dailyTarget && parseInt(dailyTarget) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-primary/10 border border-primary/20"
              >
                <p className="text-sm text-center">
                  {parseInt(dailyTarget) * 365} pushups by end of 2026 🎯
                </p>
              </motion.div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleComplete}
              disabled={isLoading || !username.trim()}
            >
              {isLoading ? "Creating Profile..." : "Complete Setup"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
