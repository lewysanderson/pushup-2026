"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/lib/context/UserContext";
import { supabase } from "@/lib/supabase";
import { Copy, Check, Target, Users, Code } from "lucide-react";

export function Settings() {
  const { profile, group, setProfile, logout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [dailyTarget, setDailyTarget] = useState(profile?.daily_target.toString() || "50");
  const [isSaving, setIsSaving] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopyCode = () => {
    if (group?.code) {
      navigator.clipboard.writeText(group.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleSaveTarget = async () => {
    if (!profile) return;

    const newTarget = parseInt(dailyTarget);
    if (newTarget < 1 || newTarget > 1000) {
      alert("Daily target must be between 1 and 1000");
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ daily_target: newTarget })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, daily_target: newTarget });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating target:', error);
      alert("Failed to update target. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile || !group) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6 pb-24"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-6xl mb-4">{profile.avatar_url || "💪"}</div>
        <h2 className="text-3xl font-bold">{profile.username}</h2>
        <p className="text-muted-foreground">{group.name}</p>
      </div>

      {/* Group Code Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Group Invite Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-center font-mono text-3xl font-bold tracking-widest">
                  {group.code}
                </div>
              </div>
              <Button
                variant="glass"
                size="icon"
                className="h-14 w-14"
                onClick={handleCopyCode}
              >
                {codeCopied ? (
                  <Check className="h-5 w-5 text-primary" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Share this code with friends to join your group
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Group Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Group Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Group Name</span>
              <span className="font-semibold">{group.name}</span>
            </div>
            {group.group_target && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">2026 Target</span>
                <span className="font-semibold">{group.group_target.toLocaleString()} pushups</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Personal Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Personal Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Daily Target</label>
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    type="number"
                    value={dailyTarget}
                    onChange={(e) => setDailyTarget(e.target.value)}
                    min="1"
                    max="1000"
                    disabled={isSaving}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveTarget}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setDailyTarget(profile.daily_target.toString());
                      }}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                  <span className="text-2xl font-bold">{profile.daily_target} pushups/day</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Year goal at current target: {(profile.daily_target * 365).toLocaleString()} pushups
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logout Button */}
      <Button
        variant="destructive"
        size="lg"
        className="w-full"
        onClick={logout}
      >
        Logout
      </Button>
    </motion.div>
  );
}
