/**
 * Workspace management utility.
 * Handles workspace selection and persistence in localStorage.
 */

import type { Workspace } from "@/types";

const WORKSPACE_STORAGE_KEY = "current_workspace";

export function getCurrentWorkspace(): Workspace | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Workspace;
  } catch {
    return null;
  }
}

export function setCurrentWorkspace(workspace: Workspace): void {
  localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
}

export function getWorkspaceId(): string | null {
  const workspace = getCurrentWorkspace();
  return workspace?.id || null;
}

export function requireWorkspaceId(): string {
  const id = getWorkspaceId();
  if (!id) {
    // Fallback to demo workspace for development
    return "00000000-0000-0000-0000-000000000000";
  }
  return id;
}

export function clearWorkspace(): void {
  localStorage.removeItem(WORKSPACE_STORAGE_KEY);
}
