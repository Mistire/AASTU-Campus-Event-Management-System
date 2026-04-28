"use client";

import { Layers, Plus, Trash2 } from 'lucide-react';
import { CemsTable } from '@/components/cems/CemsTable';
import { CemsButton } from '@/components/cems/CemsButton';
import { useEventTypes, useCreateEventType, useDeleteEventType } from '@/features/event-types/api';
import { getEventTypesColumns } from '@/features/event-types/components/EventTypesTableConfig';
import { useState } from 'react';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { InputController } from '@/components/shared/InputController';
import { ToastController } from '@/components/shared/ToastController';
import { DeleteConfirmation } from '@/components/shared/DeleteConfirmation';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { EventTypeRecord } from '@/features/event-types/types';

export default function EventTypesPage() {
    const { data: eventTypes, isLoading } = useEventTypes();
    const createMutation = useCreateEventType();
    const deleteMutation = useDeleteEventType();
    
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState<EventTypeRecord | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const handleCreate = async () => {
        try {
            await createMutation.mutateAsync(formData);
            setIsCreateOpen(false);
            setFormData({ name: '', description: '' });
            ToastController.success({ message: 'Event type created successfully' });
        } catch (err) {
            ToastController.error({ message: err instanceof Error ? err.message : 'Failed to create event type' });
        }
    };

    const handleDelete = async () => {
        if (!deleteItem) return;
        try {
            await deleteMutation.mutateAsync(deleteItem.id);
            setDeleteItem(null);
            ToastController.success({ message: 'Event type deleted successfully' });
        } catch (err) {
            ToastController.error({ message: err instanceof Error ? err.message : 'Failed to delete event type' });
        }
    };

    const columns = getEventTypesColumns();
    
    const actionColumn = {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }: { row: { original: EventTypeRecord } }) => (
            <CemsButton
                cemsVariant="brand-ghost"
                size="icon"
                onClick={() => setDeleteItem(row.original)}
                className="text-gray-400 hover:text-red-500"
            >
                <Trash2 className="w-4 h-4" />
            </CemsButton>
        ),
        size: 80,
    };

    const allColumns = [...columns, actionColumn];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-brand/5 flex items-center justify-center text-brand border border-brand/10 shadow-sm shrink-0">
                        <Layers className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900">Event Types</h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-brand" />
                             Define different formats for campus events.
                        </p>
                    </div>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger render={
                        <CemsButton cemsVariant="brand" className="rounded-xl shadow-lg shadow-brand/20 h-12 px-6 font-black uppercase tracking-widest text-[11px]">
                            <Plus className="w-4 h-4 mr-2" />
                            New Event Type
                        </CemsButton>
                    } />
                    <DialogContent showCloseButton={false} className="p-0 border-none bg-transparent shadow-none max-w-md">
                        <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                            <ModalHeader 
                                title="New Event Type" 
                            />
                            <div className="p-8 space-y-6">
                                <InputController
                                    label="Type Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Workshop"
                                />
                                <InputController
                                    label="Description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of this format..."
                                />
                            </div>
                            <ModalFooter 
                                onCancel={() => setIsCreateOpen(false)}
                                onSave={handleCreate}
                                saveText="Create Type"
                                isSubmitting={createMutation.isPending}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-xl overflow-hidden transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100/50">
                <CemsTable
                    data={eventTypes || []}
                    columns={allColumns}
                    loading={isLoading}
                    emptyMessage="No event types found."
                    enableSorting
                    enableGlobalFilter
                    enableColumnVisibility
                />
            </div>

            <DeleteConfirmation
                open={!!deleteItem}
                onOpenChange={(open) => !open && setDeleteItem(null)}
                onConfirm={handleDelete}
                itemName={deleteItem?.name || ""}
                title="Delete Event Type"
                isDeleting={deleteMutation.isPending}
            />
        </div>
    );
}
