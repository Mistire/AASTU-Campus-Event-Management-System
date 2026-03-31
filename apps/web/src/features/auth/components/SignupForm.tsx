"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from 'next/link';
import api from '@/lib/axios';

export function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultRole = searchParams?.get('role') || 'STUDENT';

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        roleName: defaultRole
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("/auth/signup", formData);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Something went wrong during signup");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-md w-full p-8 rounded-2xl bg-white shadow-xl text-center border border-gray-100">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                <p className="text-gray-600 mb-6">
                    A verification email has been sent to <strong>{formData.email}</strong>.
                    Please check your inbox to verify your account before logging in.
                </p>
                <Link href="/login" className="inline-block w-full text-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-black hover:bg-gray-800 transition-colors">
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-md w-full mx-auto p-8 rounded-3xl bg-white shadow-2xl border border-gray-50">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create Account</h2>
                <p className="text-sm text-gray-500">Join the AASTU Event Management Platform</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 relative border-l-4 border-red-500 rounded-r-lg">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Signup Failed</h3>
                            <div className="mt-1 text-sm text-red-700">{error}</div>
                        </div>
                    </div>
                </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        required
                        className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                    <input
                        type="email"
                        required
                        className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        placeholder="john@aastu.edu.et"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                {/* Role selection logic: If STUDENT role is pre-selected, hide it. If ADMIN/Special, show options */}
                {(formData.roleName === 'STUDENT' || !formData.roleName) ? (
                    <input type="hidden" name="roleName" value="STUDENT" />
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            className="appearance-none relative block w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                            value={formData.roleName}
                            onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                        >
                            <option value="ORGANIZER">Organizer</option>
                            <option value="STAFF">Staff</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        required
                        className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-black hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed mt-8"
                >
                    {loading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        "Create Account"
                    )}
                </button>

                <div className="text-center mt-4">
                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-black hover:underline">
                            Log in here
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}
