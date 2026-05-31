import { ProtectedRoute } from '@/features/permissions/components/ProtectedRoute';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';

export default function AppDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                {children}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
