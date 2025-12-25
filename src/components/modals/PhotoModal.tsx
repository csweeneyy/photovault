"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download, MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import ReactionsBar from "@/components/photo-modal/ReactionsBar";
import CommentsSection from "@/components/photo-modal/CommentsSection";
import { Photo } from "@/hooks/usePhotos";
import { useAuth } from "@/context/AuthContext";

interface PhotoModalProps {
    photo: Photo;
    isOpen: boolean;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
    onDelete: () => void;
}

export default function PhotoModal({
    photo,
    isOpen,
    onClose,
    onNext,
    onPrev,
    onDelete,
}: PhotoModalProps) {
    const [showMenu, setShowMenu] = useState(false);
    const supabase = createClient();
    const { displayName } = useAuth();

    // Reset menu on photo change
    useEffect(() => {
        setShowMenu(false);
    }, [photo.id]);

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this photo? This cannot be undone.")) {
            await supabase.from("photos").delete().eq("id", photo.id);
            // Also delete from storage if we want to be clean, but ID is needed.
            // Assuming cascade delete works for relations.
            onDelete();
            onClose();
        }
    };

    const downloadImage = async () => {
        try {
            const response = await fetch(photo.storage_path ?
                supabase.storage.from("photos").getPublicUrl(photo.storage_path).data.publicUrl
                : photo.url || "");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `sweeney-vault-${photo.id}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            console.error("Download failed", e);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                        onClick={onClose}
                    />

                    <motion.div
                        className="relative flex h-full w-full max-w-7xl flex-col overflow-hidden bg-inner-bg-elevated md:h-[90vh] md:flex-row md:rounded-2xl"
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* LEFT: Image Viewer */}
                        <div className="relative flex-1 bg-black flex items-center justify-center p-4 group">
                            <div className="relative h-full w-full max-h-full max-w-full">
                                <img
                                    src={photo.url}
                                    alt={photo.caption || "Family photo"}
                                    className="h-full w-full object-contain"
                                />
                            </div>

                            {/* Navigation Arrows */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white/70 hover:bg-black/40 hover:text-white"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onNext(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white/70 hover:bg-black/40 hover:text-white"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </div>

                        {/* RIGHT: Sidebar */}
                        <div className="flex w-full flex-col bg-white md:w-[400px] border-l border-inner-border">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-inner-border p-4">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-inner-text">
                                        {photo.caption || "Untitled"}
                                    </span>
                                    <span className="text-xs text-inner-text-muted">
                                        Uploaded by {photo.uploaded_by || "Guest"} • {new Date(photo.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={downloadImage}
                                        className="rounded-full p-2 text-inner-text-muted hover:bg-inner-bg hover:text-inner-text"
                                        title="Download"
                                    >
                                        <Download size={20} />
                                    </button>

                                    <div className="relative">
                                        <button
                                            onClick={() => setShowMenu(!showMenu)}
                                            className="rounded-full p-2 text-inner-text-muted hover:bg-inner-bg hover:text-inner-text"
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>

                                        {showMenu && (
                                            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-inner-border bg-white shadow-lg z-10">
                                                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-inner-text hover:bg-inner-bg text-left">
                                                    <Edit2 size={14} /> Edit Caption
                                                </button>
                                                <button
                                                    onClick={handleDelete}
                                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-error hover:bg-red-50 text-left"
                                                >
                                                    <Trash2 size={14} /> Delete Photo
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-2 text-inner-text-muted hover:bg-inner-bg hover:text-inner-text"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                {/* Reactions */}
                                <section>
                                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-inner-text-muted">Reactions</h4>
                                    <ReactionsBar
                                        photoId={photo.id}
                                        initialReactions={{}} // Needs to be fetched inside component or passed
                                        userReactions={[]}
                                    />
                                </section>

                                {/* Comments */}
                                <section className="flex-1">
                                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-inner-text-muted">Comments</h4>
                                    <CommentsSection photoId={photo.id} />
                                </section>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
