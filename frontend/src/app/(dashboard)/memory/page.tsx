"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function NewAIMemoryPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const memories = [
    {
      id: 1,
      type: "preference",
      icon: "favorite",
      title: "Content Tone Preference",
      description: "User prefers professional tone for LinkedIn posts",
      confidence: 95,
      created: "2 days ago",
    },
    {
      id: 2,
      type: "insight",
      icon: "lightbulb",
      title: "Best Posting Time",
      description: "Audience most active on Tuesdays at 2 PM",
      confidence: 88,
      created: "5 days ago",
    },
    {
      id: 3,
      type: "pattern",
      icon: "trending_up",
      title: "Content Performance",
      description: "Posts with hashtags get 3x more engagement",
      confidence: 92,
      created: "1 week ago",
    },
  ];

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <span className="material-symbols-outlined text-4xl animate-spin" style={{ color: "#6366f1" }}>progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-[32px]" style={{ color: "#6366f1" }}>memory</span>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>AI Memory</h1>
          </div>
          <p style={{ color: "var(--text-secondary)" }}>
            Insights and patterns learned from your content strategy.
          </p>
        </div>
        <button className="rounded-lg px-4 py-2 font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2" style={{ background: "#6366f1", color: "white" }}>
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Refresh Memory
        </button>
      </div>

      {/* Memory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {memories.map((memory, index) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-xl p-lg"
          >
            <div className="flex items-start justify-between mb-md">
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    {memory.icon}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-title-md font-bold text-on-surface">{memory.title}</h3>
                  <span className="font-label-md text-label-md text-on-surface-variant capitalize">
                    {memory.type}
                  </span>
                </div>
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-md">
              {memory.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-xs">
                <span className="font-label-md text-label-md text-on-surface-variant">Confidence:</span>
                <span className="font-label-md text-label-md text-primary font-bold">{memory.confidence}%</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant text-xs">{memory.created}</span>
            </div>
            <div className="mt-sm bg-surface-container-high rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${memory.confidence}%` }}
              ></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Learning Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-xl p-lg mt-lg"
      >
        <div className="flex items-center gap-sm mb-lg">
          <span className="material-symbols-outlined text-tertiary">auto_awesome</span>
          <h2 className="font-display text-title-lg font-bold text-on-surface">AI Learning Status</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-xs">Total Memories</p>
            <p className="font-display text-display-md font-bold text-on-surface">47</p>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-xs">Accuracy Rate</p>
            <p className="font-display text-display-md font-bold text-primary">91%</p>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-xs">Last Updated</p>
            <p className="font-display text-display-md font-bold text-on-surface">2 hours ago</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
