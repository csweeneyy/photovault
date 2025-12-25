"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "@/hooks/usePhotos";
import { DraggablePhoto } from "./DraggablePhoto";
import Skeleton from "@/components/ui/Skeleton";
import { splitArray } from "@/lib/masonry";

interface PhotoGridProps {
    photos: Photo[];
    loading: boolean;
    hasMore: boolean;
    loadMore: () => void;
    onPhotoClick: (index: number) => void;
    onSelectionChange?: (id: string) => void;
    selectedIds?: Set<string>;
}

export default function PhotoGrid({
    photos,
    loading,
    hasMore,
    loadMore,
    onPhotoClick,
    onSelectionChange,
    selectedIds
}: PhotoGridProps) {
    const observerTarget = useRef<HTMLDivElement>(null);
    const [columns, setColumns] = useState(2);

    // Responsive columns 
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

    // Render plain grid (DnD wrapper is in parent)
    return (
        <div className="px-4 pb-20 md:px-8">
            <div className="flex gap-4 md:gap-6">
                {photoColumns.map((col, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-4 md:gap-6 flex-1">
                        {col.map((photo, i) => {
                            const realIndex = photos.indexOf(photo);

                            return (
                                <div key={photo.id} onClick={() => onPhotoClick(realIndex)}>
                                    <DraggablePhoto
                                        photo={photo}
                                        index={i}
                                        isSelected={selectedIds?.has(photo.id)}
                                        onToggleSelect={() => onSelectionChange && onSelectionChange(photo.id)}
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
