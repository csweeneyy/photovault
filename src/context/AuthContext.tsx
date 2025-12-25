"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    displayName: string | null;
    setDisplayName: (name: string) => void;
    isLoading: boolean;
    signIn: (password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    displayName: null,
    setDisplayName: () => { },
    isLoading: true,
    signIn: async () => ({ error: null }),
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [displayName, setDisplayNameState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    // Load display name from localStorage on mount
    useEffect(() => {
        const storedName = localStorage.getItem("sweeneyVaultUserName");
        if (storedName) {
            setDisplayNameState(storedName);
        }
    }, []);

    const setDisplayName = (name: string) => {
        setDisplayNameState(name);
        if (name) {
            localStorage.setItem("sweeneyVaultUserName", name);
        } else {
            localStorage.removeItem("sweeneyVaultUserName");
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const signIn = async (password: string) => {
        // We assume a single shared email for this family app
        const email = "family@sweeneyvault.com";

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (!error) {
            setUser(data.user);
            setSession(data.session);
        }

        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        router.push("/");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                displayName,
                setDisplayName,
                isLoading,
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
