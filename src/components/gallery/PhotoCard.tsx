"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import { Photo } from "@/hooks/usePhotos";
import { cn } from "@/lib/utils";

interface PhotoCardProps {
    photo: Photo;
    index: number;
    isSelected?: boolean;
}

export default function PhotoCard({ photo, index, isSelected }: PhotoCardProps) {
    // Determine aspect ratio if dimensions exist, otherwise standard
    const aspectRatio = photo.width && photo.height
        ? photo.height / photo.width
        : 1.25; // Default 4:5

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
                delay: (index % 5) * 0.1 // Stagger based on column position approx
            }}
            whileHover={{
                scale: 1.02,
                y: -4,
                boxShadow: "0 12px 40px rgba(44, 36, 22, 0.15)",
                transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
            }}
            className={cn(
                "group relative cursor-pointer overflow-hidden rounded-xl bg-gray-100 shadow-sm w-full transition-all duration-300",
                isSelected ? "ring-4 ring-inner-accent scale-[0.98]" : ""
            )}
        >
            <div className="relative w-full">
                <img
                    src={photo.url}
                    alt={photo.caption || "Memory"}
                    loading={index < 8 ? "eager" : "lazy"} // Keep eager loading for speed
                    decoding="async"
                    className="w-full h-auto object-cover block transition-opacity duration-500"
                />

                {/* Overlay Gradients */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>

            {/* Badges */}
            <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <Heart size={12} className="fill-white" />
                    <span>{photo.likes_count || 0}</span>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <MessageCircle size={12} className="fill-white" />
                    <span>{photo.comments_count || 0}</span>
                </div>
            </div>
        </motion.div>
    );
}
