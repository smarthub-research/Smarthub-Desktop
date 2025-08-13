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

    // Single useEffect for fetching user data on mount and token changes
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await fetch('http://localhost:8000/auth/me', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        credentials: "include",
                    });
                    const data = await response.json();
                    if (response.ok && data.user) {
                        setUser(data.user);
                        setUserRole(data.user.user_metadata?.role || null);
                        setEmail(data.user.email || "");
                    } else {
                        localStorage.removeItem('access_token');
                        sessionStorage.removeItem('access_token');
                        setUser(null);
                        setUserRole(null);
                        setEmail("");
                    }
                } catch (err) {
                    console.error("Error fetching user:", err);
                }
            } else {
                setUser(null);
                setUserRole(null);
                setEmail("");
            }
            setLoading(false);
        };

        fetchUser();

        // Also set up event listener for storage changes (for multiple tabs)
        const handleStorageChange = (e) => {
            if (e.key === 'access_token') {
                fetchUser();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Navigation/redirect logic
    useEffect(() => {
        if (!loading) {
            const isAuthPage = pathname?.startsWith('/auth');
            const token = localStorage.getItem('access_token');

            if (!token && !isAuthPage) {
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
                    credentials: "include",
                });
                const data = await response.json();
                if (response.ok && data.user) {
                    setUser(data.user);
                    setUserRole(data.user.user_metadata?.role || null);
                    setEmail(data.user.email || "");
                    return data.user;
                }
            } catch (err) {
                console.error("Error in getUser:", err);
            }
        }
        return null;
    }

    async function handleLogout() {
        try {
            await fetch("http://localhost:8000/auth/logout", {
                method: "POST",
                credentials: "include",
            });
            // Clear storage
            localStorage.removeItem('access_token');
            sessionStorage.removeItem('access_token');
            // Update state
            setUser(null);
            setUserRole(null);
            setEmail(null);
            router.push('/auth/login');
        } catch (e) {
            console.error("Logout error:", e);
        }
    }

    // Expose this method to the context
    const handleLogin = async (credentials) => {
        try {
            const response = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok && data.session?.access_token) {
                localStorage.setItem('access_token', data.session.access_token);
                sessionStorage.setItem('access_token', data.session.access_token);
                await getUser();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    // RBAC helper function
    const hasRole = (requiredRole) => {
        if (!userRole) return false;
        const roleHierarchy = { admin: 2, clinician: 1 };
        if (!roleHierarchy[userRole] || !roleHierarchy[requiredRole]) return false;
        return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    };

    return (
        <AuthContext.Provider value={{
            user,
            email,
            getUser,
            handleLogin,
            handleLogout,
            userRole,
            loading,
            hasRole
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);