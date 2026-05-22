"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { requireWorkspaceId } from "@/lib/workspace";
import { listContent } from "@/services/content";
import { useQuery } from "@tanstack/react-query";
import type { Content } from "@/types";

export default function NewDashboardPage() {
  const workspaceId = requireWorkspaceId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: content } = useQuery<Content[]>({
    queryKey: ["content", "recent", workspaceId],
    queryFn: () => listContent(workspaceId).then((res) => res.slice(0, 5)),
    enabled: !!workspaceId && mounted,
  });

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <span className="material-symbols-outlined text-4xl animate-spin" style={{ color: "var(--text-primary)" }}>progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Good morning ✦
        </h1>
        <p className="text-base mt-2" style={{ color: "var(--text-secondary)" }}>
          Here's what's happening with your content pipeline today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl p-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-[28px]" style={{ color: "#6366f1" }}>post_add</span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>+12%</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{content?.length || 0}</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Total Posts</p>
          </motion.div>

          {/* Scheduled */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-[28px]" style={{ color: "#8b5cf6" }}>calendar_month</span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Active</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>0</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Scheduled</p>
          </motion.div>

          {/* Engagement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-[28px]" style={{ color: "#10b981" }}>trending_up</span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>+8%</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>0</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Engagement</p>
          </motion.div>

          {/* AI Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-xl p-lg ai-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-[28px]" style={{ color: "#6366f1" }}>auto_awesome</span>
              <span className="text-sm" style={{ color: "#10b981" }}>AI</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>95</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Quality Score</p>
          </motion.div>
      </div>

      {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Recent Content */}
          <div className="lg:col-span-2 glass-card rounded-xl p-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Recent Content</h2>
              <Link href="/content" className="text-sm hover:opacity-80 transition-colors" style={{ color: "#6366f1" }}>
                View All
              </Link>
            </div>
            <div className="space-y-sm">
              {content && content.length > 0 ? (
                content.map((item: any, index: number) => (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-md p-md rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant">article</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-base truncate" style={{ color: "var(--text-primary)" }}>{item.title || "Untitled"}</p>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.platform || "Unknown"}</p>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      item.status === 'published' ? 'bg-green-500/20 text-green-400' :
                      item.status === 'scheduled' ? 'bg-indigo-500/20 text-indigo-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {item.status || "draft"}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-[48px]" style={{ color: "var(--text-secondary)" }}>inbox</span>
                  <p className="text-base mt-4" style={{ color: "var(--text-secondary)" }}>No content yet</p>
                  <Link href="/content/generate" className="text-sm mt-2 inline-block" style={{ color: "#6366f1" }}>
                    Create your first post →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* AI Insights */}
          <div className="glass-card rounded-xl p-lg">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined" style={{ color: "#6366f1" }}>auto_awesome</span>
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>AI Insights</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-bold uppercase tracking-wider" style={{ color: "#6366f1" }}>Smart Suggestion</p>
                <p className="text-base" style={{ color: "var(--text-primary)" }}>Your audience is most active on Tuesday at 2 PM. Consider scheduling your next post then.</p>
                <button className="bg-indigo-500/10 border rounded-lg px-4 py-2 text-sm hover:bg-indigo-500/20 transition-all" style={{ color: "#6366f1", borderColor: "rgba(99, 102, 241, 0.3)" }}>
                  Optimize Schedule
                </button>
              </div>
              <div className="h-[1px]" style={{ background: "var(--border-color)" }}></div>
              <div className="space-y-2">
                <p className="text-sm font-bold uppercase tracking-wider" style={{ color: "#10b981" }}>Trending Topic</p>
                <p className="text-base" style={{ color: "var(--text-primary)" }}>"Sustainable Tech" is gaining traction in your niche. AI has drafted 2 new thread ideas for you.</p>
                <div className="flex gap-2">
                  <button className="border rounded-lg px-4 py-2 text-sm hover:bg-white/10 transition-all" style={{ color: "var(--text-primary)", background: "var(--bg-hover)", borderColor: "var(--border-color)" }}>
                    View Drafts
                  </button>
                </div>
              </div>
              <div className="h-[1px]" style={{ background: "var(--border-color)" }}></div>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 bg-gradient-to-br from-indigo-500 to-purple-500" style={{ borderColor: "var(--bg-secondary)" }}></div>
                  <div className="w-8 h-8 rounded-full border-2 bg-gradient-to-br from-purple-500 to-emerald-500" style={{ borderColor: "var(--bg-secondary)" }}></div>
                  <div className="w-8 h-8 rounded-full border-2 bg-gradient-to-br from-emerald-500 to-indigo-500" style={{ borderColor: "var(--bg-secondary)" }}></div>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Top engaging users this week</p>
              </div>
            </div>
          </div>
        </div>

      {/* Bottom Quick Actions Bar (Desktop Floating) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50 hidden md:block">
        <div className="backdrop-blur-2xl rounded-full py-3 px-6 shadow-2xl border flex items-center justify-between" style={{ background: "var(--bg-hover)/90", borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-4">
            <Link href="/content/generate" className="flex flex-col items-center gap-1 p-2 transition-all active:scale-95" style={{ color: "#6366f1" }}>
              <span className="material-symbols-outlined text-[24px]">post_add</span>
              <span className="text-[10px] font-bold">DRAFT</span>
            </Link>
            <Link href="/analytics" className="flex flex-col items-center gap-1 p-2 hover:opacity-80 transition-all" style={{ color: "var(--text-secondary)" }}>
              <span className="material-symbols-outlined text-[24px]">analytics</span>
              <span className="text-[10px] font-bold">REPORT</span>
            </Link>
            <button className="flex flex-col items-center gap-1 p-2 hover:opacity-80 transition-all" style={{ color: "var(--text-secondary)" }}>
              <span className="material-symbols-outlined text-[24px]">diversity_3</span>
              <span className="text-[10px] font-bold">AUDIENCE</span>
            </button>
          </div>
          <div className="h-8 w-[1px]" style={{ background: "var(--border-color)" }}></div>
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:block" style={{ color: "var(--text-secondary)" }}>
              AI Agent: <span style={{ color: "#6366f1" }}>Online</span>
            </span>
            <button className="hover:opacity-90 rounded-full p-2 flex items-center justify-center transition-colors" style={{ background: "#6366f1", color: "white" }}>
              <span className="material-symbols-outlined">auto_awesome_motion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation (Bottom) */}
      <nav className="fixed bottom-0 left-0 w-full border-t px-6 py-3 flex justify-between items-center md:hidden z-[60]" style={{ background: "var(--bg-primary)", borderColor: "var(--border-color)" }}>
        <Link href="/dashboard" className="flex flex-col items-center" style={{ color: "#6366f1" }}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold">HOME</span>
        </Link>
        <Link href="/scheduling" className="flex flex-col items-center" style={{ color: "var(--text-secondary)" }}>
          <span className="material-symbols-outlined">calendar_month</span>
          <span className="text-[10px] font-bold">PLAN</span>
        </Link>
        <Link href="/content/generate" className="-mt-8 bg-gradient-to-r from-primary to-secondary p-4 rounded-full shadow-lg">
          <span className="material-symbols-outlined" style={{ color: "white" }}>add</span>
        </Link>
        <Link href="/memory" className="flex flex-col items-center" style={{ color: "var(--text-secondary)" }}>
          <span className="material-symbols-outlined">memory</span>
          <span className="text-[10px] font-bold">AI</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center" style={{ color: "var(--text-secondary)" }}>
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px] font-bold">SET</span>
        </Link>
      </nav>
    </div>
  );
}
