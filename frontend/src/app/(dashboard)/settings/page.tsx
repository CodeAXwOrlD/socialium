"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function NewSettingsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <main className="md:ml-64 min-h-screen bg-surface-container-lowest p-lg">
      {/* Header */}
      <div className="mb-xl">
        <h1 className="font-display text-headline-lg font-bold text-on-surface">Settings</h1>
        <p className="text-on-surface-variant font-body-md mt-xs">
          Manage your account preferences and application settings.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-lg max-w-4xl">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-lg"
        >
          <h2 className="font-display text-title-lg font-bold text-on-surface mb-lg">Profile Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm mb-2" style={{ color: "var(--text-secondary)" }}>Full Name</label>
              <input
                type="text"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none"
                style={{ background: "var(--bg-hover)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: "var(--text-secondary)" }}>Email</label>
              <input
                type="email"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none"
                style={{ background: "var(--bg-hover)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                placeholder="your@email.com"
              />
            </div>
            <button className="bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-indigo-700 transition-opacity">
              Save Changes
            </button>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-lg"
        >
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Notifications</h2>
          <div className="space-y-6">
            {[
              { label: "Email Notifications", description: "Receive updates via email", enabled: true },
              { label: "WhatsApp Alerts", description: "Get approval requests on WhatsApp", enabled: true },
              { label: "Push Notifications", description: "Browser notifications", enabled: false },
            ].map((setting, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-base" style={{ color: "var(--text-primary)" }}>{setting.label}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{setting.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={setting.enabled} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:bg-gray-700"></div>
                </label>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-lg"
        >
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>AI Configuration</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm mb-2" style={{ color: "var(--text-secondary)" }}>Default Tone</label>
              <select className="w-full border rounded-lg px-4 py-2 focus:outline-none" style={{ background: "var(--bg-hover)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                <option>Professional</option>
                <option>Casual</option>
                <option>Humorous</option>
                <option>Inspirational</option>
              </select>
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant block mb-xs">Creativity Level</label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="50"
                className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-lg border-error/30"
        >
          <h2 className="font-display text-title-lg font-bold text-error mb-lg">Danger Zone</h2>
          <div className="space-y-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body-md text-body-md text-on-surface">Delete Account</p>
                <p className="font-label-md text-label-md text-on-surface-variant text-xs">Permanently delete your account and all data</p>
              </div>
              <button className="bg-error-container text-error rounded-lg px-md py-sm font-label-md text-label-md font-bold hover:opacity-90 transition-opacity">
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
