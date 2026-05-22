"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Edit3, MessageCircle } from "lucide-react";
import { requireWorkspaceId } from "@/lib/workspace";
import { safeArray } from "@/lib/utils";
import toast from "react-hot-toast";

interface Approval {
  id: string;
  content_id: string;
  reviewer_id: string;
  action: "approve" | "reject" | "request_changes";
  comment: string | null;
  created_at: string;
}

interface ContentItem {
  id: string;
  title: string;
  body: string;
  platform: string;
  status: string;
  author_email: string | null;
  created_at: string;
}

export default function ApprovalsPage() {
  const workspaceId = requireWorkspaceId();
  const [mounted, setMounted] = useState(false);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [pendingContent, setPendingContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const [approvalsRes, contentRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/approvals?workspace_id=${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/content?workspace_id=${workspaceId}&status=pending_approval`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const approvalsData = await approvalsRes.json();
      const contentData = await contentRes.json();

      console.log('Approvals loaded:', approvalsData);
      console.log('Pending content loaded:', contentData);

      // Ensure data is always an array
      setApprovals(safeArray<Approval>(approvalsData));
      setPendingContent(safeArray<ContentItem>(contentData));
    } catch (error) {
      console.error("Failed to load approvals:", error);
      // Reset to empty arrays on error
      setApprovals([]);
      setPendingContent([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (contentId: string, action: string) => {
    if (!contentId) {
      toast.error("Please select content to approve");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/approvals?content_id=${contentId}&action=${action}&comment=${encodeURIComponent(comment)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        if (data.auto_scheduled) {
          toast.success(`Content approved & auto-scheduled for ${new Date(data.scheduled_at).toLocaleString()}`);
        } else {
          toast.success(`Content ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "changes requested"}`);
        }
        setComment("");
        setSelectedContent(null);
        loadData();
      } else {
        toast.error(data.detail || "Failed to submit approval");
      }
    } catch (error) {
      toast.error("Failed to submit approval");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <span className="material-symbols-outlined text-4xl animate-spin" style={{ color: "#6366f1" }}>progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Content Approvals <MessageCircle className="inline-block ml-2 h-8 w-8" />
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Review and approve content before publishing
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border p-6"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Pending Review</p>
          <p className="text-4xl font-bold" style={{ color: "#f59e0b" }}>{pendingContent.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border p-6"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Approved Today</p>
          <p className="text-4xl font-bold" style={{ color: "#10b981" }}>
            {approvals.filter(a => a.action === "approve" && new Date(a.created_at).toDateString() === new Date().toDateString()).length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border p-6"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Revisions Requested</p>
          <p className="text-4xl font-bold" style={{ color: "#ef4444" }}>
            {approvals.filter(a => a.action === "request_changes").length}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Content */}
        <div className="rounded-xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Pending Approval
          </h2>

          {pendingContent.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-20" style={{ color: "var(--text-secondary)" }} />
              <p style={{ color: "var(--text-secondary)" }}>All caught up! No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingContent.map((content) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-lg border p-4 transition-all ${
                    selectedContent === content.id ? "border-indigo-500" : "hover:border-gray-400"
                  }`}
                  style={{
                    background: selectedContent === content.id ? "var(--bg-hover)" : "var(--bg-primary)",
                    borderColor: selectedContent === content.id ? "#6366f1" : "var(--border-color)"
                  }}
                  onClick={() => setSelectedContent(content.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                        {content.title || "Untitled"}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 rounded" style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
                          {content.platform}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {new Date(content.created_at).toLocaleDateString()}
                        </span>
                        {content.author_email && (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            by {content.author_email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Preview */}
                  <div className="mb-3 p-3 rounded text-sm" style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}>
                    {content.body}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApproval(content.id, "approve");
                      }}
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 text-sm"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApproval(content.id, "reject");
                      }}
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 text-sm"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContent(content.id);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium bg-amber-600 text-white hover:bg-amber-700 text-sm"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Approval Actions */}
        <div className="rounded-xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Review & Action
          </h2>

          {!selectedContent ? (
            <div className="text-center py-12">
              <Edit3 className="h-16 w-16 mx-auto mb-4 opacity-20" style={{ color: "var(--text-secondary)" }} />
              <p style={{ color: "var(--text-secondary)" }}>Select content to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ background: "var(--bg-hover)" }}>
                <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Selected Content</p>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {pendingContent.find(c => c.id === selectedContent)?.title || "Untitled"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Review Comment (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add your feedback or approval notes..."
                  className="w-full h-24 rounded-lg border p-3"
                  style={{ background: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleApproval(selectedContent, "approve")}
                  disabled={submitting}
                  className="flex flex-col items-center gap-2 py-4 px-3 rounded-lg font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">Approve</span>
                </button>

                <button
                  onClick={() => handleApproval(selectedContent, "reject")}
                  disabled={submitting}
                  className="flex flex-col items-center gap-2 py-4 px-3 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5" />
                  <span className="text-sm">Reject</span>
                </button>

                <button
                  onClick={() => handleApproval(selectedContent, "request_changes")}
                  disabled={submitting}
                  className="flex flex-col items-center gap-2 py-4 px-3 rounded-lg font-medium bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  <Edit3 className="h-5 w-5" />
                  <span className="text-sm">Request Changes</span>
                </button>
              </div>

              <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                Your decision will update the content status immediately
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 rounded-xl border p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Recent Activity
        </h2>
        {approvals.length === 0 ? (
          <p className="text-center py-8" style={{ color: "var(--text-secondary)" }}>No approval activity yet</p>
        ) : (
          <div className="space-y-3">
            {approvals.slice(0, 5).map((approval) => (
              <div
                key={approval.id}
                className="flex items-start justify-between p-4 rounded-lg border"
                style={{ background: "var(--bg-hover)", borderColor: "var(--border-color)" }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      approval.action === "approve" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" :
                      approval.action === "reject" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                      "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                    }`}>
                      {approval.action === "approve" ? "✓ Approved" :
                       approval.action === "reject" ? "✗ Rejected" :
                       "↺ Changes Requested"}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(approval.created_at).toLocaleString()}
                    </span>
                  </div>
                  {approval.comment && (
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{approval.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
