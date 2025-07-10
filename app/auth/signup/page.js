'use client'
import { useState } from "react";
import { supabase } from "../client";
import { useRouter } from "next/navigation";

export default function Signup() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
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

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        role: 'clinician'
                    }
                }
            });

            if (authError) throw authError;

            // 2. Insert user data into custom users table for RBAC
            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('users')
                    .insert([
                        {
                            id: authData.user.id,
                            full_name: formData.name,
                            email: formData.email,
                            role: 'clinician',
                            created_at: new Date()
                        }
                    ]);

                if (profileError) {
                    console.error('Error saving user profile:', profileError);
                }
            }

            // Redirect to login page with success message
            router.push('/auth/login?message=Account created successfully! Please check your email to verify your account.');
        } catch (err) {
            setError(err.message || 'Failed to create account. Please try again.');
            setLoading(false);
        }
    };

    return (
        <>
            <div className={'flex flex-col gap-8'}>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <input
                        name="name"
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="p-2 border rounded"
                        required
                    />
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
                    <input
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="p-2 border rounded"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-white bg-primary-400 hover:bg-primary-500 rounded"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
            </div>
            <p className="text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <span className="underline cursor-pointer text-primary-400 hover:text-primary-500"
                      onClick={() => router.push('/auth/login')}>
                    Sign In
                </span>
            </p>
        </>
    );
}