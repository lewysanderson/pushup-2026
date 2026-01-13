"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface JoinGroupProps {
  onBack: () => void;
  onSuccess: (groupId: string, groupName: string) => void;
}

export function JoinGroup({ onBack, onSuccess }: JoinGroupProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    const trimmedCode = code.trim().toUpperCase();

    if (trimmedCode.length !== 6) {
      setError("Code must be 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from('groups')
        .select('*')
        .eq('code', trimmedCode)
        .single();

      if (fetchError || !data) {
        setError("Invalid code. Please check and try again.");
        setIsLoading(false);
        return;
      }

      onSuccess(data.id, data.name);
    } catch (err) {
      console.error('Error joining group:', err);
      setError("Failed to join group. Please try again.");
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value: string) => {
    // Only allow alphanumeric, max 6 characters
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    setCode(cleaned.slice(0, 6));
    setError("");
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
            <CardTitle className="text-2xl">Join a Group</CardTitle>
            <CardDescription>
              Enter the 6-character code shared by your group admin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Code</label>
              <Input
                placeholder="ABC123"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                maxLength={6}
                disabled={isLoading}
                className="text-center text-2xl font-mono tracking-widest uppercase"
              />
              <p className="text-xs text-muted-foreground text-center">
                {code.length}/6 characters
              </p>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-destructive text-center"
              >
                {error}
              </motion.p>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleJoin}
              disabled={isLoading || code.length !== 6}
            >
              <Users className="mr-2 h-5 w-5" />
              {isLoading ? "Joining..." : "Join Group"}
            </Button>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-2"
        >
          <p className="text-sm text-muted-foreground">
            Don't have a code?
          </p>
          <Button
            variant="link"
            onClick={onBack}
            className="text-primary"
          >
            Create your own group instead
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
