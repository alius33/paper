"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RestoreDialogProps {
  filePath: string;
  hash: string;
  commitMessage: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function RestoreDialog({
  filePath,
  hash,
  commitMessage,
  onConfirm,
  onCancel,
  isOpen,
}: RestoreDialogProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const shortHash = hash.substring(0, 7);

  if (!isOpen) return null;

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const res = await fetch("/api/git/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: filePath, hash }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to restore file");
      }

      toast.success(
        `Restored ${filePath} to version ${shortHash}`
      );
      onConfirm();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to restore file"
      );
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={isRestoring ? undefined : onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="p-4 space-y-4">
          {/* Warning icon and title */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Restore File
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                This will restore{" "}
                <span className="font-medium text-foreground">{filePath}</span>{" "}
                to the version from commit{" "}
                <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                  {shortHash}
                </span>
                :{" "}
                <span className="italic">
                  &ldquo;{commitMessage}&rdquo;
                </span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                A new commit will be created with the restored content.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={isRestoring}
              className="px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground hover:bg-secondary/60 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRestore}
              disabled={isRestoring}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              {isRestoring && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              Restore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
