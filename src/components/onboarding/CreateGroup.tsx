"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Target } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { generateGroupCode, formatNumber } from "@/lib/utils";

interface CreateGroupProps {
  onBack: () => void;
  onSuccess: (groupId: string, code: string) => void;
}

export function CreateGroup({ onBack, onSuccess }: CreateGroupProps) {
  const [groupName, setGroupName] = useState("");
  const [groupTarget, setGroupTarget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setError("Please enter a group name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const code = generateGroupCode();
      const target = groupTarget ? parseInt(groupTarget) : null;

      const { data, error: insertError } = await supabase
        .from('groups')
        .insert({
          name: groupName.trim(),
          code,
          group_target: target,
        })
        .select()
        .single();

      if (insertError) {
        // If code collision (unlikely), retry
        if (insertError.code === '23505') {
          handleCreate();
          return;
        }
        throw insertError;
      }

      onSuccess(data.id, code);
    } catch (err) {
      console.error('Error creating group:', err);
      setError("Failed to create group. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col p-6"
    >
      <Button
        variant="ghost"
        onClick={onBack}
        className="self-start mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="max-w-md w-full mx-auto space-y-6">
        <Card className="glass border-none">
          <CardHeader>
            <CardTitle className="text-2xl">Create Your Group</CardTitle>
            <CardDescription>
              Set a group name and optional 2026 target. You'll get a unique code to share.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Name</label>
              <Input
                placeholder="Beast Mode Squad"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={50}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                2026 Group Target (Optional)
              </label>
              <Input
                type="number"
                placeholder="100000"
                value={groupTarget}
                onChange={(e) => setGroupTarget(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Combined pushups goal for the entire group this year
              </p>
            </div>

            {groupTarget && parseInt(groupTarget) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-primary/10 border border-primary/20"
              >
                <p className="text-sm text-center">
                  <span className="font-bold text-primary">{formatNumber(parseInt(groupTarget))}</span> pushups in 2026
                </p>
              </motion.div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleCreate}
              disabled={isLoading || !groupName.trim()}
            >
              {isLoading ? "Creating..." : "Create Group"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
