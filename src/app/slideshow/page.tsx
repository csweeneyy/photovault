"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePhotos } from "@/hooks/usePhotos";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Play, Pause, FastForward, SkipBack, SkipForward, Shuffle, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Speeds in ms
const SPEEDS = {
    slow: 8000,
    medium: 5000,
    fast: 3000,
};

type Speed = keyof typeof SPEEDS;

import { useSearchParams } from "next/navigation";

export default function SlideshowPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const albumId = searchParams.get("albumId") || "all";

    const { photos, loading } = usePhotos(albumId);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState<Speed>("medium");
    const [showControls, setShowControls] = useState(true);
    const [isShuffle, setIsShuffle] = useState(false);

    // Controls visibility timer
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setShowControls(false), 3000);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("click", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("click", handleMouseMove);
            clearTimeout(timeout);
        };
    }, []);

    const nextPhoto = useCallback(() => {
        if (photos.length === 0) return;

        if (isShuffle) {
            setCurrentIndex(Math.floor(Math.random() * photos.length));
        } else {
            setCurrentIndex((prev) => (prev + 1) % photos.length);
        }
    }, [photos.length, isShuffle]);

    const prevPhoto = () => {
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    // Auto-advance
    useEffect(() => {
        if (!isPlaying || photos.length === 0) return;

        const interval = setInterval(nextPhoto, SPEEDS[speed]);
        return () => clearInterval(interval);
    }, [isPlaying, speed, nextPhoto, photos.length]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") nextPhoto();
            if (e.key === "ArrowLeft") prevPhoto();
            if (e.key === " ") setIsPlaying((p) => !p);
            if (e.key === "Escape") router.back();
            if (e.key === "s") setIsShuffle((p) => !p);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nextPhoto, router]);

    if (loading && photos.length === 0) {
        return <div className="bg-black min-h-screen grid place-items-center text-white">Loading slideshow...</div>;
    }

    if (photos.length === 0) {
        return (
            <div className="bg-black min-h-screen grid place-items-center text-white">
                <div className="text-center">
                    <p className="mb-4">No photos found.</p>
                    <button onClick={() => router.back()} className="px-4 py-2 bg-white text-black rounded-full">Go Back</button>
                </div>
            </div>
        );
    }

    const currentPhoto = photos[currentIndex];

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-black text-white">
            {/* Photo Layer */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentPhoto.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.0, ease: "easeInOut" }}
                    className="absolute inset-0 grid place-items-center"
                >
                    {/* Subtle Ken Burns Effect can be added here with scaling */}
                    <div className="relative w-full h-full flex items-center justify-center p-4 md:p-10">
                        <img
                            src={currentPhoto.url}
                            alt="Slideshow"
                            className="max-h-full max-w-full object-contain shadow-2xl"
                        />
                        {/* Caption Overlay - Optional */}
                        {currentPhoto.caption && (
                            <div className="absolute bottom-10 left-0 w-full text-center px-4">
                                <span className="inline-block bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-lg font-medium text-white/90">
                                    {currentPhoto.caption}
                                </span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Controls Layer */}
            <motion.div
                animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4"
            >
                <div className="flex items-center gap-6 rounded-2xl bg-black/60 backdrop-blur-md px-8 py-4 border border-white/10 shadow-2xl">
                    <button onClick={prevPhoto} className="hover:text-inner-accent transition-colors"><SkipBack /></button>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="h-12 w-12 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all"
                    >
                        {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
                    </button>

                    <button onClick={nextPhoto} className="hover:text-inner-accent transition-colors"><SkipForward /></button>

                    <div className="w-px h-8 bg-white/20 mx-2" />

                    <button
                        onClick={() => setIsShuffle(!isShuffle)}
                        className={cn("transition-colors", isShuffle ? "text-inner-accent" : "text-white/70 hover:text-white")}
                        title="Shuffle (S)"
                    >
                        <Shuffle size={20} />
                    </button>

                    <div className="flex items-center gap-2 text-xs font-medium bg-black/30 rounded-full p-1 border border-white/10">
                        {(["slow", "medium", "fast"] as Speed[]).map((s) => (
                            <button
                                key={s}
                                onClick={() => setSpeed(s)}
                                className={cn(
                                    "px-3 py-1 rounded-full transition-colors",
                                    speed === s ? "bg-white text-black" : "text-white/70 hover:text-white"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <span className="text-sm font-mono text-white/50 w-16 text-right">
                        {currentIndex + 1} / {photos.length}
                    </span>
                </div>
            </motion.div>

            {/* Top Controls */}
            <motion.div
                animate={{ opacity: showControls ? 1 : 0 }}
                className="absolute top-6 right-6 z-50"
            >
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-4 py-2 hover:bg-black/60 border border-white/10"
                >
                    <X size={18} />
                    <span>Exit</span>
                </button>
            </motion.div>
        </div>
    );
}
