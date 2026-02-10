"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Comment = Database["public"]["Tables"]["comments"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type CommentWithAuthor = Comment & {
  profiles: Pick<Profile, "display_name"> | null;
};

const maxLength = 1000;

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export default function CommentsSection({ speciesId, userId }: { speciesId: number; userId: string }) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const loadComments = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles!comments_author_fkey(display_name)")
      .eq("species_id", speciesId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load comments", description: error.message, variant: "destructive" });
      return;
    }
    setComments(data ?? []);
  }, [speciesId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = content.trim();
    if (trimmed.length === 0 || trimmed.length > maxLength) return;

    setIsSubmitting(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.from("comments").insert([
        {
          species_id: speciesId,
          author: userId,
          content: trimmed,
        },
      ]);

      if (error) {
        return toast({ title: "Failed to post comment", description: error.message, variant: "destructive" });
      }

      setContent("");
      await loadComments();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    setDeletingId(commentId);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from("comments").delete().eq("id", commentId);

    if (error) {
      setDeletingId(null);
      return toast({ title: "Failed to delete comment", description: error.message, variant: "destructive" });
    }

    setDeletingId(null);
    await loadComments();
  };

  const trimmedLength = content.trim().length;

  return (
    <>
      <Separator className="my-4" />
      <div className="min-w-0">
        <Button
          variant="ghost"
          aria-expanded={isOpen}
          className="flex w-full items-center justify-start gap-2 px-1 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronRight
            className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
          />
          <span>Comments ({comments.length})</span>
        </Button>

        <div
          className="grid transition-[grid-template-rows] duration-200 ease-out"
          style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="pt-3">
              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={maxLength}
                  rows={2}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {trimmedLength}/{maxLength}
                  </span>
                  <Button type="submit" size="sm" disabled={isSubmitting || trimmedLength === 0}>
                    {isSubmitting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </form>

              <div className="mt-4">
                {comments.length === 0 ? (
                  <p className="text-sm italic text-muted-foreground">No comments yet.</p>
                ) : (
                  <div className="space-y-2">
                    {comments.map((comment) => (
                      <div key={comment.id} className="rounded-md border px-3 py-2 sm:px-4 sm:py-3">
                        <div className="flex items-start justify-between gap-2 sm:items-center">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="text-sm font-medium">{comment.profiles?.display_name ?? "Unknown"}</span>
                            <span className="text-xs text-muted-foreground">{formatTimestamp(comment.created_at)}</span>
                          </div>
                          {comment.author === userId && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                                >
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={deletingId === comment.id}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction asChild>
                                    <Button
                                      variant="destructive"
                                      onClick={() => void handleDelete(comment.id)}
                                      disabled={deletingId === comment.id}
                                    >
                                      {deletingId === comment.id ? "Deleting..." : "Delete"}
                                    </Button>
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                        <p className="mt-1 break-words text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
