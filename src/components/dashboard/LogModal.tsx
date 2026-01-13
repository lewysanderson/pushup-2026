"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import type { SetBreakdown } from "@/types";

interface LogModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (count: number, setsBreakdown?: SetBreakdown) => void;
  isLoading?: boolean;
}

export function LogModal({ open, onClose, onSubmit, isLoading }: LogModalProps) {
  const [count, setCount] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sets, setSets] = useState("");
  const [repsPerSet, setRepsPerSet] = useState("");

  const calculateTotal = () => {
    if (showAdvanced && sets && repsPerSet) {
      return parseInt(sets) * parseInt(repsPerSet);
    }
    return parseInt(count) || 0;
  };

  const handleSubmit = () => {
    const total = calculateTotal();
    if (total <= 0) return;

    let breakdown: SetBreakdown | undefined;
    if (showAdvanced && sets && repsPerSet) {
      breakdown = {
        sets: parseInt(sets),
        reps: parseInt(repsPerSet),
      };
    }

    onSubmit(total, breakdown);
  };

  const resetForm = () => {
    setCount("");
    setSets("");
    setRepsPerSet("");
    setShowAdvanced(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Log Pushups</DialogTitle>
          <DialogDescription>
            Add your pushups for today
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showAdvanced ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Reps</label>
              <Input
                type="number"
                placeholder="50"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                min="1"
                disabled={isLoading}
                className="text-center text-3xl h-16"
                autoFocus
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sets</label>
                  <Input
                    type="number"
                    placeholder="3"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    min="1"
                    disabled={isLoading}
                    className="text-center text-2xl h-14"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reps/Set</label>
                  <Input
                    type="number"
                    placeholder="20"
                    value={repsPerSet}
                    onChange={(e) => setRepsPerSet(e.target.value)}
                    min="1"
                    disabled={isLoading}
                    className="text-center text-2xl h-14"
                  />
                </div>
              </div>

              <AnimatePresence>
                {sets && repsPerSet && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center"
                  >
                    <div className="text-3xl font-bold text-primary">
                      {calculateTotal()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      total reps
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Toggle Advanced */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full"
            disabled={isLoading}
          >
            {showAdvanced ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Simple Mode
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Advanced (Sets & Reps)
              </>
            )}
          </Button>

          {/* Submit Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading || calculateTotal() <= 0}
          >
            <Plus className="mr-2 h-5 w-5" />
            {isLoading ? "Logging..." : "Log Pushups"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
