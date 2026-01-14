'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from "next/navigation";

// Create a React context to share authentication state and helpers
const AuthContext = createContext();

/**
 * AuthProvider wraps application routes that need authentication state.
 * It exposes `user`, `email`, `userRole`, `loading` and helper methods
 * like `getUser`, `handleLogin`, `handleLogout`, and `hasRole`.
 */
export function AuthProvider({ children }) {
    const router = useRouter();
    const pathname = usePathname();

    // Primary auth state
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch current user on mount and whenever storage changes.
    // This centralizes logic for reading token, validating it with
    // the backend (`/auth/me`) and populating local state.
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

                    // If token is valid, populate state; otherwise clear it
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
                    // Network or parsing errors should not crash the app; log
                    // and continue with unauthenticated state.
                    console.error("Error fetching user:", err);
                }
            } else {
                // No token -> unauthenticated state
                setUser(null);
                setUserRole(null);
                setEmail("");
            }
            setLoading(false);
        };

        fetchUser();

        // Listen for `storage` events so auth updates in one tab
        // are reflected across other open tabs/windows.
        const handleStorageChange = (e) => {
            if (e.key === 'access_token') {
                fetchUser();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Navigation/redirect logic: keep users away from auth pages when
    // already logged in, and redirect unauthenticated users to login.
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

    /**
     * getUser - helper that attempts to re-fetch user from backend and
     * updates context state. Returns the user object on success or null.
     */
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

    /**
     * handleLogout - call server logout endpoint, clear local storage
     * and update UI state, then redirect to login page.
     */
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

    /**
     * handleLogin - attempts to authenticate with backend using provided
     * credentials. On success stores access token and refreshes user state.
     */
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
                // Persist token in both local and session storage for flexibility
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

    // Role-based access helper. Returns true if the current user's role
    // meets or exceeds the requiredRole in the simple hierarchy.
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

// Convenience hook for consuming auth context in components
export const useAuth = () => useContext(AuthContext);