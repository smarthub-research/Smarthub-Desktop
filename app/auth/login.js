import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function Login() {
    const router = useRouter()
    const [error, setError] = useState('');
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
        router.push('/home')

        try {
            // Replace with your actual authentication logic
            console.log('Logging in with:', formData);
            // Example: await signIn(formData.email, formData.password);
        } catch (err) {
            setError('Failed to login. Please check your credentials.');
        }
    };

    return (
        <>
            {error && <p className="text-red-500 mb-4">{error}</p>}
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
                <button
                    type="submit"
                    className="px-4 py-2 text-white bg-primary-400 hover:bg-primary-500 rounded cursor-pointer"
                >
                    Login
                </button>
            </form>
            <Link href={'/home'}>Skip Auth</Link>
        </>
    )
}