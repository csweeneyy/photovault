"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    className?: string;
}

export default function Modal({
    isOpen,
    onClose,
    children,
    title,
    className,
}: ModalProps) {
    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                            "relative w-full max-w-2xl overflow-hidden rounded-2xl bg-inner-bg-elevated shadow-xl",
                            className
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-inner-border px-6 py-4">
                            <h3 className="font-display text-xl text-inner-text">
                                {title || "Modal"}
                            </h3>
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 text-inner-text-muted hover:bg-inner-bg hover:text-inner-text"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
