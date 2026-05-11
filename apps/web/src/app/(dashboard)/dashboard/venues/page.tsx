"use client";

import { useState } from "react";
import { MapPin, Plus, Loader2 } from 'lucide-react';
import { CemsTable } from '@/components/cems/CemsTable';
import { CemsButton } from '@/components/cems/CemsButton';
import { useVenues } from '@/features/venues/api';
import { getVenuesColumns } from '@/features/venues/components/VenuesTableConfig';
import { AddVenueModal } from '@/features/venues/components/AddVenueModal';
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function VenuesPage() {
    const columns = getVenuesColumns();
    const [minCapacity, setMinCapacity] = useState<string>("");
    const { data: venues, isLoading } = useVenues({
        minCapacity: minCapacity ? parseInt(minCapacity) : undefined
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-[500px] w-full rounded-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-lg bg-brand/5 flex items-center justify-center text-brand border border-brand/10 shadow-sm shrink-0">
                        <MapPin className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">Venues</h1>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-brand" />
                             Manage campus halls and outdoor spaces.
                        </p>
                    </div>
                </div>
                <CemsButton 
                    cemsVariant="brand" 
                    onClick={() => setIsAddModalOpen(true)}
                    className="rounded-lg shadow-lg shadow-brand/20 h-12 px-6 font-black uppercase tracking-widest text-[11px]"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Venue
                </CemsButton>
            </div>

            <div className="bg-white rounded-lg overflow-hidden transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100/50">
                <CemsTable
                    data={venues || []}
                    columns={columns}
                    emptyMessage="No venues found."
                    enableSorting
                    enableGlobalFilter
                    enableColumnVisibility
                    renderToolbarActions={() => (
                        <div className="flex items-center gap-2">
                            <Select value={minCapacity} onValueChange={(val) => setMinCapacity(val ?? "")}>
                                <SelectTrigger className="h-8 min-w-[150px] bg-gray-50/50 border-gray-100 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-white transition-all">
                                    <SelectValue placeholder="Min Capacity" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border-gray-100 shadow-2xl">
                                    <SelectItem value="">Any Capacity</SelectItem>
                                    <SelectItem value="50">50+ Seats</SelectItem>
                                    <SelectItem value="100">100+ Seats</SelectItem>
                                    <SelectItem value="200">200+ Seats</SelectItem>
                                    <SelectItem value="500">500+ Seats</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                />
            </div>

            <AddVenueModal 
                open={isAddModalOpen} 
                onOpenChange={setIsAddModalOpen} 
            />
        </div>
    );
}
