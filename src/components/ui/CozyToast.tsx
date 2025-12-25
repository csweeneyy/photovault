"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface ToastProps {
    message: string | null;
    onClose: () => void;
}

export default function CozyToast({ message, onClose }: ToastProps) {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-inner-accent text-white rounded-full shadow-xl flex items-center gap-3 font-medium text-sm"
                >
                    <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
