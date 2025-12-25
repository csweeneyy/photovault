"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export interface UploadFile {
    file: File;
    preview: string;
    id: string;
    status: "pending" | "uploading" | "success" | "error";
}

export function useUpload() {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const supabase = createClient();
    const { displayName } = useAuth();

    const processFiles = async (newFiles: File[]) => {
        const processedFiles: UploadFile[] = [];

        for (const file of newFiles) {
            // Use local blob unless it's HEIC, then convert
            let fileToUse = file;
            let previewUrl = "";

            if (file.name.toLowerCase().endsWith(".heic")) {
                try {
                    // Dynamic import to avoid SSR 'window is not defined' error
                    const heic2any = (await import("heic2any")).default;

                    const convertedBlob = await heic2any({
                        blob: file,
                        toType: "image/jpeg",
                        quality: 0.8,
                    });

                    // heic2any can return Blob or Blob[]
                    const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

                    fileToUse = new File([finalBlob], file.name.replace(/\.heic$/i, ".jpg"), {
                        type: "image/jpeg",
                    });
                } catch (e) {
                    console.error("HEIC conversion failed", e);
                }
            }

            previewUrl = URL.createObjectURL(fileToUse);

            processedFiles.push({
                file: fileToUse,
                preview: previewUrl,
                id: Math.random().toString(36).substring(7),
                status: "pending",
            });
        }

        setFiles((prev) => [...prev, ...processedFiles]);
    };

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const uploadAll = async (albumId: string | null = null, caption: string = "") => {
        if (files.length === 0) return;

        setIsUploading(true);
        setProgress(0);

        // Concurrency Helper
        const CONCURRENCY_LIMIT = 3;
        const queue = [...files];
        let completedCount = 0;

        const uploadSingle = async (fileObj: UploadFile) => {
            try {
                setFiles((prev) =>
                    prev.map((f) => (f.id === fileObj.id ? { ...f, status: "uploading" } : f))
                );

                const fileName = `${Date.now()}-${fileObj.file.name}`;

                // 1. Upload to Storage
                const { error: uploadError } = await supabase.storage
                    .from("photos")
                    .upload(fileName, fileObj.file);

                if (uploadError) throw uploadError;

                // 2. Insert into DB
                const { error: dbError } = await supabase.from("photos").insert({
                    storage_path: fileName,
                    album_id: albumId,
                    caption: caption,
                    uploaded_by: displayName || "Guest",
                    width: 0,
                    height: 0,
                });

                if (dbError) throw dbError;

                setFiles((prev) =>
                    prev.map((f) => (f.id === fileObj.id ? { ...f, status: "success" } : f))
                );
            } catch (e) {
                console.error(e);
                setFiles((prev) =>
                    prev.map((f) => (f.id === fileObj.id ? { ...f, status: "error" } : f))
                );
            } finally {
                completedCount++;
                setProgress((completedCount / files.length) * 100);
            }
        };

        // Process queue with concurrency
        const activeUploads: Promise<void>[] = [];

        while (queue.length > 0 || activeUploads.length > 0) {
            // Fill active slots
            while (queue.length > 0 && activeUploads.length < CONCURRENCY_LIMIT) {
                const nextFile = queue.shift();
                if (nextFile) {
                    // Wrap in tracking promise
                    const promise = uploadSingle(nextFile).then(() => {
                        // NO-OP, completion handled inside uploadSingle
                    });
                    // Track promise to remove from active list when done
                    const trackPromise = promise.then(() => {
                        const idx = activeUploads.indexOf(trackPromise);
                        if (idx > -1) activeUploads.splice(idx, 1);
                    });
                    activeUploads.push(trackPromise);
                }
            }

            if (activeUploads.length > 0) {
                // Wait for at least one to finish before refilling queue
                await Promise.race(activeUploads);
            } else if (queue.length === 0) {
                break; // Done
            }
        }

        setIsUploading(false);
        return true;
    };

    return {
        files,
        processFiles,
        removeFile,
        uploadAll,
        isUploading,
        progress,
        clearFiles: () => setFiles([]),
    };
}
