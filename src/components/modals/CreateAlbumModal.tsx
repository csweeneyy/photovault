"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useAlbums } from "@/hooks/useAlbums";

interface CreateAlbumModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAlbumCreated: () => void;
}

export default function CreateAlbumModal({
    isOpen,
    onClose,
    onAlbumCreated,
}: CreateAlbumModalProps) {
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { createAlbum } = useAlbums(); // We use the hook mainly for the create function, but managing state might be better lifted if we want instant UI update on Pills. 
    // Actually, AlbumPills will have its own useAlbums instance. We can rely on refetch or context. 
    // For MVP: onAlbumCreated callback can trigger refetch in parent.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setSubmitting(true);
        const result = await createAlbum(name);
        setSubmitting(false);

        if (result) {
            setName("");
            onAlbumCreated();
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="New Album"
            className="max-w-sm"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-inner-text">
                        Album Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Summer 2024"
                        className="w-full rounded-lg border border-inner-border bg-inner-bg px-4 py-2 text-inner-text focus:border-inner-accent focus:outline-none"
                        autoFocus
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full px-4 py-2 text-sm font-medium text-inner-text-muted hover:bg-inner-bg"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!name.trim() || submitting}
                        className="rounded-full bg-inner-text px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-black/80 disabled:opacity-50"
                    >
                        {submitting ? "Creating..." : "Create"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
