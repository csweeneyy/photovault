"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export interface Album {
    id: string;
    name: string;
    description?: string;
}

export function useAlbums() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchAlbums = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("albums")
            .select("*")
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false });

        if (!error && data) {
            setAlbums(data);
        }
        setLoading(false);
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
