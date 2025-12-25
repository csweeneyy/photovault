"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/gallery/Header";
import AlbumStrip from "@/components/gallery/AlbumStrip";
import PhotoGrid from "@/components/gallery/PhotoGrid";
import UploadModal from "@/components/modals/UploadModal";
import PhotoModal from "@/components/modals/PhotoModal";
import { usePhotos, Photo } from "@/hooks/usePhotos";
import { createClient } from "@/lib/supabase";
import { DndContext, DragEndEvent, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors, DragStartEvent } from "@dnd-kit/core";
import PhotoCard from "@/components/gallery/PhotoCard";
import CozyToast from "@/components/ui/CozyToast";

export default function GalleryPage() {
    const searchParams = useSearchParams();
    const initialAlbum = searchParams.get("album") || "all";

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [activeAlbum, setActiveAlbum] = useState(initialAlbum);
    const { photos, loading, hasMore, loadMore, setPhotos } = usePhotos(activeAlbum);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Sync URL with State (optional but good) or State with URL
    useEffect(() => {
        const albumParam = searchParams.get("album");
        if (albumParam && albumParam !== activeAlbum) {
            setActiveAlbum(albumParam);
        }
    }, [searchParams]);

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // DnD State
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const activeDragPhoto = photos.find(p => p.id === activeDragId);

    const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } });
    const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } });
    const sensors = useSensors(mouseSensor, touchSensor);

    const handleUploadComplete = () => {
        window.location.reload();
    };

    const handleNext = () => selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1 && setSelectedPhotoIndex(selectedPhotoIndex + 1);
    const handlePrev = () => selectedPhotoIndex !== null && selectedPhotoIndex > 0 && setSelectedPhotoIndex(selectedPhotoIndex - 1);
    const handleDelete = () => { setSelectedPhotoIndex(null); window.location.reload(); };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);

        // Check if dropped on an album
        if (over && over.id.toString().startsWith("album-")) {
            // Robust ID extraction
            let targetAlbumId = over.data.current?.albumId;
            if (!targetAlbumId) {
                targetAlbumId = over.id.toString().replace("album-", "");
            }

            const photoId = active.id as string;

            if (!targetAlbumId) return;

            const supabase = createClient();

            // If we have selected items and the dragged item is one of them, move ALL selected
            const itemsToMove = selectedIds.has(photoId) ? Array.from(selectedIds) : [photoId];

            // Logic: If target is "all", we set album_id to NULL (remove from album)
            // But verify: Does "All Photos" mean "No Album" or just "Ignore Album"?
            // Usually "All Photos" bucket implies "remove from specific album".
            const newAlbumId = targetAlbumId === "all" ? null : targetAlbumId;

            console.log(`Moving ${itemsToMove.length} items to album: ${newAlbumId} (Target: ${targetAlbumId})`);

            // Optimistic Update: Remove moved photos from the current view immediately
            // Logic: only remove from view if we are viewing a SPECIFIC album.
            // If viewing "All", we don't remove.
            if (activeAlbum !== "all") {
                setPhotos((prev: any) => prev.filter((p: any) => !itemsToMove.includes(p.id)));
            }

            // Sync with DB
            try {
                // Use .in() for efficient batch update
                const { error } = await supabase
                    .from("photos")
                    .update({ album_id: newAlbumId })
                    .in("id", itemsToMove);

                if (error) {
                    console.error("Move error:", error);
                    setToastMessage("Failed to move photos");
                    // Optionally revert optimistic state here if needed
                    return;
                }

                const actionText = newAlbumId === null ? "Removed from album" : "Moved to album";
                setToastMessage(`${actionText} (${itemsToMove.length} photos)`);

                // Clear selection after move
                setSelectedIds(new Set());

            } catch (err) {
                console.error("Move exception:", err);
                setToastMessage("Error moving photos");
            }
        }
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <main className="min-h-screen w-full bg-inner-bg landing-bg relative">
                <Header onUploadClick={() => setIsUploadModalOpen(true)} activeAlbum={activeAlbum} />

                {/* Fixed Selection Overlay */}
                {selectedIds.size > 0 && (
                    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 bg-inner-accent text-white px-8 py-3 rounded-full flex gap-6 items-center shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 fade-in duration-300">
                        <span className="font-medium">{selectedIds.size} Selected</span>
                        <div className="h-4 w-px bg-white/30" />
                        <button onClick={() => setSelectedIds(new Set())} className="text-sm font-medium hover:text-white/80 transition-colors">Clear</button>
                    </div>
                )}

                <AlbumStrip
                    activeAlbum={activeAlbum}
                    onAlbumChange={setActiveAlbum}
                />

                <PhotoGrid
                    photos={photos}
                    loading={loading}
                    hasMore={hasMore}
                    loadMore={loadMore}
                    onPhotoClick={(index) => {
                        setSelectedPhotoIndex(index);
                    }}
                    selectedIds={selectedIds}
                    onSelectionChange={toggleSelection}
                />

                <UploadModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    onUploadComplete={handleUploadComplete}
                />

                {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
                    <PhotoModal
                        photo={photos[selectedPhotoIndex]}
                        isOpen={true}
                        onClose={() => setSelectedPhotoIndex(null)}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        onDelete={handleDelete}
                    />
                )}

                <DragOverlay>
                    {activeDragId && activeDragPhoto ? (
                        <div className="w-[200px] opacity-90 rotate-3 cursor-grabbing shadow-2xl">
                            {selectedIds.has(activeDragId) && selectedIds.size > 1 && (
                                <div className="absolute -top-2 -right-2 z-50 h-8 w-8 rounded-full bg-inner-accent text-white flex items-center justify-center font-bold shadow-md border-2 border-white">
                                    {selectedIds.size}
                                </div>
                            )}
                            <PhotoCard photo={activeDragPhoto} index={0} />
                        </div>
                    ) : null}
                </DragOverlay>

                <CozyToast
                    message={toastMessage}
                    onClose={() => setToastMessage(null)}
                />
            </main>
        </DndContext>
    );
}
