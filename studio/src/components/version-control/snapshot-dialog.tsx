"use client";

import { useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SnapshotDialogProps {
  onClose: () => void;
  onCreated: () => void;
}

const NAME_PATTERN = /^[a-zA-Z0-9\-_]+$/;

export function SnapshotDialog({ onClose, onCreated }: SnapshotDialogProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const validateName = (value: string): boolean => {
    if (!value.trim()) {
      setNameError("Name is required");
      return false;
    }
    if (!NAME_PATTERN.test(value)) {
      setNameError("Only letters, numbers, hyphens, and underscores allowed");
      return false;
    }
    setNameError(null);
    return true;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) {
      validateName(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateName(name)) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/git/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          message: message.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create snapshot");
      }

      toast.success(`Snapshot "${name}" created`);
      onCreated();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create snapshot"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">
              Create Snapshot
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label
              htmlFor="snapshot-name"
              className="block text-xs font-medium text-foreground mb-1"
            >
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="snapshot-name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., chapter-5-final-draft"
              className="w-full px-3 py-1.5 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              autoFocus
              disabled={isSubmitting}
            />
            {nameError && (
              <p className="mt-1 text-xs text-destructive">{nameError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="snapshot-message"
              className="block text-xs font-medium text-foreground mb-1"
            >
              Description{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <textarea
              id="snapshot-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What state does this snapshot capture?"
              rows={3}
              className="w-full px-3 py-1.5 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground hover:bg-secondary/60 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Camera className="h-3 w-3" />
              )}
              Create Snapshot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
