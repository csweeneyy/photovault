"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import LandingTitle from "@/components/landing/LandingTitle";
import PasswordInput from "@/components/landing/PasswordInput";
import ScatteredPhotos from "@/components/landing/ScatteredPhotos";
import NamePrompt from "@/components/landing/NamePrompt";

export default function LandingPage() {
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  const handlePasswordSuccess = () => {
    // Password correct (AuthContext handled logic), now show name prompt
    setShowNamePrompt(true);
  };

  const handleNameComplete = () => {
    setShowNamePrompt(false);
    setIsExiting(true);

    // Delay navigation slightly to allow exit animation to play
    setTimeout(() => {
      router.push("/home");
    }, 800);
  };

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden landing-bg">
      <AnimatePresence>
        {!isExiting && (
          <motion.div
            key="content"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="relative h-full w-full flex flex-col justify-center px border-box"
          >
            {/* Background elements */}
            <div className={isExiting ? "opacity-0 transition-opacity duration-500 delay-0" : ""}>
              <ScatteredPhotos />
            </div>

            {/* Main Content Layer */}
            <div className="relative z-10 flex h-full w-full max-w-[1600px] mx-auto flex-col justify-center px-8 md:px-16">

              <div className="flex-1 flex items-center">
                <LandingTitle />
              </div>

              <div className="mb-[20vh] flex justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                >
                  <PasswordInput onSuccess={handlePasswordSuccess} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NamePrompt isOpen={showNamePrompt} onComplete={handleNameComplete} />
    </main>
  );
}
