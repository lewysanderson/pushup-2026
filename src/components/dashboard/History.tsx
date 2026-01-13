"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Plus, Edit2, Trash2, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/context/UserContext";
import { formatNumber } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns";
import type { Log } from "@/types";

interface SetEntry {
  id: string;
  reps: string;
}

export function History() {
  const { profile } = useUser();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingLog, setEditingLog] = useState<Log | null>(null);
  const [count, setCount] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sets, setSets] = useState<SetEntry[]>([{ id: '1', reps: '' }]);

  useEffect(() => {
    if (profile) {
      loadMonthLogs();
    }
  }, [profile, currentMonth]);

  const loadMonthLogs = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', profile.id)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const existingLog = logs.find(log => log.date === format(date, 'yyyy-MM-dd'));

    if (existingLog) {
      setEditingLog(existingLog);
      setCount(existingLog.count.toString());

      // Parse existing sets breakdown if available
      if (existingLog.sets_breakdown) {
        try {
          const breakdown = typeof existingLog.sets_breakdown === 'string'
            ? JSON.parse(existingLog.sets_breakdown)
            : existingLog.sets_breakdown;

          if (Array.isArray(breakdown) && breakdown.length > 0) {
            setSets(breakdown.map((reps: number, idx: number) => ({
              id: String(idx + 1),
              reps: String(reps)
            })));
            setShowAdvanced(true);
          } else {
            setSets([{ id: '1', reps: '' }]);
            setShowAdvanced(false);
          }
        } catch {
          setSets([{ id: '1', reps: '' }]);
          setShowAdvanced(false);
        }
      } else {
        setSets([{ id: '1', reps: '' }]);
        setShowAdvanced(false);
      }
    } else {
      setEditingLog(null);
      setCount("");
      setSets([{ id: '1', reps: '' }]);
      setShowAdvanced(false);
    }
    setIsModalOpen(true);
  };

  const addSet = () => {
    setSets([...sets, { id: String(Date.now()), reps: '' }]);
  };

  const removeSet = (id: string) => {
    if (sets.length > 1) {
      setSets(sets.filter(set => set.id !== id));
    }
  };

  const updateSetReps = (id: string, reps: string) => {
    setSets(sets.map(set => set.id === id ? { ...set, reps } : set));
  };

  const calculateTotal = () => {
    if (showAdvanced) {
      return sets.reduce((sum, set) => {
        const reps = parseInt(set.reps) || 0;
        return sum + reps;
      }, 0);
    }
    return parseInt(count) || 0;
  };

  const handleSave = async () => {
    if (!profile || !selectedDate) return;

    const total = calculateTotal();

    if (total < 0) {
      alert("Please enter valid numbers");
      return;
    }

    setIsSaving(true);

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      let setsBreakdown = null;

      if (showAdvanced && sets.length > 0) {
        // Save as array of numbers [50, 20, 40]
        const validSets = sets
          .map(set => parseInt(set.reps))
          .filter(reps => !isNaN(reps) && reps > 0);

        if (validSets.length > 0) {
          setsBreakdown = validSets;
        }
      }

      if (total === 0 && editingLog) {
        // Delete if count is 0
        const { error } = await supabase
          .from('logs')
          .delete()
          .eq('id', editingLog.id);

        if (error) throw error;
        setLogs(logs.filter(log => log.id !== editingLog.id));
      } else if (editingLog) {
        // Update existing
        const { error } = await supabase
          .from('logs')
          .update({
            count: total,
            sets_breakdown: setsBreakdown
          })
          .eq('id', editingLog.id);

        if (error) throw error;
        setLogs(logs.map(log => log.id === editingLog.id ? {
          ...log,
          count: total,
          sets_breakdown: setsBreakdown
        } : log));
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('logs')
          .insert({
            user_id: profile.id,
            date: dateStr,
            count: total,
            sets_breakdown: setsBreakdown,
          })
          .select()
          .single();

        if (error) throw error;
        setLogs([data, ...logs].sort((a, b) => b.date.localeCompare(a.date)));
      }

      setIsModalOpen(false);
      setCount("");
      setSets([{ id: '1', reps: '' }]);
      setShowAdvanced(false);
      setEditingLog(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error saving log:', error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingLog || !confirm("Delete this entry?")) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('logs')
        .delete()
        .eq('id', editingLog.id);

      if (error) throw error;

      setLogs(logs.filter(log => log.id !== editingLog.id));
      setIsModalOpen(false);
      setEditingLog(null);
      setCount("");
      setSets([{ id: '1', reps: '' }]);
      setShowAdvanced(false);
    } catch (error) {
      console.error('Error deleting log:', error);
      alert("Failed to delete. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getLogForDate = (date: Date) => {
    return logs.find(log => log.date === format(date, 'yyyy-MM-dd'));
  };

  const getDaysInMonth = () => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    if (next <= new Date()) {
      setCurrentMonth(next);
    }
  };

  const canGoNext = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    return next <= new Date();
  };

  const formatSetsBreakdown = (setsBreakdown: any) => {
    if (!setsBreakdown) return null;

    try {
      const breakdown = typeof setsBreakdown === 'string'
        ? JSON.parse(setsBreakdown)
        : setsBreakdown;

      if (Array.isArray(breakdown) && breakdown.length > 0) {
        return breakdown.map((reps, idx) => `Set ${idx + 1}: ${reps}`).join(', ');
      }
    } catch {
      return null;
    }
    return null;
  };

  if (!profile) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 space-y-6 pb-24"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">History</h2>
          <p className="text-muted-foreground">View and edit your pushup logs</p>
        </div>

        {/* Month Navigator */}
        <Card className="glass border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={previousMonth}
              >
                ←
              </Button>
              <div className="text-xl font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </div>
              <Button
                variant="ghost"
                onClick={nextMonth}
                disabled={!canGoNext()}
              >
                →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Days List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        ) : (
          <div className="space-y-2">
            {getDaysInMonth().reverse().map((date) => {
              const log = getLogForDate(date);
              const isCurrent = isToday(date);
              const setsInfo = log ? formatSetsBreakdown(log.sets_breakdown) : null;

              return (
                <motion.div
                  key={date.toISOString()}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`glass border-none cursor-pointer transition-all hover:bg-white/10 ${
                      isCurrent ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleDateClick(date)}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${log ? 'bg-primary/20' : 'bg-secondary'}`}>
                            <Calendar className={`h-5 w-5 ${log ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <div className="font-semibold">
                              {format(date, 'EEEE, MMM d')}
                              {isCurrent && <span className="ml-2 text-xs text-primary">(Today)</span>}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {log ? `${formatNumber(log.count)} pushups` : 'No entry'}
                            </div>
                            {setsInfo && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {setsInfo}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {log && log.count >= profile.daily_target && (
                            <Check className="h-6 w-6 text-primary" />
                          )}
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLog ? 'Edit Entry' : 'Add Entry'}
            </DialogTitle>
            <DialogDescription>
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!showAdvanced ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Pushups</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  min="0"
                  disabled={isSaving}
                  className="text-center text-3xl h-16"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  Total for this day. Use "Track Individual Sets" for detailed breakdown.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-sm font-medium">Sets Breakdown</label>
                {sets.map((set, index) => (
                  <div key={set.id} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-12">Set {index + 1}</span>
                    <Input
                      type="number"
                      placeholder="Reps"
                      value={set.reps}
                      onChange={(e) => updateSetReps(set.id, e.target.value)}
                      min="0"
                      disabled={isSaving}
                      className="flex-1"
                    />
                    {sets.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSet(set.id)}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSet}
                  disabled={isSaving}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Set
                </Button>

                {sets.some(s => s.reps) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center space-y-2"
                  >
                    <div className="text-3xl font-bold text-primary">
                      {calculateTotal()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      total reps
                    </div>
                    {sets.filter(s => s.reps).length > 0 && (
                      <div className="text-xs text-muted-foreground pt-2 border-t border-primary/20">
                        Max set: {Math.max(...sets.map(s => parseInt(s.reps) || 0))} reps
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* Toggle Advanced */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
              disabled={isSaving}
            >
              {showAdvanced ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Simple Mode
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Track Individual Sets
                </>
              )}
            </Button>

            {editingLog && (
              <p className="text-xs text-muted-foreground text-center">
                Set total to 0 to delete this entry
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleSave}
                disabled={isSaving || calculateTotal() < 0}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
              {editingLog && (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSaving}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
