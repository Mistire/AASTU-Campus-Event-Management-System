'use client';

import { useRoles } from '@/features/permissions/api/getRoles';
import mainPages from '@/data/main-pages.json';
import allPages from '@/data/all-pages.json';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function RolesList() {
    const { data: systemRoles, isLoading, error } = useRoles();

    if (isLoading) {
        return <div className="text-gray-500 text-sm">Loading backend roles...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-sm">Waiting for backend roles or authentication...</div>;
    }

    if (!systemRoles?.length) {
        return <div className="text-gray-500 text-sm">No roles found in the backend.</div>;
    }

    // Calculate permissions statically for each role based on the JSON
    const getPagesForRole = (roleName: string, pagesConfig: any[]) => {
        return pagesConfig
            .filter(p => (p.allowed || []).includes(roleName))
            .map(p => p.name || p.title || p.to);
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {systemRoles.map((role) => {
                const dashboardAccess = getPagesForRole(role.roleName, mainPages);
                const routeAccess = getPagesForRole(role.roleName, allPages);

                return (
                    <Card key={role.id} className="flex flex-col">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex justify-between items-center">
                                <span>{role.roleName}</span>
                                <Badge variant="secondary" className="text-xs">
                                    {routeAccess.length} Routes
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 text-sm text-gray-600 bg-gray-50/50 p-4 pt-4 m-2 rounded-md">
                            <p className="mb-4 text-xs italic text-gray-400 border-b pb-2">
                                {role.description || 'No description provided.'}
                            </p>

                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wider mb-2">Dashboard Menus:</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {dashboardAccess.length > 0 ? (
                                            dashboardAccess.map(menu => (
                                                <Badge key={menu} variant="outline" className="text-[10px] truncate">{menu}</Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400">None</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wider mb-2">API / App Routes:</h4>
                                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                                        {routeAccess.length > 0 ? (
                                            routeAccess.map(route => (
                                                <Badge key={route} variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                                    {route}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400">No route access</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
