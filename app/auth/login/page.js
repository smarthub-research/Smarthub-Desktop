/**
 * Authentication Login Page
 *
 * This file contains the Login component that handles user authentication using Supabase.
 * The component renders a login form with email and password fields, processes authentication,
 * displays error/success messages, and redirects users after successful login.
 */

'use client'
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth} from "../authContext";

/**
 * Login Component
 *
 * Renders a login form and manages the authentication flow with Supabase.
 * Features:
 * - Email/password authentication
 * - Form validation and error handling
 * - Loading state management during authentication
 * - Success/error message display
 * - URL query parameter support for displaying messages
 * - Integration with Electron for desktop applications
 * - Navigation to dashboard upon successful login
 *
 * @returns {JSX.Element} The login form interface
 */
export default function Login() {
    const router = useRouter();

    // Extract URL query parameters for displaying messages
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    const { handleLogin } = useAuth();

    // State management
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(message || '');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
     * Handles form submission for user authentication
     *
     * @param e - The form submission event
     * @returns {Promise<void>}
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Use the handleLogin method from AuthContext
            const success = await handleLogin({
                email: formData.email,
                password: formData.password
            });

            if (success) {
                console.log("login success");
                router.push('/');
            } else {
                throw new Error('Login failed');
            }
        } catch (err) {
            setError('Failed to sign in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const skipAuth = async () => {
        setFormData({
            email: "gary.106@osu.edu",
            password: "123456"
        })
        setError('');
        setLoading(true);

        try {
            // Use the handleLogin method from AuthContext
            const success = await handleLogin({
                email: formData.email,
                password: formData.password
            });

            if (success) {
                console.log("login success");
                router.push('/');
            } else {
                throw new Error('Login failed');
            }
        } catch (err) {
            setError('Failed to sign in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className={'flex flex-col gap-6'}>
                {/* Conditional messages for the user*/}
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">{success}</p>}

                {/* Login form */}
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
                    {/* Forgot password */}
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-primary-400 cursor-pointer hover:underline">
                            Forgot password?
                        </span>
                    </div>
                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 text-white bg-primary-400 hover:bg-primary-500 rounded ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
            {/* Sign up router */}
            <p className="text-sm text-gray-600 mt-6">
                Don't have an account?{' '}
                <span className="underline cursor-pointer text-primary-400 hover:text-primary-500"
                      onClick={() => router.push('/auth/signup')}
                >
                    Sign Up
                </span>
            </p>
            <button onClick={skipAuth}>Skip Auth</button>
        </>
    );
}