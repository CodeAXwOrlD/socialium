"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Calendar, Clock, Zap, CheckCircle, AlertCircle, BarChart3, RefreshCw } from "lucide-react";
import { listContent } from "@/services/content";
import { autoScheduleContent, getOptimalTime, bulkAutoSchedule } from "@/services/content";
import { requireWorkspaceId } from "@/lib/workspace";
import type { Content } from "@/types";
import { formatDate, capitalize } from "@/lib/utils";
import toast from "react-hot-toast";

interface OptimalTimeResult {
  best_slot: {
    day_of_week: number;
    hour: number;
    avg_engagement: number;
    score: number;
    scheduled_at: string;
    data_source: string;
  };
  alternative_slots: Array<{
    day_of_week: number;
    hour: number;
    avg_engagement: number;
    score: number;
    scheduled_at: string;
    data_source: string;
  }>;
  confidence: number;
  confidence_label: string;
  reasoning: string;
}

interface ViralScoreResult {
  total_score: number;
  breakdown?: {
    hook?: number;
    emotion?: number;
    trend?: number;
    historical?: number;
    uniqueness?: number;
    algorithm?: number;
  };
  viral_probability: string;
  recommendation: string;
  hook_strength?: number;
  emotional_triggers?: number;
  trend_alignment?: number;
  historical_performance?: number;
  content_uniqueness?: number;
  platform_algorithm_fit?: number;
}

