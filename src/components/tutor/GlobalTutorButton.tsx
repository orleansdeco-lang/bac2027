"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, X } from "lucide-react";
import { BacAITutor } from "./BacAITutor";
import { usePathname } from "next/navigation";

export function GlobalTutorButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // If already on the dedicated /tutor page, don't show floating drawer trigger
  if (pathname === "/tutor" || pathname === "/student/tutor") {
    return null;
  }

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 left-6 z-40" dir="rtl">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-xl shadow-purple-600/30 border border-white/20 backdrop-blur-md group"
          title="الأستاذ الذكي — المساعد البيداغوجي الفوري"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-xs font-black tracking-wide hidden sm:inline">
            الأستاذ الذكي 🤖
          </span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-mono hidden md:inline">
            AI BAC
          </span>
        </motion.button>
      </div>

      {/* Slide-over Drawer Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-start bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl h-[92vh] max-h-[850px] m-4 sm:mr-6 rounded-3xl overflow-hidden shadow-2xl border border-theme"
            >
              <BacAITutor isDrawer={true} onClose={() => setIsOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
