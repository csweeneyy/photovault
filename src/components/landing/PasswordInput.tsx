"use client";

import { useState, useRef } from "react";
import { Lock } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
    onSuccess: () => void;
}

export default function PasswordInput({ onSuccess }: PasswordInputProps) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const { signIn } = useAuth();
    const controls = useAnimation();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError(false);

        const { error } = await signIn(password);

        if (error) {
            // Shake animation
            controls.start({
                x: [0, -10, 10, -10, 10, 0],
                transition: { duration: 0.4, ease: "easeInOut" },
            });
            setError(true);
            // Reset error state after 2s for placeholder text
            setTimeout(() => setError(false), 2000);
        } else {
            // Success animation logic is handled by parent or here
            // For now, just trigger callback
            onSuccess();
        }
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            animate={controls}
            className={cn(
                "relative flex w-full max-w-[500px] items-center overflow-hidden rounded-full border bg-white transition-colors duration-200",
                error ? "border-error" : "border-landing-grid focus-within:border-landing-text"
            )}
        >
            <div className="pl-6 text-landing-text-muted">
                <Lock size={18} />
            </div>
            <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={error ? "nope, try again..." : "enter the super secret password..."}
                className={cn(
                    "h-14 w-full border-none bg-transparent px-4 text-base font-normal text-landing-text placeholder:text-landing-text-muted focus:outline-none focus:ring-0",
                    error && "placeholder:text-error"
                )}
                autoFocus
            />
        </motion.form>
    );
}
