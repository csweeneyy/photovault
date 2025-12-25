"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAlbums } from "@/hooks/useAlbums";
import CreateAlbumModal from "@/components/modals/CreateAlbumModal";

interface AlbumPillsProps {
    activeAlbum: string;
    onAlbumChange: (id: string) => void;
}

export default function AlbumPills({ activeAlbum, onAlbumChange }: AlbumPillsProps) {
    const { albums, loading, refreshAlbums } = useAlbums();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="w-full overflow-x-auto py-4 scrollbar-hide">
                <div className="flex w-max items-center gap-2 px-4 md:px-8">
                    <button
                        onClick={() => onAlbumChange("all")}
                        className={cn(
                            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                            activeAlbum === "all"
                                ? "bg-inner-accent text-white shadow-sm"
                                : "border border-inner-border text-inner-text-muted hover:bg-inner-bg"
                        )}
                    >
                        All Photos
                    </button>

                    {loading && (
                        <div className="h-8 w-24 animate-pulse rounded-full bg-inner-bg" />
                    )}

                    {albums.map((album) => (
                        <button
                            key={album.id}
                            onClick={() => onAlbumChange(album.id)}
                            className={cn(
                                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                                activeAlbum === album.id
                                    ? "bg-inner-accent text-white shadow-sm"
                                    : "border border-inner-border text-inner-text-muted hover:bg-inner-bg"
                            )}
                        >
                            {album.name}
                        </button>
                    ))}

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-1.5 rounded-full border border-dashed border-inner-text-muted/30 px-4 py-1.5 text-sm font-medium text-inner-text-muted hover:border-inner-accent hover:text-inner-accent transition-colors whitespace-nowrap"
                    >
                        <Plus size={14} />
                        <span>New Album</span>
                    </button>
                </div>
            </div>

            <CreateAlbumModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAlbumCreated={refreshAlbums}
            />
        </>
    );
}
