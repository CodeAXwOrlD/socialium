"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getStoredUser } from "@/lib/auth";

export default function NewSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setMounted(true);
  }, []);

  const navItems = [
    { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { href: "/scheduling", icon: "calendar_month", label: "Scheduled" },
    { href: "/approvals", icon: "rule", label: "Approvals" },
    { href: "/memory", icon: "memory", label: "AI Memory" },
    { href: "/analytics", icon: "insights", label: "Analytics" },
  ];

  const bottomNavItems = [
    { href: "/settings", icon: "settings", label: "Settings" },
    { href: "/support", icon: "help", label: "Support" },
  ];

  if (!mounted) return null;

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col p-md z-50 bg-surface-container-low border-r border-white/5 w-64 hidden md:flex">
      {/* Logo */}
      <div className="flex items-center gap-sm mb-xl">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary text-[24px]">rocket_launch</span>
        </div>
        <div>
          <h1 className="font-display text-title-lg font-bold text-primary">Socialium</h1>
          <p className="font-label-md text-label-md text-on-surface-variant">AI Automation</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-xs">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-md rounded-lg px-md py-sm transition-all duration-200 ${
                isActive
                  ? "bg-primary-container text-on-primary-container translate-x-1"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* New Post Button */}
      <div className="mb-lg">
        <Link href="/content/generate">
          <button className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary py-sm px-md rounded-lg font-label-md text-label-md font-bold flex items-center justify-center gap-xs hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Post
          </button>
        </Link>
      </div>

      {/* Bottom Navigation */}
      <div className="pt-md border-t border-white/5 space-y-xs">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-lg px-md py-sm transition-all duration-200"
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-label-md text-label-md">{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
