import { ButtonController } from "@/components/shared/ButtonController";
import { DialogClose } from "@/components/ui/dialog";

interface ModalFooterProps {
  onSave?: () => void;
  onCancel?: () => void;
  saveText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
}

export function ModalFooter({
  onSave,
  onCancel,
  saveText = "Save",
  cancelText = "Cancel",
  isSubmitting = false,
}: ModalFooterProps) {
  return (
    <div className="px-6 py-5 flex items-center justify-end gap-3 bg-gray-50/50 border-t border-gray-100 rounded-b-[2rem] mt-auto shrink-0">
      {onCancel ? (
        <ButtonController
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-xl font-bold text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-all text-xs uppercase tracking-widest px-6 h-10"
        >
          {cancelText}
        </ButtonController>
      ) : (
        <DialogClose render={
          <ButtonController
            variant="outline"
            disabled={isSubmitting}
            className="rounded-xl font-bold text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-all text-xs uppercase tracking-widest px-6 h-10"
          >
            {cancelText}
          </ButtonController>
        } />
      )}
      <ButtonController
        variant="default"
        onClick={onSave}
        loading={isSubmitting}
        disabled={isSubmitting}
        className="rounded-xl bg-brand hover:bg-brand-hover text-white font-black text-xs uppercase tracking-widest px-8 shadow-lg shadow-brand/20 transition-all active:scale-95 h-10"
      >
        {saveText}
      </ButtonController>
    </div>
  );
}
