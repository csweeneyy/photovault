"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";

export interface Photo {
    id: string;
    storage_path: string;
    width: number;
    height: number;
    likes_count?: number;
    comments_count?: number;
    caption?: string;
    created_at: string;
    url?: string; // Signed or public URL
}

const PAGE_SIZE = 20;

export function usePhotos(albumId: string = "all") {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const supabase = createClient();

    // Helper to get public URL
    const getPhotoUrl = (path: string) => {
        const { data } = supabase.storage.from("photos").getPublicUrl(path);
        return data.publicUrl;
    };

    const fetchPhotos = useCallback(async (reset = false) => {
        try {
            setLoading(true);
            const currentPage = reset ? 0 : page;
            const from = currentPage * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            let query = supabase
                .from("photos")
                .select(`
          *,
          reactions(count),
          comments(count)
        `)
                .order("created_at", { ascending: false })
                .range(from, to);

            if (albumId !== "all") {
                query = query.eq("album_id", albumId);
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching photos:", error);
                return;
            }

            const formattedPhotos: Photo[] = (data || []).map((p: any) => ({
                ...p,
                likes_count: p.reactions?.[0]?.count || 0,
                comments_count: p.comments?.[0]?.count || 0,
                url: getPhotoUrl(p.storage_path),
            }));

            if (reset) {
                setPhotos(formattedPhotos);
                setPage(1);
            } else {
                setPhotos((prev) => [...prev, ...formattedPhotos]);
                setPage((prev) => prev + 1);
            }

            setHasMore(formattedPhotos.length === PAGE_SIZE);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [albumId, page, supabase]);

    // Initial load
    useEffect(() => {
        fetchPhotos(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [albumId]); // Reset when album changes

    return { photos, loading, hasMore, loadMore: () => fetchPhotos(false) };
}
