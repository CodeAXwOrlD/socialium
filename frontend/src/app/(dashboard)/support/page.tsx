"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function SupportPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="p-6" style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Support</h1>
      <p style={{ color: "var(--text-secondary)" }}>Help and support center - Coming soon</p>
    </div>
  );
}
