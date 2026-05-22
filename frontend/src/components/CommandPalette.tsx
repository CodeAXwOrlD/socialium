"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/use-ui-store";

export default function CommandPalette() {
  const { isCommandPaletteOpen: open, setCommandPaletteOpen: setOpen } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const commands = [
    {
      group: "Actions",
      items: [
        {
          icon: "✨",
          label: "Generate new content",
          shortcut: "G",
          action: () => router.push("/content/generate"),
        },
        {
          icon: "📅",
          label: "Schedule a post",
          shortcut: "S",
          action: () => router.push("/scheduling"),
        },
        {
          icon: "🔥",
          label: "View viral scores",
          action: () => router.push("/scheduling"),
        },
        {
          icon: "🤖",
          label: "View AI memory",
          action: () => router.push("/memory"),
        },
      ],
    },
    {
      group: "Navigate",
      items: [
        {
          icon: "📊",
          label: "Dashboard",
          action: () => router.push("/dashboard"),
        },
        {
          icon: "📈",
          label: "Analytics",
          action: () => router.push("/analytics"),
        },
        {
          icon: "🔗",
          label: "Connect platforms",
          action: () => router.push("/platforms"),
        },
        {
          icon: "💳",
          label: "Billing",
          action: () => router.push("/billing"),
        },
      ],
    },
    {
      group: "Quick create",
      items: [
        {
          icon: "💼",
          label: "LinkedIn post",
          action: () => router.push("/content/generate?platform=linkedin"),
        },
        {
          icon: "🐦",
          label: "Twitter thread",
          action: () => router.push("/content/generate?platform=twitter"),
        },
        {
          icon: "📸",
          label: "Instagram caption",
          action: () => router.push("/content/generate?platform=instagram"),
        },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 p-4"
          >
            <Command className="glass-dark glass-border rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
              {/* Search input */}
              <div className="flex items-center px-6 border-b border-white/5 bg-white/[0.02]">
                <span className="text-brand-500 mr-4 text-xl font-bold">⌘</span>
                <Command.Input
                  placeholder="Search commands, pages, actions..."
                  className="flex-1 py-6 bg-transparent text-white placeholder-white/20 outline-none text-base"
                />
              </div>

              {/* Results */}
              <Command.List className="max-h-80 overflow-y-auto p-2 scrollbar-hide">
                <Command.Empty className="text-center text-white/30 py-8 text-sm">
                  No results found
                </Command.Empty>

                {commands.map((group) => (
                  <Command.Group
                    key={group.group}
                    heading={group.group}
                    className="[&_[cmdk-group-heading]]:text-white/30 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.1em] [&_[cmdk-group-heading]]:font-semibold"
                  >
                    {group.items.map((item) => (
                      <Command.Item
                        key={item.label}
                        onSelect={() => {
                          item.action();
                          setOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-white/70 hover:text-white hover:bg-white/5 aria-selected:bg-brand-500/20 aria-selected:text-white transition-all duration-200 outline-none"
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="flex-1 text-sm font-medium">
                          {item.label}
                        </span>
                        {item.shortcut && (
                          <kbd className="text-[10px] bg-white/10 px-2 py-0.5 rounded-md text-white/40 font-mono">
                            {item.shortcut}
                          </kbd>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>

              {/* Footer */}
              <div className="border-t border-white/5 px-4 py-3 flex items-center gap-6 text-[10px] text-white/20 uppercase tracking-widest font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="bg-white/5 px-1.5 py-0.5 rounded">↑↓</span>
                  <span>navigate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-white/5 px-1.5 py-0.5 rounded">↵</span>
                  <span>select</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-white/5 px-1.5 py-0.5 rounded">ESC</span>
                  <span>close</span>
                </div>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
