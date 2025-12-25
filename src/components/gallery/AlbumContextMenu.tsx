"use client";

import { Trash2, Edit2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface AlbumContextMenuProps {
    albumId: string;
    onDelete: () => void;
    onRename: (newName: string) => void;
}

export default function AlbumContextMenu({ albumId, onDelete, onRename }: AlbumContextMenuProps) {
    const supabase = createClient();

    const handleDelete = async () => {
        if (confirm("Delete this album? Photos inside will not be deleted.")) {
            await supabase.from("albums").delete().eq("id", albumId);
            onDelete();
        }
    };

    const handleRename = async () => {
        const newName = prompt("Enter new album name:");
        if (newName) {
            await supabase.from("albums").update({ name: newName }).eq("id", albumId);
            onRename(newName);
        }
    };

    return (
        <div className="flex flex-col">
            <button
                onClick={(e) => { e.stopPropagation(); handleRename(); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-inner-text hover:bg-inner-bg text-left"
            >
                <Edit2 size={14} />
                Rename
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 text-left"
            >
                <Trash2 size={14} />
                Delete
            </button>
        </div>
    );
}
