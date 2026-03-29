"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check localStorage on mount
        const storedToken = localStorage.getItem("ats_token");
        const storedUser = localStorage.getItem("ats_user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!loading) {
            const isAuthPage = pathname === "/login" || pathname === "/register";
            if (!user && !isAuthPage) {
                // Redirect to login if unauthenticated
                router.push("/login");
            } else if (user && isAuthPage) {
                // Redirect to dashboard if already authenticated
                router.push("/");
            }
        }
    }, [user, loading, pathname, router]);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("ats_token", newToken);
        localStorage.setItem("ats_user", JSON.stringify(newUser));
        router.push("/");
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("ats_token");
        localStorage.removeItem("ats_user");
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
