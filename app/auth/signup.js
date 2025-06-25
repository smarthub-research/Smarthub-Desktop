import { useState } from "react";

export default function Signup() {
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [role, setRole] = useState('clinician')

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

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            // Replace with your actual signup logic
            console.log('Signing up with:', formData);
            // Example: await createAccount(formData);
        } catch (err) {
            setError('Failed to create account. Please try again.');
        }
    };

    return (
        <div className={'flex flex-col gap-8'}>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex flex-row justify-around bg-white drop-shadow-md rounded-xl overflow-hidden">
                <button
                    type="button"
                    onClick={() => setRole("clinician")}
                    className={`flex-1 py-3 px-4 transition ${
                        role === 'clinician'
                            ? 'bg-primary-400 text-white font-medium'
                            : 'hover:bg-gray-100'
                    }`}
                >
                    Clinician
                </button>
                <div className="w-px bg-gray-200"></div>
                <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex-1 py-3 px-4 transition ${
                        role === 'admin'
                            ? 'bg-primary-400 text-white font-medium'
                            : 'hover:bg-gray-100'
                    }`}
                >
                    Admin
                </button>
            </div>
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
                    className="px-4 py-2 text-white bg-primary-400 hover:bg-primary-500 rounded cursor-pointer"
                >
                    Create Account
                </button>
            </form>
        </div>
    );
}