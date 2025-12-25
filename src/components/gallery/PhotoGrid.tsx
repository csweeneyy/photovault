"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "@/hooks/usePhotos";
import PhotoCard from "./PhotoCard";
import Skeleton from "@/components/ui/Skeleton";
import { splitArray } from "@/lib/masonry";
import { motion } from "framer-motion";

interface PhotoGridProps {
    photos: Photo[];
    loading: boolean;
    hasMore: boolean;
    loadMore: () => void;
    onPhotoClick: (index: number) => void;
}

export default function PhotoGrid({
    photos,
    loading,
    hasMore,
    loadMore,
    onPhotoClick
}: PhotoGridProps) {
    const observerTarget = useRef<HTMLDivElement>(null);
    const [columns, setColumns] = useState(2);

    // Responsive columns (naive execution)
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width >= 1280) setColumns(5);
            else if (width >= 1024) setColumns(4);
            else if (width >= 768) setColumns(3);
            else setColumns(2);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading, loadMore]);

    // Split photos into columns
    const photoColumns = splitArray(photos, columns);

    // Loading state
    if (loading && photos.length === 0) {
        return (
            <div className="grid grid-cols-2 gap-3 px-4 pb-20 md:grid-cols-3 md:gap-6 md:px-8 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="aspect-[3/4] w-full overflow-hidden rounded-xl">
                        <Skeleton className="h-full w-full" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="px-4 pb-20 md:px-8">
            <div className="flex gap-4 md:gap-6">
                {photoColumns.map((col, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-4 md:gap-6 flex-1">
                        {col.map((photo, i) => {
                            // Find original index for click handler
                            // This naive calculation doesn't work well because splitArray interleaves.
                            // We need to pass the real index or just find it. 
                            const realIndex = photos.indexOf(photo);

                            return (
                                <div key={photo.id} onClick={() => onPhotoClick(realIndex)}>
                                    <PhotoCard
                                        photo={photo}
                                        index={i} // Using column index for delay calculation logic inside card
                                    />
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Sentinel for Infinite Scroll */}
            <div ref={observerTarget} className="h-10 w-full" />

            {loading && (
                <div className="w-full flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-inner-accent border-t-transparent" />
                </div>
            )}
        </div>
    );
}
