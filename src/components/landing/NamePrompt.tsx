"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface NamePromptProps {
    isOpen: boolean;
    onComplete: () => void;
}

export default function NamePrompt({ isOpen, onComplete }: NamePromptProps) {
    const [name, setName] = useState("");
    const { setDisplayName } = useAuth();

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (name.trim()) {
            setDisplayName(name.trim());
        }
        // If empty/skipped, previous display name logic handles it (or remains null)
        onComplete();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 shadow-xl"
                    >
                        <h2 className="mb-6 text-center font-display text-3xl text-landing-text">
                            Welcome in!
                        </h2>
                        <p className="mb-8 text-center text-landing-text-muted">
                            What should we call you?
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className="w-full rounded-lg border border-landing-grid bg-landing-bg px-4 py-3 text-center text-lg text-landing-text placeholder:text-landing-text-muted focus:border-landing-text focus:outline-none"
                                autoFocus
                            />

                            <div className="mt-4 flex justify-between gap-4">
                                <button
                                    type="button"
                                    onClick={() => onComplete()}
                                    className="rounded-full px-6 py-2 text-sm font-medium text-landing-text-muted hover:bg-landing-bg hover:text-landing-text"
                                >
                                    Skip
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-full bg-landing-text px-8 py-2 text-sm font-medium text-white transition-transform hover:scale-105 active:scale-95"
                                >
                                    Enter →
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
