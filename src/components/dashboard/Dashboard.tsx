"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Trophy, Calendar as CalendarIcon, User } from "lucide-react";
import { Analytics } from "./Analytics";
import { Leaderboard } from "./Leaderboard";
import { History } from "./History";
import { Settings } from "./Settings";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("history");

  return (
    <div className="relative min-h-screen">
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="analytics" className="mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Analytics />
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Leaderboard />
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <History />
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Settings />
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
          <div className="glass border-t">
            <TabsList className="w-full h-16 bg-transparent grid grid-cols-4 rounded-none">
              <TabsTrigger
                value="history"
                className="flex-col gap-1 data-[state=active]:bg-transparent data-[state=active]:text-primary"
              >
                <CalendarIcon className="h-5 w-5" />
                <span className="text-xs">Data Tracking</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex-col gap-1 data-[state=active]:bg-transparent data-[state=active]:text-primary"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs">Stats</span>
              </TabsTrigger>
              <TabsTrigger
                value="leaderboard"
                className="flex-col gap-1 data-[state=active]:bg-transparent data-[state=active]:text-primary"
              >
                <Trophy className="h-5 w-5" />
                <span className="text-xs">Ranks</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex-col gap-1 data-[state=active]:bg-transparent data-[state=active]:text-primary"
              >
                <User className="h-5 w-5" />
                <span className="text-xs">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
