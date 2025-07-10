'use client'
import { useState } from "react";
import { supabase } from "../client";
import { useRouter, useSearchParams } from "next/navigation";

export default function Login() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(message || '');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;

            // Get the FULL session object including tokens
            const { data: { session } } = await supabase.auth.getSession();

            // Log what we're sending to help debug
            console.log('Sending auth session to main process:',
                session?.access_token ? 'Session with token' : 'No session');

            await window.electronAPI.setAuthSession(session)

            // Successful login - redirect to dashboard
            router.push('/');
        } catch (err) {
            setError(err.message || 'Failed to sign in. Please check your credentials.');
            setLoading(false);
        }
    };

    return (
        <>
            <div className={'flex flex-col gap-6'}>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">{success}</p>}

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="p-2 border rounded"
                        required
                    />
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-primary-400 cursor-pointer hover:underline">
                            Forgot password?
                        </span>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 text-white bg-primary-400 hover:bg-primary-500 rounded ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
            <p className="text-sm text-gray-600 mt-6">
                Don't have an account?{' '}
                <span className="underline cursor-pointer text-primary-400 hover:text-primary-500"
                      onClick={() => router.push('/auth/signup')}>
                    Sign Up
                </span>
            </p>
        </>
    );
}