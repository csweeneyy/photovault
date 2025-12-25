import { useState, useRef } from "react";
import Modal from "@/components/ui/Modal";
import { useUpload } from "@/hooks/useUpload";
import { useAlbums } from "@/hooks/useAlbums";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete: () => void;
}

export default function UploadModal({
    isOpen,
    onClose,
    onUploadComplete,
}: UploadModalProps) {
    const {
        files,
        processFiles,
        removeFile,
        uploadAll,
        isUploading,
        progress,
        clearFiles,
    } = useUpload();

    const [dragActive, setDragActive] = useState(false);
    const [caption, setCaption] = useState("");
    const [selectedAlbumId, setSelectedAlbumId] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);
    const { albums } = useAlbums(); // requires useAlbums hook usage

    const handleFiles = (newFiles: FileList | null) => {
        if (newFiles) {
            processFiles(Array.from(newFiles));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleUpload = async () => {
        const success = await uploadAll(selectedAlbumId || null, caption);
        if (success) {
            clearFiles();
            setCaption("");
            setSelectedAlbumId("");
            onUploadComplete();
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Upload Photos"
            className="max-w-3xl"
        >
            <div className="flex flex-col gap-6">
                {/* Drop Zone */}
                <div
                    className={cn(
                        "relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all",
                        dragActive
                            ? "border-inner-accent bg-inner-accent/5 scale-[1.01]"
                            : "border-inner-border hover:border-inner-accent/50 hover:bg-inner-bg",
                        files.length > 0 && "h-32" // Shrink when files added
                    )}
                    onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive(true);
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive(false);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive(true);
                    }}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept="image/*,.heic"
                        className="hidden"
                        onChange={(e) => handleFiles(e.target.files)}
                    />
                    <Upload
                        size={32}
                        className={cn(
                            "mb-3 transition-colors",
                            dragActive ? "text-inner-accent" : "text-inner-text-muted"
                        )}
                    />
                    <p className="text-center text-sm text-inner-text-muted">
                        <span className="font-medium text-inner-text">Click to upload</span>{" "}
                        or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-inner-text-muted/70">
                        JPG, PNG, HEIC up to 20MB
                    </p>
                </div>

                {/* Preview Queue */}
                {files.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-inner-text">
                                Selected ({files.length})
                            </span>
                            <button
                                onClick={clearFiles}
                                className="text-xs text-error hover:underline"
                            >
                                Clear all
                            </button>
                        </div>

                        <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="relative flex-shrink-0 animate-in fade-in zoom-in duration-300"
                                >
                                    <div className="h-20 w-20 overflow-hidden rounded-md border border-inner-border">
                                        <img
                                            src={file.preview}
                                            alt="preview"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    {/* Status Overlay */}
                                    {file.status === "uploading" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        </div>
                                    )}
                                    {file.status === "success" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-success/50">
                                            <div className="text-white text-xs">✓</div>
                                        </div>
                                    )}
                                    {file.status === "error" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-error/50">
                                            <div className="text-white text-xs">!</div>
                                        </div>
                                    )}

                                    {/* Remove Button */}
                                    {file.status === "pending" && (
                                        <button
                                            onClick={() => removeFile(file.id)}
                                            className="absolute -right-1 -top-1 rounded-full bg-white shadow-md text-landing-text-muted hover:text-error hover:scale-110 transition-transform"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Caption & Actions */}
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <select
                            value={selectedAlbumId}
                            onChange={(e) => setSelectedAlbumId(e.target.value)}
                            className="w-full rounded-lg border border-inner-border bg-inner-bg px-4 py-2 text-inner-text focus:border-inner-accent focus:outline-none appearance-none"
                            style={{ backgroundImage: 'none' }} // Remove default arrow if needed or keep standard
                        >
                            <option value="">No Album (All Photos)</option>
                            {albums.map((album) => (
                                <option key={album.id} value={album.id}>
                                    {album.name}
                                </option>
                            ))}
                        </select>

                        <input
                            type="text"
                            placeholder="Add a caption... (optional)"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            className="w-full rounded-lg border border-inner-border bg-inner-bg px-4 py-2 text-inner-text placeholder:text-inner-text-muted focus:border-inner-accent focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex-1 pr-4">
                            {/* Progress Bar */}
                            {isUploading && (
                                <div className="h-2 w-full overflow-hidden rounded-full bg-inner-bg">
                                    <motion.div
                                        className="h-full bg-inner-accent"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="rounded-full px-4 py-2 text-sm font-medium text-inner-text-muted hover:bg-inner-bg"
                                disabled={isUploading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={files.length === 0 || isUploading}
                                className="rounded-full bg-inner-text px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploading ? "Uploading..." : `Upload ${files.length > 0 ? files.length + " Photos" : ""}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
