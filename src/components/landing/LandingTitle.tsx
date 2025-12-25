"use client";

import { motion } from "framer-motion";

export default function LandingTitle() {
    return (
        <div className="relative z-10 mix-blend-multiply pointer-events-none">
            <motion.h1
                className="font-display leading-[0.85] tracking-tight text-landing-text select-none"
                style={{ fontSize: "clamp(4rem, 15vw, 12rem)" }}
                initial={{ clipPath: "inset(100% 0% 0% 0%)", y: 20 }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)", y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            >
                <div>SWEENEY</div>
                <div className="pl-[0.5em]">VAULT</div>
            </motion.h1>
        </div>
    );
}
