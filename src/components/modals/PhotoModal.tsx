"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download, MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import ReactionsBar from "@/components/photo-modal/ReactionsBar";
import CommentsSection from "@/components/photo-modal/CommentsSection";
import { Photo } from "@/hooks/usePhotos";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const supabase = createClient();
    const { displayName } = useAuth();

    // Local state for optimistic updates
    // Fallback to caption for name if name is missing (legacy support)
    const initialName = photo.name || photo.caption || "";
    const [name, setName] = useState(initialName);
    const [location, setLocation] = useState(photo.location || "");

    useEffect(() => {
        setName(photo.name || photo.caption || "");
        setLocation(photo.location || "");
        setShowMenu(false);
        setShowDeleteConfirm(false);
    }, [photo.id, photo.name, photo.caption, photo.location]);

    const handleConfirmDelete = async () => {
        await supabase.from("photos").delete().eq("id", photo.id);
        // ...
        onDelete();
        setShowDeleteConfirm(false);
        onClose();
    };

    // ... (rest of component) ...
    const handleUpdate = async (field: "name" | "location", value: string) => {
        const { error } = await supabase.from("photos").update({ [field]: value }).eq("id", photo.id);
        if (error) console.error(error);
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                        onClick={onClose}
                    />

                    <motion.div
                        className="relative flex h-full w-full max-w-7xl flex-col overflow-hidden bg-inner-bg-elevated md:h-[90vh] md:flex-row md:rounded-2xl shadow-2xl"
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* LEFT: Image Viewer */}
                        <div className="relative flex-1 bg-black flex items-center justify-center p-4 group">
                            <div className="relative h-full w-full max-h-full max-w-full flex items-center justify-center">
                                <img
                                    src={photo.url}
                                    alt={photo.caption || "Family photo"}
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>

                            {/* Navigation Arrows */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white/70 hover:bg-black/40 hover:text-white transition-colors"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onNext(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white/70 hover:bg-black/40 hover:text-white transition-colors"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </div>

                        {/* RIGHT: Sidebar */}
                        <div className="flex w-full flex-col bg-white md:w-[400px] border-l border-inner-border">
                            {/* Header */}
                            <div className="flex items-start justify-between border-b border-inner-border p-5 gap-4">
                                <div className="flex flex-col flex-1 min-w-0 space-y-1 group/inputs">
                                    <div className="relative">
                                        <input
                                            className="w-full font-display text-xl text-inner-text bg-transparent border-none focus:ring-0 p-0 placeholder:text-inner-text/50 focus:outline-none transition-colors hover:text-inner-accent focus:text-inner-accent truncate leading-tight"
                                            placeholder="Add a title..."
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            onBlur={() => handleUpdate("name", name)}
                                        />
                                        <Edit2 size={12} className="absolute -right-4 top-1.5 text-inner-text-muted opacity-0 group-hover/inputs:opacity-100 transition-opacity" />
                                    </div>
                                    <input
                                        className="w-full text-sm text-inner-text-muted bg-transparent border-none focus:ring-0 p-0 placeholder:text-inner-text-muted/50 focus:outline-none hover:text-inner-text transition-colors"
                                        placeholder="Add a location..."
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        onBlur={() => handleUpdate("location", location)}
                                    />
                                    <span className="text-[10px] uppercase tracking-wider text-inner-text-muted pt-1 block">
                                        Added by {photo.uploaded_by || "Guest"} • {new Date(photo.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0 -mt-1 -mr-2">
                                    <button
                                        onClick={downloadImage}
                                        className="rounded-full p-2 text-inner-text-muted hover:bg-inner-bg hover:text-inner-text transition-colors"
                                        title="Download"
                                    >
                                        <Download size={18} />
                                    </button>

                                    <div className="relative">
                                        <button
                                            onClick={() => setShowMenu(!showMenu)}
                                            className="rounded-full p-2 text-inner-text-muted hover:bg-inner-bg hover:text-inner-text transition-colors"
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>

                                        {showMenu && (
                                            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-inner-border bg-white shadow-lg z-10 animate-in fade-in zoom-in duration-200">
                                                <button
                                                    onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/5 text-left transition-colors"
                                                >
                                                    <Trash2 size={14} /> Delete Photo
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-2 text-inner-text-muted hover:bg-inner-bg hover:text-inner-text transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                {/* Caption Display - Only show if different from name */}
                                {photo.caption && photo.caption !== name && (
                                    <p className="text-inner-text text-sm leading-relaxed">{photo.caption}</p>
                                )}

                                {/* Reactions */}
                                <section>
                                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-inner-text-muted">Reactions</h4>
                                    <ReactionsBar
                                        photoId={photo.id}
                                        initialReactions={{}}
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

                    {/* Delete Confirmation Overlay */}
                    {showDeleteConfirm && (
                        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 border border-inner-border transform scale-100 animate-in zoom-in-95 duration-200">
                                <h3 className="text-lg font-bold text-inner-text mb-2">Delete Photo?</h3>
                                <p className="text-inner-text-muted text-sm mb-6">
                                    This action cannot be undone. This photo will be removed from your vault.
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-4 py-2 text-sm font-medium text-inner-text-muted hover:bg-inner-bg rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmDelete}
                                        className="px-4 py-2 text-sm font-medium bg-error text-white hover:bg-error/90 rounded-lg shadow-sm transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </AnimatePresence>
    );
}
