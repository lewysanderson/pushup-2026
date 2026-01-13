"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, Plus, LogIn } from "lucide-react";

interface LandingProps {
  onCreateGroup: () => void;
  onJoinGroup: () => void;
  onLogin: () => void;
}

export function Landing({ onCreateGroup, onJoinGroup, onLogin }: LandingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
    >
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Title */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-center space-y-4"
        >
          <div className="text-6xl font-bold gradient-primary bg-clip-text text-transparent">
            2026
          </div>
          <h1 className="text-4xl font-bold">Pushup Challenge</h1>
          <p className="text-muted-foreground text-lg">
            Track your progress. Compete with friends. Dominate 2026.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <Button
            size="xl"
            className="w-full"
            onClick={onLogin}
          >
            <LogIn className="mr-2 h-5 w-5" />
            Log In
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or create new
              </span>
            </div>
          </div>

          <Button
            size="xl"
            variant="glass"
            className="w-full"
            onClick={onCreateGroup}
          >
            <Plus className="mr-2 h-5 w-5" />
            Create a Group
          </Button>

          <Button
            size="xl"
            variant="glass"
            className="w-full"
            onClick={onJoinGroup}
          >
            <Users className="mr-2 h-5 w-5" />
            Join a Group
          </Button>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-2 justify-center pt-4"
        >
          {["Real-time Leaderboards", "Progress Analytics", "Daily Streaks"].map((feature, i) => (
            <div
              key={i}
              className="px-4 py-2 rounded-full glass text-sm text-muted-foreground"
            >
              {feature}
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
