"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export interface Album {
    id: string;
    name: string;
    description?: string;
    coverUrl?: string | null;
}

export function useAlbums() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchAlbums = async () => {
        setLoading(true);

        try {
            // 1. Fetch albums first (fast)
            const { data: albumsData, error: albumsError } = await supabase
                .from("albums")
                .select("*")
                .order("sort_order", { ascending: true })
                .order("created_at", { ascending: false });

            if (albumsError) throw albumsError;
            if (!albumsData) {
                setAlbums([]);
                setLoading(false);
                return;
            }

            // Set immediately so UI shows something
            setAlbums(albumsData);

            // 2. Fetch covers in parallel
            const albumsWithCovers = await Promise.all(albumsData.map(async (album) => {
                const { data: photoData } = await supabase
                    .from("photos")
                    .select("storage_path")
                    .eq("album_id", album.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                return {
                    ...album,
                    coverUrl: photoData ? supabase.storage.from("photos").getPublicUrl(photoData.storage_path).data.publicUrl : null
                };
            }));

            // Update with covers
            setAlbums(albumsWithCovers);

        } catch (err) {
            console.error("Error fetching albums:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlbums();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const createAlbum = async (name: string) => {
        const { data, error } = await supabase
            .from("albums")
            .insert({ name })
            .select()
            .single();

        if (data) {
            setAlbums(prev => [data, ...prev]);
            return data;
        }
        return null;
    };

    return { albums, loading, createAlbum, refreshAlbums: fetchAlbums };
}
