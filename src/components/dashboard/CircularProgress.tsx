"use client";

import { motion } from "framer-motion";
import { calculatePercentage, formatNumber } from "@/lib/utils";

interface CircularProgressProps {
  current: number;
  target: number;
  size?: number;
}

export function CircularProgress({ current, target, size = 240 }: CircularProgressProps) {
  const percentage = calculatePercentage(current, target);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const isComplete = current >= target;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth="10"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--chart-2))" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <motion.div
          key={current}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-bold"
        >
          {formatNumber(current)}
        </motion.div>
        <div className="text-sm text-muted-foreground">
          of {formatNumber(target)}
        </div>
        {isComplete && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-2 text-2xl"
          >
            🎯
          </motion.div>
        )}
        <div className="mt-2 text-lg font-semibold text-primary">
          {percentage}%
        </div>
      </motion.div>
    </div>
  );
}
