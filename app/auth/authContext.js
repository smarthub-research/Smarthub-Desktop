'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore user on mount
    useEffect(() => {
        getUser();
        // eslint-disable-next-line
    }, []);

    // Handle redirects
    useEffect(() => {
        if (!loading) {
            const isAuthPage = pathname?.startsWith('/auth');
            if (!user && !isAuthPage) {
                router.push('/auth/login');
            } else if (user && isAuthPage) {
                router.push('/');
            }
        }
    }, [user, loading, pathname, router]);

    async function getUser() {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const response = await fetch('http://localhost:8000/auth/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.ok && data.user) {
                    setUser(data.user);
                    setUserRole(data.user.user_metadata?.role || null);
                } else {
                    setUser(null);
                    setUserRole(null);
                }
            } catch (err) {
                setUser(null);
                setUserRole(null);
            }
        }
        setLoading(false);
    }

    async function handleLogout() {
        try {
            await fetch("http://localhost:8000/auth/logout", {
                method: "POST",
                credentials: "include",
            });
            setUser(null);
            setUserRole(null);
            setEmail(null);
        } catch (e) {
            // Optionally handle error
        }
        router.push('/auth/login');
    }

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch("http://localhost:8000/auth/me", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await response.json();
                setUser(data.data);
                setEmail(data.data?.email || "");
            } catch (e) {
                setUser(null);
                setEmail("");
            }
        };
        fetchUser();
    }, []);

    // RBAC helper function
    const hasRole = (requiredRole) => {
        if (!userRole) return false;
        const roleHierarchy = { admin: 2, clinician: 1 };
        if (!roleHierarchy[userRole] || !roleHierarchy[requiredRole]) return false;
        return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    };

    return (
        <AuthContext.Provider value={{ user, getUser, handleLogout, userRole, loading, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);