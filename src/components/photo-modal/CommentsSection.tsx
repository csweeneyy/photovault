"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
    id: string;
    user_name: string;
    content: string;
    created_at: string;
}

interface CommentsSectionProps {
    photoId: string;
    initialComments?: Comment[];
}

export default function CommentsSection({ photoId, initialComments = [] }: CommentsSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState("");
    const { displayName } = useAuth();
    const supabase = createClient();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch latest comments if not provided or to refresh
        const fetchComments = async () => {
            const { data } = await supabase
                .from("comments")
                .select("*")
                .eq("photo_id", photoId)
                .order("created_at", { ascending: true });

            if (data) setComments(data);
        };
        fetchComments();
    }, [photoId, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !displayName) return;

        const tempId = Math.random().toString();
        const commentObj = {
            id: tempId,
            user_name: displayName,
            content: newComment,
            created_at: new Date().toISOString(),
        };

        // Optimistic add
        setComments((prev) => [...prev, commentObj]);
        setNewComment("");

        // Scroll to bottom
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        // Sync to DB
        const { error } = await supabase.from("comments").insert({
            photo_id: photoId,
            user_name: displayName,
            content: commentObj.content
        });

        if (error) {
            console.error("Failed to post comment", error);
            // Rollback? For now just log
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-[200px] max-h-[400px]">
                {comments.length === 0 && (
                    <p className="text-inner-text-muted text-sm text-center py-8">No comments yet. Be the first!</p>
                )}
                {comments.map((comment) => (
                    <div key={comment.id} className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-sm text-inner-text">{comment.user_name}</span>
                            <span className="text-xs text-inner-text-muted">
                                {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-sm text-inner-text bg-inner-bg p-2 rounded-lg rounded-tl-none">{comment.content}</p>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex gap-2 relative">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 rounded-full border border-inner-border bg-white px-4 py-2 text-sm focus:border-inner-accent focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="rounded-full bg-inner-text p-2 text-white hover:bg-black/80 disabled:opacity-50"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}
