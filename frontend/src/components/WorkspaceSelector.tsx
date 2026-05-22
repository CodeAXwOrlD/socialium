"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listWorkspaces, createWorkspace } from "@/services/workspace";
import { setCurrentWorkspace, getWorkspaceId } from "@/lib/workspace";
import { getStoredUser } from "@/lib/auth";
import { Plus, Building2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function WorkspaceSelector({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = getStoredUser();
  const [showSelector, setShowSelector] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: listWorkspaces,
    enabled: !!user && mounted,
  });

  useEffect(() => {
    if (!mounted || !workspaces || workspaces.length === 0) return;

    const currentId = getWorkspaceId();
    if (!currentId) {
      // Auto-select first workspace
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces, mounted]);

  const handleSelect = (workspace: any) => {
    setCurrentWorkspace(workspace);
    setShowSelector(false);
    router.refresh();
  };

  const handleCreate = async () => {
    if (!newWorkspaceName.trim() || creating) return;
    
    console.log('Creating workspace:', newWorkspaceName.trim());
    setCreating(true);
    
    try {
      const workspace = await createWorkspace({ name: newWorkspaceName.trim() });
      console.log('Workspace created successfully:', workspace);
      
      // Invalidate and refetch workspaces list
      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      console.log('Query cache invalidated');
      
      // Set as current workspace
      setCurrentWorkspace(workspace);
      console.log('Workspace set as current:', workspace.id);
      
      // Hide selector and show toast
      setShowSelector(false);
      toast.success(`Workspace "${workspace.name}" created!`);
      
      // Force router refresh
      router.refresh();
      console.log('Router refreshed, should now show dashboard');
      
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || "Failed to create workspace";
      console.error('Failed to create workspace:', err);
      console.error('Error response:', err?.response?.data);
      toast.error(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  // Show loading until mounted to prevent hydration mismatch
  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <Building2 className="h-16 w-16 mx-auto text-brand-500 mb-4" />
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Create Your Workspace</h1>
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
              A workspace is where you manage your social media accounts and content.
            </p>
          </div>

          <div className="rounded-2xl p-6 border" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Workspace Name
            </label>
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="e.g., My Brand, Acme Corp"
              className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-brand-500"
              style={{ background: "var(--bg-hover)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={!newWorkspaceName.trim() || creating}
              className="w-full mt-4 px-4 py-3 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Workspace
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSelector) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <Building2 className="h-16 w-16 mx-auto text-brand-500 mb-4" />
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Select Workspace</h1>
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>Choose a workspace to continue</p>
          </div>

          <div className="space-y-3 mb-6">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => handleSelect(workspace)}
                className="w-full p-4 rounded-xl border hover:border-brand-500/50 transition-all text-left"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
              >
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>{workspace.name}</p>
                {workspace.description && (
                  <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{workspace.description}</p>
                )}
              </button>
            ))}
          </div>

          <div className="rounded-xl border p-4" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
            <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Create new workspace</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="Workspace name"
                className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:border-brand-500 text-sm"
                style={{ background: "var(--bg-hover)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <button
                onClick={handleCreate}
                disabled={!newWorkspaceName.trim() || creating}
                className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-400 disabled:opacity-50 flex items-center gap-1"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
