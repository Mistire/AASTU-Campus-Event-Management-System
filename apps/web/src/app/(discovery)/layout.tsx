import { DiscoveryLayout } from '@/features/discovery/components/DiscoveryLayout';

export default function DiscoveryRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DiscoveryLayout>
            {children}
        </DiscoveryLayout>
    );
}
