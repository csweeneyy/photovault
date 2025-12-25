"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// Reaction emojis map
const REACTIONS = [
    { label: "Love", emoji: "❤️" },
    { label: "Haha", emoji: "😂" },
    { label: "Love it", emoji: "😍" },
    { label: "Fire", emoji: "🔥" },
    { label: "Sad", emoji: "😢" },
    { label: "Wow", emoji: "😮" },
];

interface ReactionsBarProps {
    photoId: string;
    initialReactions: Record<string, number>; // { "❤️": 5, "😂": 2 }
    userReactions: string[]; // List of emojis user has clicked
}

export default function ReactionsBar({
    photoId,
    initialReactions,
    userReactions = [],
}: ReactionsBarProps) {
    const [counts, setCounts] = useState(initialReactions);
    const [myReactions, setMyReactions] = useState<Set<string>>(new Set(userReactions));
    const { displayName } = useAuth();
    const supabase = createClient();

    const handleReaction = async (emoji: string) => {
        if (!displayName) return; // Prevent guests from reacting? Or prompt name.

        const isActive = myReactions.has(emoji);

        // Optimistic Update
        const newCounts = { ...counts };
        const newMyReactions = new Set(myReactions);

        if (isActive) {
            newCounts[emoji] = Math.max(0, (newCounts[emoji] || 0) - 1);
            newMyReactions.delete(emoji);
        } else {
            newCounts[emoji] = (newCounts[emoji] || 0) + 1;
            newMyReactions.add(emoji);
        }

        setCounts(newCounts);
        setMyReactions(newMyReactions);

        // DB Update
        if (isActive) {
            // Remove reaction
            await supabase
                .from("reactions")
                .delete()
                .match({ photo_id: photoId, user_name: displayName, emoji });
        } else {
            // Add reaction
            await supabase
                .from("reactions")
                .insert({ photo_id: photoId, user_name: displayName, emoji });
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {REACTIONS.map(({ emoji }) => {
                const count = counts[emoji] || 0;
                const isActive = myReactions.has(emoji);

                return (
                    <motion.button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        whileTap={{ scale: 0.9 }}
                        className={cn(
                            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                            isActive
                                ? "border-inner-accent bg-inner-accent/10 text-inner-text"
                                : "border-inner-border bg-white text-inner-text-muted hover:bg-inner-bg"
                        )}
                    >
                        <span className={isActive ? "scale-110" : "grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100"}>
                            {emoji}
                        </span>
                        <span>{count}</span>
                    </motion.button>
                );
            })}
        </div>
    );
}
