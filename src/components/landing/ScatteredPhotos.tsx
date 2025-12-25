"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

// Placeholder photos for initial dev
const HARDCODED_PHOTOS = [
    { src: "https://picsum.photos/400/500?random=1", x: 10, y: 10, r: -5, scale: 1 },
    { src: "https://picsum.photos/400/500?random=2", x: 70, y: 15, r: 8, scale: 0.9 },
    { src: "https://picsum.photos/400/500?random=3", x: 20, y: 60, r: -12, scale: 1.1 },
    { src: "https://picsum.photos/400/500?random=4", x: 80, y: 65, r: 4, scale: 0.95 },
    { src: "https://picsum.photos/400/500?random=5", x: 45, y: 30, r: 2, scale: 0.8 },
    { src: "https://picsum.photos/400/500?random=6", x: 15, y: 85, r: -8, scale: 1.0 },
];

export default function ScatteredPhotos() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {mounted &&
                HARDCODED_PHOTOS.map((photo, i) => (
                    <FloatingPhoto key={i} photo={photo} index={i} />
                ))}
        </div>
    );
}

function FloatingPhoto({ photo, index }: { photo: any; index: number }) {
    // Random float parameters
    const duration = 6 + Math.random() * 4; // 6-10s

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40, rotate: (Math.random() - 0.5) * 40 }}
            animate={{
                opacity: 0.6, // Keep them subtle in background
                scale: photo.scale,
                y: 0,
                rotate: photo.r
            }}
            transition={{
                duration: 0.8,
                delay: index * 0.12 + 0.3,
                ease: [0.16, 1, 0.3, 1]
            }}
            style={{
                position: "absolute",
                left: `${photo.x}%`,
                top: `${photo.y}%`,
                zIndex: 0,
            }}
        >
            <motion.div
                animate={{
                    y: [0, -8, 0, 6, 0],
                    x: [0, 4, 0, -3, 0],
                    rotate: [photo.r, photo.r + 1.5, photo.r, photo.r - 1, photo.r],
                }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="relative p-3 bg-white shadow-xl rounded-sm"
            >
                <div
                    className="w-48 h-60 bg-gray-200 overflow-hidden"
                    style={{
                        backgroundImage: `url(${photo.src})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
            </motion.div>
        </motion.div>
    );
}
