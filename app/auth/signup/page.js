/**
 * Authentication Signup Page
 *
 * This file contains the Signup component that handles user authentication using Supabase.
 * This component renders a signup form with full name, email, and password fields, processes authentication,
 * displays error messages, and redirects user to login after successful signup
 */

'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Signup Component
 *
 * Renders a signup form and manages the authentication flow with Supabase
 *
 * @returns {JSX.Element} the signup form interface
 * @constructor
 */
export default function Signup() {
    const router = useRouter();

    // State management
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    /**
     * Changes formData variables on input change.
     *
     * @param e - the input change event
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /**
     * Handles form submission for user signup
     *
     * @param e - the form submit event
     * @returns {Promise<void>}
     */
    const handleSubmit = async (e) => {
        // Prevents default form submission behavior
        e.preventDefault();

        // Clears errors and sets loading state
        setError('');
        setLoading(true);

        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://0.0.0.0:8000/auth/signup", {
                method: 'POST',
                body: {
                    full_name: formData.name,
                    email: formData.email,
                    password: formData.password
                },
            })
            // Redirect to login page with success message
            router.push('/auth/login?message=Account created successfully! Please check your email to verify your account.');
        } catch (err) {
            // Displays error message if signup fails
            setError(err.message || 'Failed to create account. Please try again.');
            setLoading(false);
        }
    };

    return (
        <>
            <div className={'flex flex-col gap-8'}>
                {/* Error message */}
                {error && <p className="text-red-500 mb-4">{error}</p>}

                {/* Signup form */}
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    {/* Full name input */}
                    <input
                        name="name"
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="p-2 border rounded"
                        required
                    />
                    {/* Email input */}
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="p-2 border rounded"
                        required
                    />
                    {/* Password input */}
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="p-2 border rounded"
                        required
                    />
                    {/* Password confirmation */}
                    <input
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="p-2 border rounded"
                        required
                    />
                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-white bg-primary-400 hover:bg-primary-500 rounded"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
            </div>
            {/* Login router */}
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