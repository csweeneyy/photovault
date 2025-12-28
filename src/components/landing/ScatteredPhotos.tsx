"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";

// USER: Add your favorite photo PUBLIC URLs here to prioritize them in the background
// Example: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]
const HARDCODED_FAVORITES: string[] = [
    // Add URLs here
];

const POSITIONS = [
    { x: 15, y: 12, r: -5, scale: 1 },    // Top Left - shifted right/down
    { x: 75, y: 15, r: 8, scale: 0.9 },   // Top Right - safe
    { x: 25, y: 65, r: -12, scale: 1.1 }, // Bottom Left - shifted up
    { x: 82, y: 70, r: 4, scale: 0.95 },  // Bottom Right - safe
    { x: 50, y: 40, r: 2, scale: 0.85 },  // Center - slightly adjusted
    { x: 20, y: 82, r: -8, scale: 1.0 },  // Bottom Left (low) - shifted up from 85
];

interface ScatteredPhoto {
    src: string;
    x: number;
    y: number;
    r: number;
    scale: number;
}

export default function ScatteredPhotos() {
    const [mounted, setMounted] = useState(false);
    const [photos, setPhotos] = useState<ScatteredPhoto[]>([]);

    useEffect(() => {
        const fetchBackgroundPhotos = async () => {
            const supabase = createClient();
            let vaultUrls: string[] = [];

            try {
                // 1. Try to get random photos via RPC (works for anon/lock screen if migration runs)
                const { data, error } = await supabase
                    .rpc("get_random_background_photos", { limit_count: 12 });

                if (!error && data) {
                    vaultUrls = data.map((p: { storage_path: string }) =>
                        supabase.storage.from("photos").getPublicUrl(p.storage_path).data.publicUrl
                    );
                } else {
                    // Fallback: Standard Select (Only works if logged in, but better than nothing)
                    console.warn("Random RPC failed (maybe run migration?), falling back to recent.");
                    const { data: recentData } = await supabase
                        .from("photos")
                        .select("storage_path")
                        .limit(20)
                        .order("created_at", { ascending: false });

                    if (recentData) {
                        vaultUrls = recentData.map(p =>
                            supabase.storage.from("photos").getPublicUrl(p.storage_path).data.publicUrl
                        );
                    }
                }
            } catch (e) {
                console.error("Failed to fetch background photos", e);
            }

            // 2. Combine with Favorites
            const allUrls = [...HARDCODED_FAVORITES, ...vaultUrls];

            // 3. Shuffle and pick 6
            const shuffled = allUrls.sort(() => 0.5 - Math.random()).slice(0, 6);

            // If we don't have enough, fill with placeholders
            while (shuffled.length < 6) {
                shuffled.push(`https://picsum.photos/400/500?random=${shuffled.length}`);
            }

            // 4. Map to positions
            const mapped = shuffled.map((url, i) => ({
                src: url,
                ...POSITIONS[i % POSITIONS.length]
            }));

            setPhotos(mapped);
            setMounted(true);
        };

        fetchBackgroundPhotos();
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {mounted && photos.map((photo, i) => (
                <FloatingPhoto key={i} photo={photo} index={i} />
            ))}
        </div>
    );
}

function FloatingPhoto({ photo, index }: { photo: ScatteredPhoto; index: number }) {
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
