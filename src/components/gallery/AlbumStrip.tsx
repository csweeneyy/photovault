"use client";

import { motion } from "framer-motion";
import { Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAlbums } from "@/hooks/useAlbums";
import CreateAlbumModal from "@/components/modals/CreateAlbumModal";
import AlbumContextMenu from "./AlbumContextMenu";
import { useDroppable } from "@dnd-kit/core";

interface AlbumStripProps {
    activeAlbum: string;
    onAlbumChange: (id: string) => void;
}

function AlbumCard({ album, activeAlbum, onClick, onContextMenu }: any) {
    const { setNodeRef, isOver } = useDroppable({
        id: `album-${album.id}`,
        data: { albumId: album.id },
    });

    const isAll = album.id === "all";

    return (
        <div ref={setNodeRef} className="relative group shrink-0">
            <button
                onClick={() => onClick(album.id)}
                className={cn(
                    "relative h-24 w-24 overflow-hidden rounded-xl border-2 transition-all bg-cover bg-center bg-no-repeat",
                    activeAlbum === album.id
                        ? "border-inner-accent shadow-md scale-105"
                        : "border-transparent bg-gray-100 hover:bg-gray-200",
                    isOver && "border-inner-accent ring-4 ring-inner-accent/20 scale-110"
                )}
                style={album.coverUrl ? { backgroundImage: `url(${album.coverUrl})` } : {}}
            >
                {/* Dark Overlay for Text Readability */}
                <div className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center p-2 text-center transition-colors",
                    album.coverUrl ? "bg-black/40 group-hover:bg-black/50" : "bg-transparent"
                )}>
                    <span className={cn(
                        "text-xs font-semibold line-clamp-2",
                        album.coverUrl ? "text-white text-shadow-sm" : (activeAlbum === album.id ? "text-inner-accent" : "text-inner-text")
                    )}>
                        {album.name}
                    </span>
                </div>
            </button>

            {/* Context Menu Trigger - Absolute positioned on the card */}
            {!isAll && (
                <button
                    onClick={(e) => onContextMenu(e, album.id)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-white/80 hover:bg-white shadow-sm transition-opacity z-10"
                >
                    <MoreHorizontal size={14} className="text-inner-text-muted" />
                </button>
            )}
        </div>
    );
}

export default function AlbumStrip({ activeAlbum, onAlbumChange }: AlbumStripProps) {
    const { albums, loading, refreshAlbums } = useAlbums();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Lifted Menu State (re-using logic)
    const [menuState, setMenuState] = useState<{ id: string, x: number, y: number } | null>(null);

    const handleContextMenu = (e: React.MouseEvent, albumId: string) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setMenuState({
            id: albumId,
            x: rect.right + 5,
            y: rect.top
        });
    };

    return (
        <>
            <div className="w-full overflow-x-auto py-6 scrollbar-hide relative min-h-[140px]">
                <div className="flex w-max items-center gap-4 px-4 md:px-8">
                    {/* All Photos "Album" */}
                    <AlbumCard
                        album={{ id: "all", name: "All Photos" }}
                        activeAlbum={activeAlbum}
                        onClick={onAlbumChange}
                        onContextMenu={handleContextMenu}
                    />

                    {loading && (
                        <div className="h-24 w-24 animate-pulse rounded-xl bg-gray-200" />
                    )}

                    {albums.map((album) => (
                        <AlbumCard
                            key={album.id}
                            album={album}
                            activeAlbum={activeAlbum}
                            onClick={onAlbumChange}
                            onContextMenu={handleContextMenu}
                        />
                    ))}

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-inner-text-muted/30 text-inner-text-muted hover:border-inner-accent hover:text-inner-accent hover:bg-inner-accent/5 transition-all shrink-0"
                    >
                        <Plus size={24} />
                        <span className="text-xs font-medium">New Album</span>
                    </button>
                </div>
            </div>

            <CreateAlbumModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAlbumCreated={refreshAlbums}
            />

            {/* Render Context Menu outside */}
            {menuState && (
                <>
                    <div className="fixed inset-0 z-50" onClick={() => setMenuState(null)} />
                    <div
                        className="fixed z-50 rounded-lg bg-white shadow-lg border border-inner-border overflow-hidden py-1 w-32"
                        style={{ top: menuState.y, left: menuState.x }}
                    >
                        <AlbumContextMenu
                            albumId={menuState.id}
                            onDelete={() => { refreshAlbums(); setMenuState(null); }}
                            onRename={(name) => { refreshAlbums(); setMenuState(null); }}
                        />
                    </div>
                </>
            )}
        </>
    );
}
