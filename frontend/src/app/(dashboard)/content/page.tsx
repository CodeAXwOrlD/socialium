"use client";

import { useEffect, useState } from "react";
import { Plus, Sparkles, Trash2, Eye, Send, Zap } from "lucide-react";
import { listContent, deleteContent, submitForApproval } from "@/services/content";
import { requireWorkspaceId } from "@/lib/workspace";
import type { Content } from "@/types";
import { formatDate, capitalize } from "@/lib/utils";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function ContentPage() {
  const workspaceId = requireWorkspaceId();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [publishing, setPublishing] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await listContent(workspaceId, statusFilter || undefined);
      setContents(data);
    } catch {
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this content?")) return;
    try {
      await deleteContent(id);
      setContents((prev) => prev.filter((c) => c.id !== id));
      toast.success("Content deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSubmitForApproval = async (id: string) => {
    try {
      const result = await submitForApproval(id);
      
      if (result.whatsapp_sent) {
        toast.success("Submitted! WhatsApp notification sent");
      } else {
        toast.success("Submitted for approval" + (result.reason ? ` - ${result.reason}` : ""));
      }
      
      // Update the content in the list
      setContents((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: "pending_approval" as const } : c
        )
      );
    } catch (error: any) {
      const errorMsg = error?.response?.data?.detail || "Failed to submit for approval";
      toast.error(errorMsg);
    }
  };

  const handlePublishNow = async (id: string) => {
    if (!confirm("Publish this post to LinkedIn right now?")) return;
    
    setPublishing(id);
    try {
      const response = await api.post(`/content/${id}/publish-now`);
      
      if (response.data.success) {
        toast.success("✅ Published to LinkedIn!");
        
        // Open the LinkedIn post in new tab
        if (response.data.platform_url) {
          window.open(response.data.platform_url, "_blank");
        }
        
        // Update the content in the list
        setContents((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, status: "published" as const } : c
          )
        );
      } else {
        toast.error(`Failed to publish: ${response.data.error}`);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.detail || "Failed to publish";
      toast.error(errorMsg);
    } finally {
      setPublishing(null);
    }
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    pending_approval: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    approved: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    scheduled: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    published: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    failed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Content</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Manage and create your social media posts</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/content/generate"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            AI Generate
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["", "draft", "pending_approval", "scheduled", "published"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === s
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/20"
            }`}
          >
            {s === "" ? "All" : capitalize(s.replace("_", " "))}
          </button>
        ))}
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      ) : contents.length === 0 ? (
        <div className="rounded-xl border py-16 text-center" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <p style={{ color: "var(--text-muted)" }}>No content found.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b" style={{ borderColor: "var(--border-color)", background: "var(--bg-hover)" }}>
                <tr>
                  <th className="px-4 lg:px-5 py-3 font-medium" style={{ color: "var(--text-secondary)" }}>Title</th>
                  <th className="px-4 lg:px-5 py-3 font-medium" style={{ color: "var(--text-secondary)" }}>Platform</th>
                  <th className="px-4 lg:px-5 py-3 font-medium" style={{ color: "var(--text-secondary)" }}>Status</th>
                  <th className="hidden md:table-cell px-4 lg:px-5 py-3 font-medium" style={{ color: "var(--text-secondary)" }}>Created</th>
                  <th className="px-4 lg:px-5 py-3 font-medium" style={{ color: "var(--text-secondary)" }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {contents.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5">
                    <td className="px-4 lg:px-5 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                      {item.title || "Untitled"}
                    </td>
                    <td className="px-4 lg:px-5 py-3" style={{ color: "var(--text-secondary)" }}>
                      {item.platform ? capitalize(item.platform) : "—"}
                    </td>
                    <td className="px-4 lg:px-5 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[item.status] || ""}`}>
                        {capitalize(item.status.replace("_", " "))}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-4 lg:px-5 py-3" style={{ color: "var(--text-muted)" }}>{formatDate(item.created_at)}</td>
                    <td className="px-4 lg:px-5 py-3">
                      <div className="flex gap-2">
                        <a
                          href={`/content/${item.id}`}
                          className="rounded p-1 hover:bg-white/10 transition-colors"
                          style={{ color: "var(--text-secondary)" }}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        {(item.status === "approved" || item.status === "scheduled") && (
                          <button
                            onClick={() => handlePublishNow(item.id)}
                            disabled={publishing === item.id}
                            className="rounded p-1 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors disabled:opacity-50"
                            style={{ color: "var(--text-secondary)" }}
                            title="Publish now to LinkedIn"
                          >
                            {publishing === item.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <Zap className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        {item.status === "draft" && (
                          <button
                            onClick={() => handleSubmitForApproval(item.id)}
                            className="rounded p-1 hover:bg-brand-500/10 hover:text-brand-500 transition-colors"
                            style={{ color: "var(--text-secondary)" }}
                            title="Submit for approval"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded p-1 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                          style={{ color: "var(--text-secondary)" }}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
