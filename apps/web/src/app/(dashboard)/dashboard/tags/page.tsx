"use client";

import { Hash, Plus, Trash2, Loader2, Tag as TagIcon } from 'lucide-react';
import { TableController } from '@/components/shared/TableController';
import { Button } from '@/components/ui/button';
import { useTags, useCreateTag, useDeleteTag, Tag } from '@/features/tags/api';
import { getTagsColumns } from '@/features/tags/components/TagsTableConfig';
import { useState } from 'react';
import { ModalHeader } from '@/components/shared/ModalHeader';
import { ModalFooter } from '@/components/shared/ModalFooter';
import { InputController } from '@/components/shared/InputController';
import { ToastController } from '@/components/shared/ToastController';
import { DeleteConfirmation } from '@/components/shared/DeleteConfirmation';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export default function TagsPage() {
    const { data: tags, isLoading } = useTags();
    const createMutation = useCreateTag();
    const deleteMutation = useDeleteTag();
    
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState<Tag | null>(null);
    const [tagName, setTagName] = useState('');

    const handleCreate = async () => {
        try {
            await createMutation.mutateAsync({ name: tagName });
            setIsCreateOpen(false);
            setTagName('');
            ToastController.success({ message: 'Tag created successfully' });
        } catch (err) {
            ToastController.error({ message: err instanceof Error ? err.message : 'Failed to create tag' });
        }
    };

    const handleDelete = async () => {
        if (!deleteItem) return;
        try {
            await deleteMutation.mutateAsync(deleteItem.id);
            setDeleteItem(null);
            ToastController.success({ message: 'Tag deleted successfully' });
        } catch (err) {
            ToastController.error({ message: err instanceof Error ? err.message : 'Failed to delete tag' });
        }
    };

    const columns = getTagsColumns();
    
    const actionColumn = {
        id: "actions",
        header: "Actions",
        cell: ({ row }: { row: { original: Tag } }) => (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteItem(row.original)}
                className="text-gray-400 hover:text-red-500 transition-colors"
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        ),
        size: 80,
    };

    const allColumns = [...columns, actionColumn];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-brand/5 flex items-center justify-center text-brand border border-brand/10 shadow-sm shrink-0">
                        <Hash className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900">Metadata Tags</h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-brand" />
                             Manage keywords for event discovery.
                        </p>
                    </div>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger render={
                        <Button className="rounded-xl bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20 h-12 px-6 font-black uppercase tracking-widest text-[11px]">
                            <Plus className="w-4 h-4 mr-2" />
                            New Tag
                        </Button>
                    } />
                    <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-md">
                        <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl">
                            <ModalHeader 
                                title="New Tag" 
                            />
                            <div className="p-8 space-y-6">
                                <InputController
                                    label="Tag Name"
                                    value={tagName}
                                    onChange={(e) => setTagName(e.target.value)}
                                    placeholder="e.g. Workshop (system adds # automatically)"
                                />
                                <div className="p-4 bg-brand/5 rounded-2xl border border-brand/10">
                                    <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <TagIcon size={12} />
                                        Tag Preview
                                    </p>
                                    <p className="text-sm font-black text-gray-900 lowercase italic">
                                        #{tagName.replace(/^#/, '') || 'tagname'}
                                    </p>
                                </div>
                            </div>
                            <ModalFooter 
                                onCancel={() => setIsCreateOpen(false)}
                                onSave={handleCreate}
                                saveText="Create Tag"
                                isSubmitting={createMutation.isPending}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl overflow-hidden transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100/50">
                <div className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="w-10 h-10 text-brand animate-spin" />
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Fetching Tags...</p>
                        </div>
                    ) : (
                        <TableController
                            data={tags || []}
                            columns={allColumns}
                            emptyMessage="No tags found."
                        />
                    )}
                </div>
            </div>

            <DeleteConfirmation
                open={!!deleteItem}
                onOpenChange={(open) => !open && setDeleteItem(null)}
                onConfirm={handleDelete}
                itemName={deleteItem?.name || ""}
                title="Delete Tag"
                isDeleting={deleteMutation.isPending}
            />
        </div>
    );
}
