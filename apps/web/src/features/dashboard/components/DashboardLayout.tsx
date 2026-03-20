import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex bg-gray-50 min-h-screen">
            {/* Sidebar - hidden on mobile by default, could add mobile menu later */}
            <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="md:pl-64 flex flex-col flex-1">
                <Header />
                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
