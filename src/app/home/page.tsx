"use client";

import { useState } from "react";
import Header from "@/components/gallery/Header";
import AlbumPills from "@/components/gallery/AlbumPills";
import PhotoGrid from "@/components/gallery/PhotoGrid";
import UploadModal from "@/components/modals/UploadModal";
import PhotoModal from "@/components/modals/PhotoModal";
import { usePhotos } from "@/hooks/usePhotos";

export default function GalleryPage() {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [activeAlbum, setActiveAlbum] = useState("all");
    const { photos, loading, hasMore, loadMore } = usePhotos(activeAlbum);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

    const handleUploadComplete = () => {
        window.location.reload();
    };

    const handleNext = () => {
        if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
            setSelectedPhotoIndex(selectedPhotoIndex + 1);
        }
    };

    const handlePrev = () => {
        if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
            setSelectedPhotoIndex(selectedPhotoIndex - 1);
        }
    };

    const handleDelete = () => {
        setSelectedPhotoIndex(null);
        window.location.reload();
    };

    return (
        <main className="min-h-screen w-full bg-inner-bg">
            <Header onUploadClick={() => setIsUploadModalOpen(true)} />

            <AlbumPills
                activeAlbum={activeAlbum}
                onAlbumChange={setActiveAlbum}
            />

            <PhotoGrid
                photos={photos}
                loading={loading}
                hasMore={hasMore}
                loadMore={loadMore}
                onPhotoClick={setSelectedPhotoIndex}
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
        </main>
    );
}
