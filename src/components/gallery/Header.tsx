"use client";

import { motion } from "framer-motion";
import { Plus, Play, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
    onUploadClick?: () => void;
}

export default function Header({ onUploadClick }: HeaderProps) {
    const { displayName, signOut } = useAuth();

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-inner-border bg-inner-bg-elevated/90 px-4 backdrop-blur-md md:px-8"
        >
            <div className="flex items-center gap-4">
                <h1 className="font-display text-2xl text-inner-text">
                    SWEENEY VAULT
                </h1>
            </div>

            <div className="flex items-center gap-2 md:gap-6">
                {/* Actions */}
                <button className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-inner-text-muted hover:bg-inner-bg md:flex">
                    <Play size={16} />
                    <span>Slideshow</span>
                </button>

                <button
                    onClick={onUploadClick}
                    className="flex items-center gap-2 rounded-full bg-inner-text px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black/80 transition-transform active:scale-95"
                >
                    <Plus size={16} />
                    <span className="hidden md:inline">Upload</span>
                </button>

                {/* User Profile */}
                <div className="relative group">
                    <button className="flex items-center gap-2 rounded-full border border-inner-border px-3 py-1.5 text-sm font-medium text-inner-text hover:bg-inner-bg">
                        <User size={16} className="text-inner-accent" />
                        <span>{displayName || "Guest"}</span>
                    </button>

                    {/* Dropdown for Sign Out */}
                    <div className="absolute right-0 top-full mt-2 hidden w-32 origin-top-right rounded-lg border border-inner-border bg-white p-1 shadow-lg group-hover:block">
                        <button
                            onClick={() => signOut()}
                            className="w-full rounded-md px-3 py-2 text-left text-sm text-error hover:bg-red-50"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
