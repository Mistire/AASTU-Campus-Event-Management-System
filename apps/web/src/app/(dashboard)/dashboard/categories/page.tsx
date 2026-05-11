"use client";

import { Tag, Plus, Trash2 } from "lucide-react";
import { CemsTable } from "@/components/cems/CemsTable";
import { CemsButton } from "@/components/cems/CemsButton";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "@/features/categories/api";
import { getCategoriesColumns } from "@/features/categories/components/CategoriesTableConfig";
import { useState } from "react";
import { ModalHeader } from "@/components/shared/ModalHeader";
import { ModalFooter } from "@/components/shared/ModalFooter";
import { InputController } from "@/components/shared/InputController";
import { ToastController } from "@/components/shared/ToastController";
import { DeleteConfirmation } from "@/components/shared/DeleteConfirmation";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CategoryRecord } from "@/features/categories/types";

export default function CategoriesPage() {
  const { data: apiCategories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<CategoryRecord | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const categories: CategoryRecord[] = (apiCategories || []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description || "",
    eventCount: cat._count?.eventCategories || 0,
  }));

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateOpen(false);
      setFormData({ name: "", description: "" });
      ToastController.success({ message: "Category created successfully" });
    } catch (err) {
      ToastController.error({
        message:
          err instanceof Error ? err.message : "Failed to create category",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteMutation.mutateAsync(deleteItem.id);
      setDeleteItem(null);
      ToastController.success({ message: "Category deleted successfully" });
    } catch (err) {
      ToastController.error({
        message:
          err instanceof Error ? err.message : "Failed to delete category",
      });
    }
  };

  const columns = getCategoriesColumns();

  const actionColumn = {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }: { row: { original: CategoryRecord } }) => (
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-lg bg-brand/5 dark:bg-brand/10 flex items-center justify-center text-brand border border-brand/10 dark:border-brand/20 shadow-sm shrink-0">
            <Tag className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Categories
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand" />
              Organize and classify campus events.
            </p>
          </div>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger
            render={
              <CemsButton
                cemsVariant="brand"
                className="rounded-lg shadow-lg shadow-brand/20 h-12 px-6 font-black uppercase tracking-widest text-[11px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Category
              </CemsButton>
            }
          />
          <DialogContent
            showCloseButton={false}
            className="p-0 border-none bg-transparent shadow-none max-w-md"
          >
            <div className="bg-white dark:bg-gray-950 rounded-lg overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
              <ModalHeader title="New Category" />
              <div className="p-8 space-y-6">
                <InputController
                  label="Category Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Technology"
                />
                <InputController
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this category..."
                />
              </div>
              <ModalFooter
                onCancel={() => setIsCreateOpen(false)}
                onSave={handleCreate}
                saveText="Create Category"
                isSubmitting={createMutation.isPending}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-none border border-gray-100/50 dark:border-gray-800">
        <CemsTable
          data={categories || []}
          columns={allColumns}
          loading={isLoading}
          emptyMessage="No categories found."
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
        title="Delete Category"
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
