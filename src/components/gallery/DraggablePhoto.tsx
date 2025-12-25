"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import PhotoCard from "./PhotoCard";
import { Photo } from "@/hooks/usePhotos";

interface DraggablePhotoProps {
    photo: Photo;
    index: number;
    isSelected?: boolean;
    onToggleSelect?: () => void;
}

export function DraggablePhoto({ photo, index, isSelected, onToggleSelect }: DraggablePhotoProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: photo.id,
        data: photo,
    });

    // VISUAL FIX: We do NOT apply transform to the original element, so it stays fixed in the grid.
    // The DragOverlay (handled by parent) provides the moving visual.
    const style = undefined;

    return (
        <div ref={setNodeRef} style={style} className="relative group touch-none">

            {/* Drag Handle Wrapper - Only this triggers drag */}
            <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
                <PhotoCard photo={photo} index={index} isSelected={isSelected} />
            </div>

            {/* Selection Checkbox - Outside listeners to prevent drag trigger */}
            <div
                className={`absolute bottom-3 right-3 z-30 transition-opacity duration-200 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleSelect) onToggleSelect();
                }}
            >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${isSelected ? "bg-inner-accent scale-110" : "bg-black/40 hover:bg-black/60 backdrop-blur-sm"}`}>
                    <div className={`h-3 w-3 rounded-[2px] border-[1.5px] ${isSelected ? "bg-white border-white" : "border-white/80 bg-transparent"}`} />
                </div>
            </div>

        </div>
    );
}
