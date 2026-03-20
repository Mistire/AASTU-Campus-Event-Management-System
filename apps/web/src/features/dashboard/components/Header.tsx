import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
    const { profile } = useAuthStore();

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center">
                {/* Mobile menu button could go here */}
            </div>

            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                    <Bell className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {profile?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden md:block text-sm">
                        <p className="font-medium text-gray-700 leading-tight">{profile?.full_name || 'User'}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{profile?.role?.replace('_', ' ') || 'Guest'}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