interface AutoScheduleResult {
  content_id: string;
  viral_score: ViralScoreResult;
  optimal_times: OptimalTimeResult;
  decision: {
    should_auto_schedule: boolean;
    reason: string;
    action: string;
    scheduled_time?: string;
    suggested_times?: Array<{
      day_of_week: number;
      hour: number;
      scheduled_at: string;
    }>;
    improvement_suggestion?: string;
  };
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SchedulingPage() {
  const router = useRouter();
  const workspaceId = requireWorkspaceId();
  const [drafts, setDrafts] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState<string | null>(null);
  const [bulkScheduling, setBulkScheduling] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<Content | null>(null);
  const [optimalTime, setOptimalTime] = useState<OptimalTimeResult | null>(null);
  const [viralScore, setViralScore] = useState<ViralScoreResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const data = await listContent(workspaceId, "");
      const approvedAndDrafts = data.filter(
        (c) => c.status === "draft" || c.status === "approved"
      );
      setDrafts(approvedAndDrafts);
    } catch {
      toast.error("Failed to load drafts");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeContent = async (content: Content) => {
    setSelectedDraft(content);
    setAnalyzing(true);
    setOptimalTime(null);
    setViralScore(null);

    try {
      const result = await getOptimalTime(content.id);
      setViralScore(result.viral_score);
      setOptimalTime(result.optimal_time);
      toast.success("AI analysis complete!");
    } catch (error: any) {
      const errorMsg = error?.response?.data?.detail || "Failed to analyze content";
      toast.error(errorMsg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAutoSchedule = async (content: Content) => {
    setScheduling(content.id);
    try {
      const result: AutoScheduleResult = await autoScheduleContent(content.id);
      
      // Show the analysis in the right panel
      setSelectedDraft(content);
      setViralScore(result.viral_score);
      setOptimalTime(result.optimal_times);
      
      if (result.decision.action === "auto_scheduled") {
        toast.success(`✅ Auto-scheduled for ${formatDate(result.decision.scheduled_time!)}`);
        // Remove from drafts list after a delay to show results
        setTimeout(() => {
          setDrafts((prev) => prev.filter((d) => d.id !== content.id));
          setSelectedDraft(null);
          setViralScore(null);
          setOptimalTime(null);
        }, 3000);
      } else if (result.decision.action === "suggest_times") {
        toast.success("AI suggests these optimal times - review below");
      } else if (result.decision.action === "improve_content") {
        toast.error(`Content needs improvement: ${result.decision.improvement_suggestion}`);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.detail || "Failed to auto-schedule";
      toast.error(errorMsg);
    } finally {
      setScheduling(null);
    }
  };

  const handleBulkAutoSchedule = async () => {
    if (drafts.length === 0) {
      toast.error("No drafts to schedule");
      return;
    }

    setBulkScheduling(true);
    try {
      const contentIds = drafts.map((d) => d.id);
      const result = await bulkAutoSchedule(workspaceId, contentIds);
      
      toast.success(
        `✅ Scheduled ${result.auto_scheduled} posts, ${result.needs_confirmation} need confirmation, ${result.needs_improvement} need improvement`
      );
      
      // Reload drafts
      await loadDrafts();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.detail || "Failed to bulk schedule";
      toast.error(errorMsg);
    } finally {
      setBulkScheduling(false);
    }
  };

  const formatTimeSlot = (dayOfWeek: number, hour: number) => {
    const day = DAY_NAMES[dayOfWeek];
    const time = new Date();
    time.setHours(hour, 0, 0, 0);
    const timeStr = time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${day} at ${timeStr}`;
  };

  const getViralScoreColor = (score: number) => {
    if (score >= 65) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-700";
    if (confidence >= 0.5) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Scheduling</h1>
          <p className="text-sm text-gray-500 mt-1">
            AI analyzes your content, audience analytics, and trending times to find optimal posting schedule
          </p>
        </div>
        <button
          onClick={handleBulkAutoSchedule}
          disabled={bulkScheduling || drafts.length === 0}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {bulkScheduling ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Scheduling All...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              AI Schedule All ({drafts.length})
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Drafts List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ready to Schedule ({drafts.length})
          </h2>
          {drafts.length === 0 ? (
            <div className="rounded-xl border p-8 text-center bg-white dark:bg-gray-800">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No drafts available</p>
              <button
                onClick={() => router.push("/content/generate")}
                className="mt-4 text-sm text-brand-600 hover:text-brand-700"
              >
                Generate Content →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => (
                <motion.div
                  key={draft.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    selectedDraft?.id === draft.id
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-300"
                  }`}
                  onClick={() => handleAnalyzeContent(draft)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {draft.title || "Untitled"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {capitalize(draft.platform || "")} • {formatDate(draft.created_at)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        draft.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {capitalize(draft.status.replace("_", " "))}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAutoSchedule(draft);
                      }}
                      disabled={scheduling === draft.id}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-brand-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
                    >
                      {scheduling === draft.id ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Zap className="h-3 w-3" />
                      )}
                      AI Schedule
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/content/${draft.id}`);
                      }}
                      className="flex-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right: AI Analysis */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedDraft ? (
            <div className="rounded-xl border p-12 text-center bg-white dark:bg-gray-800">
              <Sparkles className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Select a Draft to Analyze
              </h3>
              <p className="text-sm text-gray-500">
                AI will analyze viral potential, audience activity, and optimal posting times
              </p>
            </div>
          ) : analyzing ? (
            <div className="rounded-xl border p-12 text-center bg-white dark:bg-gray-800">
              <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mb-4" />
              <p className="text-gray-500">AI is analyzing your content...</p>
            </div>
          ) : optimalTime && viralScore ? (
            <div className="space-y-4">
              {/* Viral Score */}
              <div className="rounded-xl border p-6 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Viral Potential Score
                  </h3>
                  <span className={`text-2xl font-bold ${getViralScoreColor(viralScore.total_score)}`}>
                    {viralScore.total_score}/100
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
                  <div
                    className={`h-full rounded-full ${
                      viralScore.total_score >= 65
                        ? "bg-green-600"
                        : viralScore.total_score >= 40
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    }`}
                    style={{ width: `${viralScore.total_score}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {viralScore.recommendation}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "Hook", score: viralScore.breakdown?.hook || 0, max: 20 },
                    { label: "Emotion", score: viralScore.breakdown?.emotion || 0, max: 20 },
                    { label: "Trends", score: viralScore.breakdown?.trend || 0, max: 20 },
                    { label: "History", score: viralScore.breakdown?.historical || 0, max: 20 },
                    { label: "Uniqueness", score: viralScore.breakdown?.uniqueness || 0, max: 10 },
                    { label: "Platform Fit", score: viralScore.breakdown?.algorithm || 0, max: 10 },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.score}/{item.max}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimal Times */}
              <div className="rounded-xl border p-6 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Optimal Posting Times
                  </h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getConfidenceColor(optimalTime.confidence)}`}>
                    {Math.round(optimalTime.confidence * 100)}% Confidence
                  </span>
                </div>
                
                {/* Confidence Explanation */}
                <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {optimalTime.confidence < 0.5 
                      ? "📊 Low confidence: Based on industry benchmarks. Publish more content to get personalized recommendations based on YOUR audience data."
                      : optimalTime.confidence < 0.8
                      ? "📈 Medium confidence: Mix of your historical data and industry benchmarks."
                      : "🎯 High confidence: Based on your historical engagement data."}
                  </p>
                </div>

                {/* Best Time */}
                <div className="p-4 rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 mb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-brand-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-brand-900 dark:text-brand-100 mb-1">
                        Best Time to Post
                      </h4>
                      <p className="text-lg font-bold text-brand-700 dark:text-brand-300">
                        {formatTimeSlot(optimalTime.best_slot.day_of_week, optimalTime.best_slot.hour)}
                      </p>
                      <p className="text-xs text-brand-600 dark:text-brand-400 mt-2">
                        {optimalTime.reasoning}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alternative Times */}
                {optimalTime.alternative_slots.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Alternative Times
                    </h4>
                    <div className="space-y-2">
                      {optimalTime.alternative_slots.slice(0, 3).map((slot, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {formatTimeSlot(slot.day_of_week, slot.hour)}
                          </span>
                          <span className="text-xs font-medium text-gray-500">
                            Score: {slot.score.toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Primary: AI Auto-Schedule */}
                <button
                  onClick={() => handleAutoSchedule(selectedDraft)}
                  disabled={scheduling === selectedDraft.id}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
                >
                  {scheduling === selectedDraft.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      AI Auto-Schedule at Best Time
                    </>
                  )}
                </button>
                
                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAnalyzeContent(selectedDraft)}
                    disabled={analyzing}
                    className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Re-analyze
                  </button>
                  <button
                    onClick={() => {
                      toast("Content will be published at the scheduled time. Check the Content page for status.", {
                        icon: "ℹ️",
                        style: {
                          background: "#3b82f6",
                          color: "#fff",
                        },
                      });
                      router.push("/content");
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    View Status
                  </button>
                </div>
              </div>
              
              {/* Publishing Status Info */}
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  How Publishing Works
                </h4>
                <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <li>✓ After scheduling, content status changes to "Scheduled"</li>
                  <li>✓ PublishWorker checks every 1 minute for due posts</li>
                  <li>✓ When scheduled time arrives, post publishes automatically</li>
                  <li>✓ Check Content page to see publishing status</li>
                  <li>✓ You'll see "Published" with link when complete</li>
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
