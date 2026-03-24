'use client';

import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { setAuth } = useAuthStore();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', {
                email,
                password
            });

            const { access_token, refresh_token, user } = res.data;

            // Save to Zustand
            setAuth(access_token, refresh_token, {
                id: user.id,
                full_name: user.fullName,
                email: user.email,
                phone: user.phone || '',
                role: user.role,
                roles: [user.role],
                user_roles: [{ role: { name: user.role } }]
            });

            // Redirect based on role
            if (user.role === 'ADMIN' || user.role === 'ORGANIZER' || user.role === 'STAFF') {
                router.push('/dashboard');
            } else {
                router.push('/dashboard'); // Can be changed based on routing structure
            }

        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 rounded-3xl shadow-2xl bg-white border border-gray-50">
            <div className="flex flex-col items-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-6 shadow-xl">
                    <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
                <p className="text-gray-500 text-sm mt-2">Sign in to AASTU Event Management</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 relative border-l-4 border-red-500 rounded-r-lg">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
                            <div className="mt-1 text-sm text-red-700">{error}</div>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 ml-1">Email address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        placeholder="john@aastu.edu.et"
                        className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 ml-1">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        required
                    />
                </div>

                <div className="flex items-center justify-between text-sm px-1 py-1">
                    <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                        Remember me
                    </label>
                    <a href="#" className="font-semibold text-black hover:underline">Forgot password?</a>
                </div>

                <button
                    type="submit"
                    className="group relative w-full flex justify-center items-center h-12 border border-transparent text-sm font-bold rounded-xl text-white bg-black hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-md"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Authenticating...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-gray-500 text-sm">
                    Don't have an account? <a href="/signup" className="font-semibold text-black hover:underline">Sign up here</a>
                </p>
            </div>
        </div>
    );
}
