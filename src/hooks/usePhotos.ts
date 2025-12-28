"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase";

export interface Photo {
    id: string;
    storage_path: string;
    width: number;
    height: number;
    likes_count?: number;
    comments_count?: number;
    caption?: string;
    name?: string;
    location?: string;
    uploaded_by?: string;
    album_name?: string; // For search
    created_at: string;
    url?: string; // Signed or public URL
}

const PAGE_SIZE = 24;

export function usePhotos(albumId: string = "all") {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const supabase = createClient();

    // Store the master list of randomized IDs for "all" mode
    const shuffledIdsRef = useRef<string[]>([]);

    // Helper to get public URL
    const getPhotoUrl = (path: string) => {
        const { data } = supabase.storage.from("photos").getPublicUrl(path);
        return data.publicUrl;
    };

    const fetchPhotos = useCallback(async (reset = false) => {
        try {
            if (reset) setLoading(true); // Only show loading spinner on full reset

            // RANDOM MODE ("all" photos)
            if (albumId === "all") {
                let idsToFetch: string[] = [];

                if (reset) {
                    // 1. Fetch ALL IDs
                    const { data, error } = await supabase
                        .from("photos")
                        .select("id")
                        .order("created_at", { ascending: false }); // Initial fetch order doesn't matter much if we shuffle

                    if (error) throw error;

                    const allIds = (data || []).map((p: any) => p.id);

                    // 2. Shuffle IDs (Fisher-Yates)
                    for (let i = allIds.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [allIds[i], allIds[j]] = [allIds[j], allIds[i]];
                    }

                    shuffledIdsRef.current = allIds;
                    idsToFetch = allIds.slice(0, PAGE_SIZE);
                    setPage(1);
                } else {
                    // Load Next Page from existing shuffled list
                    const startIndex = page * PAGE_SIZE;
                    idsToFetch = shuffledIdsRef.current.slice(startIndex, startIndex + PAGE_SIZE);
                    setPage((prev) => prev + 1);
                }

                if (idsToFetch.length === 0) {
                    setHasMore(false);
                    if (reset) setPhotos([]);
                    setLoading(false);
                    return;
                }

                // 3. Fetch Details for these IDs
                const { data: detailsData, error: detailsError } = await supabase
                    .from("photos")
                    .select(`
                        *,
                        reactions(count),
                        comments(count),
                        albums:albums!photos_album_id_fkey(name)
                    `)
                    .in("id", idsToFetch);

                if (detailsError) throw detailsError;

                // 4. Map and Re-Sort (Database returns in arbitrary order, we want our shuffled order)
                const unorderedPhotos = (detailsData || []).map((p: any) => ({
                    id: p.id,
                    storage_path: p.storage_path,
                    width: p.width,
                    height: p.height,
                    caption: p.caption,
                    name: p.name,
                    location: p.location,
                    created_at: p.created_at,
                    uploaded_by: p.uploaded_by,
                    likes_count: p.reactions?.[0]?.count || 0,
                    comments_count: p.comments?.[0]?.count || 0,
                    album_name: p.albums?.name,
                    url: getPhotoUrl(p.storage_path),
                }));

                const photoMap = new Map(unorderedPhotos.map(p => [p.id, p]));
                const orderedPhotos = idsToFetch
                    .map(id => photoMap.get(id))
                    .filter((p) => !!p) as Photo[];

                if (reset) {
                    setPhotos(orderedPhotos);
                } else {
                    setPhotos(prev => [...prev, ...orderedPhotos]);
                }

                setHasMore(idsToFetch.length === PAGE_SIZE);

            } else {
                // ORDERED MODE (Specific Album)
                const currentPage = reset ? 0 : page;
                const from = currentPage * PAGE_SIZE;
                const to = from + PAGE_SIZE - 1;

                const { data, error } = await supabase
                    .from("photos")
                    .select(`
                        *,
                        reactions(count),
                        comments(count),
                        albums:albums!photos_album_id_fkey(name)
                    `)
                    .eq("album_id", albumId)
                    .order("created_at", { ascending: false })
                    .range(from, to);

                if (error) throw error;

                const formattedPhotos: Photo[] = (data || []).map((p: any) => ({
                    id: p.id,
                    storage_path: p.storage_path,
                    width: p.width,
                    height: p.height,
                    caption: p.caption,
                    name: p.name,
                    location: p.location,
                    created_at: p.created_at,
                    uploaded_by: p.uploaded_by,
                    likes_count: p.reactions?.[0]?.count || 0,
                    comments_count: p.comments?.[0]?.count || 0,
                    album_name: p.albums?.name,
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
            }

        } catch (err) {
            console.error("usePhotos Error:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
        } finally {
            setLoading(false);
        }
    }, [albumId, page, supabase]);

    // Initial load
    useEffect(() => {
        fetchPhotos(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [albumId]); // Reset when album changes

    return { photos, loading, hasMore, loadMore: () => fetchPhotos(false), setPhotos, refreshPhotos: () => fetchPhotos(true) };
}
