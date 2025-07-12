/**
 * Authentication Context
 *
 * This file contains the context used by all pages to actively access the current state of the
 * user's authentication.
 */
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session and set up auth state listener
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                setUser(session.user);

                // Fetch user role from profiles table
                const { data: profile } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (profile) setUserRole(profile.role);
            }

            setLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session) {
                    setUser(session.user);

                    // Fetch user role
                    const { data: profile } = await supabase
                        .from('users')
                        .select('role')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) setUserRole(profile.role);
                } else {
                    setUser(null);
                    setUserRole(null);
                }
                setLoading(false);
            }
        );

        return () => subscription?.unsubscribe();
    }, []);

    // Auth functions
    const signIn = async (email, password) => {
        return await supabase.auth.signInWithPassword({ email, password });
    };

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (data.user) {
            await supabase.from('users').insert({
                id: data.user.id,
                role: 'clinician'
            });
        }

        return { data, error };
    };

    const signOut = async () => {
        return await supabase.auth.signOut();
    };

    // RBAC helper function
    const hasRole = (requiredRole) => {
        if (!userRole) return false;

        const roleHierarchy = {
            admin: 2,
            clinician: 1
        };

        // Handle cases where role might not be in hierarchy
        if (!roleHierarchy[userRole] || !roleHierarchy[requiredRole]) {
            return false;
        }

        return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    };

    return (
        <AuthContext.Provider value={{ user, userRole, loading, signIn, signUp, signOut, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);