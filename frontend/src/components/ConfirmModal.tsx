"use client";

import { useUIStore } from "@/store/use-ui-store";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmModal() {
  const { isConfirmOpen, confirmConfig, closeConfirm } = useUIStore();

  // If closed, return nothing (AnimatePresence handles the exit)
  return (
    <AnimatePresence>
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeConfirm(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.1 }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl"
          >
            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                {confirmConfig.title || "Confirm Action"}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {confirmConfig.message}
              </p>
            </div>
            
            <div className="flex items-center justify-end gap-3 bg-[var(--bg-primary)] px-6 py-4 border-t border-[var(--border-color)]">
              <button
                onClick={() => closeConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                style={{ color: "var(--text-primary)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => closeConfirm(true)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
