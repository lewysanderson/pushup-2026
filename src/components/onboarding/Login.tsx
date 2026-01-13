"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, LogIn } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Profile, Group } from "@/types";

interface LoginProps {
  onBack: () => void;
  onSuccess: (profile: Profile, group: Group) => void;
}

export function Login({ onBack, onSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const trimmedUsername = username.trim();
    const trimmedCode = groupCode.trim().toUpperCase();

    if (!trimmedUsername) {
      setError("Please enter your username");
      return;
    }

    if (trimmedCode.length !== 6) {
      setError("Group code must be 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // First, find the group by code
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('code', trimmedCode)
        .single();

      if (groupError || !groupData) {
        setError("Invalid group code");
        setIsLoading(false);
        return;
      }

      // Then find the profile by username and group_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', trimmedUsername)
        .eq('group_id', groupData.id)
        .single();

      if (profileError || !profileData) {
        setError("Username not found in this group. Check your username or create a new profile.");
        setIsLoading(false);
        return;
      }

      // Success! Return both profile and group
      onSuccess(profileData, groupData);
    } catch (err) {
      console.error('Error logging in:', err);
      setError("Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value: string) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    setGroupCode(cleaned.slice(0, 6));
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
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Log in with your username and group code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                maxLength={30}
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Group Code</label>
              <Input
                placeholder="ABC123"
                value={groupCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                maxLength={6}
                disabled={isLoading}
                className="text-center text-2xl font-mono tracking-widest uppercase"
              />
              <p className="text-xs text-muted-foreground text-center">
                {groupCode.length}/6 characters
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
              onClick={handleLogin}
              disabled={isLoading || !username.trim() || groupCode.length !== 6}
            >
              <LogIn className="mr-2 h-5 w-5" />
              {isLoading ? "Logging in..." : "Log In"}
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
            Don&apos;t have an account?
          </p>
          <Button
            variant="link"
            onClick={onBack}
            className="text-primary"
          >
            Create a new profile or group
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
