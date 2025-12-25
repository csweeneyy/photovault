"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import exifr from "exifr";

export interface UploadFile {
    file: File;
    preview: string;
    id: string;
    status: "pending" | "uploading" | "success" | "error";
    metadata?: {
        takenAt?: string;
        latitude?: number;
        longitude?: number;
    }
}

export function useUpload() {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const supabase = createClient();
    const { displayName } = useAuth();

    // Helper to traverse FileSystemEntry (folders)
    const traverseFileTree = async (item: any, path = ""): Promise<File[]> => {
        if (item.isFile) {
            return new Promise((resolve) => {
                item.file((file: File) => resolve([file]));
            });
        } else if (item.isDirectory) {
            const dirReader = item.createReader();
            const entries: any[] = [];

            // readEntries needs to be called until it returns empty to handle large folders
            const readBatch = async (): Promise<void> => {
                return new Promise((resolve) => {
                    dirReader.readEntries(async (batch: any[]) => {
                        if (batch.length > 0) {
                            entries.push(...batch);
                            await readBatch();
                        }
                        resolve();
                    });
                });
            };

            await readBatch();

            const files: File[] = [];
            for (const entry of entries) {
                files.push(...(await traverseFileTree(entry, path + item.name + "/")));
            }
            return files;
        }
        return [];
    };

    const processDropItems = async (items: DataTransferItemList) => {
        const collectedFiles: File[] = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i].webkitGetAsEntry();
            if (item) {
                collectedFiles.push(...(await traverseFileTree(item)));
            } else if (items[i].kind === 'file') {
                const file = items[i].getAsFile();
                if (file) collectedFiles.push(file);
            }
        }
        processFiles(collectedFiles);
    };

    const processFiles = async (newFiles: File[]) => {
        const processedFiles: UploadFile[] = [];

        // Filter for images only
        const imageFiles = newFiles.filter(f => f.type.startsWith("image/") || f.name.toLowerCase().endsWith(".heic"));

        for (const file of imageFiles) {
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

            // Extract Metadata
            let metadata = {};
            try {
                const exifData = await exifr.parse(fileToUse);
                if (exifData) {
                    metadata = {
                        takenAt: exifData.DateTimeOriginal || exifData.CreateDate,
                        latitude: exifData.latitude,
                        longitude: exifData.longitude
                    };
                }
            } catch (e) {
                // Ignore metadata errors
            }

            previewUrl = URL.createObjectURL(fileToUse);

            processedFiles.push({
                file: fileToUse,
                preview: previewUrl,
                id: Math.random().toString(36).substring(7),
                status: "pending",
                metadata
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

                const fileName = `${Date.now()}-${fileObj.file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

                // 1. Upload to Storage
                const { error: uploadError } = await supabase.storage
                    .from("photos")
                    .upload(fileName, fileObj.file);

                if (uploadError) throw uploadError;

                // 2. Insert into DB
                // Use filename as default caption if none provided
                const defaultName = fileObj.file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

                const { error: dbError } = await supabase.from("photos").insert({
                    storage_path: fileName,
                    album_id: albumId,
                    caption: caption, // Default to empty if not provided by user
                    name: defaultName, // Filename without extension
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
                        // NO-OP
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
        processDropItems,
        removeFile,
        uploadAll,
        isUploading,
        progress,
        clearFiles: () => setFiles([]),
    };
}
