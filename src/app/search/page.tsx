"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePhotos } from "@/hooks/usePhotos";
import { useAlbums } from "@/hooks/useAlbums";
import { motion, AnimatePresence } from "framer-motion";
import LandingTitle from "@/components/landing/LandingTitle";
import PhotoCard from "@/components/gallery/PhotoCard";
import ScatteredPhotos from "@/components/landing/ScatteredPhotos"; // Reusing this component
import { ArrowLeft, Search, Sparkles } from "lucide-react";
import PhotoModal from "@/components/modals/PhotoModal";

export default function SearchPage() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const { photos, loading: photosLoading } = usePhotos("all");
    const { albums, loading: albumsLoading } = useAlbums();
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

    // Filter Logic
    const q = query.toLowerCase().trim();

    const filteredAlbums = q ? albums.filter(a =>
        a.name.toLowerCase().includes(q)
    ) : [];

    const filteredPhotos = q ? photos.filter((p) => (
        (p.caption && p.caption.toLowerCase().includes(q)) ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.album_name && p.album_name.toLowerCase().includes(q))
    )) : [];

    const handleSurpriseMe = () => {
        if (photos.length > 0) {
            const randomIndex = Math.floor(Math.random() * photos.length);
            setSelectedPhotoIndex(randomIndex);
        }
    };

    return (
        <main className="relative min-h-[100dvh] w-full overflow-hidden landing-bg">
            {/* Background Layer */}
            <div className="fixed inset-0 z-0">
                <ScatteredPhotos />
            </div>

            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="absolute top-6 right-6 z-50 rounded-full p-2 text-landing-text/50 hover:bg-black/5 hover:text-landing-text transition-colors"
            >
                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                    <span className="text-sm font-medium">Close</span>
                </div>
            </button>

            {/* Content Layer */}
            <div className="relative z-10 flex h-full w-full max-w-[1600px] mx-auto flex-col px-8 md:px-16 pt-20 md:pt-32 overflow-y-auto h-screen scrollbar-hide">

                {/* Header Section (Left Aligned) */}
                <div className="flex flex-col items-start justify-center mb-12 shrink-0">
                    <LandingTitle />

                    {/* Search Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-full max-w-xl mt-8 relative"
                    >
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-landing-text-muted" size={20} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search names, places, albums..."
                            className="w-full rounded-full border border-landing-grid bg-white/90 backdrop-blur-sm py-4 pl-12 pr-4 text-landing-text shadow-lg focus:border-landing-text focus:outline-none placeholder:text-landing-text-muted/50 text-lg"
                            autoFocus
                        />
                    </motion.div>
                </div>

                {/* Results Grid */}
                {query && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pb-20 w-full space-y-12"
                    >
                        {/* ALBUMS RESULTS */}
                        {filteredAlbums.length > 0 && (
                            <section>
                                <h3 className="text-sm font-medium text-landing-text-muted uppercase tracking-wider mb-6 px-2 border-b border-landing-text/10 pb-2">
                                    Albums ({filteredAlbums.length})
                                </h3>
                                <div className="flex flex-wrap gap-6">
                                    {filteredAlbums.map((album) => (
                                        <div
                                            key={album.id}
                                            onClick={() => router.push(`/home?album=${album.id}`)}
                                            className="group cursor-pointer flex flex-col items-center gap-2"
                                        >
                                            <div
                                                className="h-32 w-32 md:h-40 md:w-40 rounded-2xl bg-gray-100 bg-cover bg-center shadow-md transition-transform group-hover:scale-105 border-4 border-white"
                                                style={{ backgroundImage: album.coverUrl ? `url(${album.coverUrl})` : undefined }}
                                            >
                                                {!album.coverUrl && <div className="h-full w-full flex items-center justify-center text-landing-text-muted">No Cover</div>}
                                            </div>
                                            <span className="font-medium text-landing-text group-hover:underline decoration-landing-text/30 underline-offset-4">
                                                {album.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* PHOTOS RESULTS */}
                        {filteredPhotos.length > 0 && (
                            <section>
                                <h3 className="text-sm font-medium text-landing-text-muted uppercase tracking-wider mb-6 px-2 border-b border-landing-text/10 pb-2">
                                    Photos ({filteredPhotos.length})
                                </h3>
                                <div className="columns-2 gap-4 md:columns-3 lg:columns-4 xl:columns-5 space-y-4">
                                    {filteredPhotos.map((photo, i) => {
                                        const globalIndex = photos.indexOf(photo);
                                        return (
                                            <div key={photo.id} className="break-inside-avoid" onClick={() => setSelectedPhotoIndex(globalIndex)}>
                                                <PhotoCard photo={photo} index={i} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {filteredAlbums.length === 0 && filteredPhotos.length === 0 && (
                            <div className="text-center py-12 text-landing-text-muted bg-white/30 backdrop-blur-md rounded-xl max-w-md mx-auto">
                                No memories found matching "{query}"
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Photo Modal */}
            {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
                <PhotoModal
                    photo={photos[selectedPhotoIndex]}
                    isOpen={true}
                    onClose={() => setSelectedPhotoIndex(null)}
                    onNext={() => selectedPhotoIndex < photos.length - 1 && setSelectedPhotoIndex(selectedPhotoIndex + 1)}
                    onPrev={() => selectedPhotoIndex > 0 && setSelectedPhotoIndex(selectedPhotoIndex - 1)}
                    onDelete={() => { window.location.reload(); }}
                />
            )}
        </main>
    );
}
