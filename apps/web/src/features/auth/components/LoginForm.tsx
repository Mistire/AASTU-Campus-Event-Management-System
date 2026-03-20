'use client';

import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setAuth } = useAuthStore();
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Mocking an admin login
        setAuth('mock-token-123', 'mock-refresh-token', {
            id: 'usr_1',
            full_name: 'Admin User',
            email: email,
            phone: '123456789',
            role: 'ADMIN',
            roles: ['ADMIN'],
            user_roles: [{ role: { name: 'ADMIN' } }]
        });

        router.push('/dashboard');
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 border rounded-lg shadow-sm bg-white">
            <h2 className="text-2xl font-bold text-center mb-6">Hearts Platform</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email or Phone</Label>
                    <Input
                        id="email"
                        type="text"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" className="w-full">Sign In (Mock Admin)</Button>
            </form>
        </div>
    );
}
