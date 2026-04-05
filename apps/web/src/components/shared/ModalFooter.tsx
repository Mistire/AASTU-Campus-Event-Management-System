import { ButtonController } from "../controllers/ButtonController";
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
    <div className="px-6 py-4 flex items-center justify-end gap-3 bg-gray-50 border-t border-gray-100 rounded-b-xl mt-auto shrink-0">
      {onCancel ? (
        <ButtonController
          variant="default"
          onClick={onCancel}
          disabled={isSubmitting}
          className="bg-red-500 hover:bg-red-600 text-white rounded-md px-6 shadow-sm"
        >
          {cancelText}
        </ButtonController>
      ) : (
        <DialogClose render={
          <ButtonController
            variant="default"
            disabled={isSubmitting}
            className="bg-red-500 hover:bg-red-600 text-white rounded-md px-6 shadow-sm"
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
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 shadow-sm"
      >
        {saveText}
      </ButtonController>
    </div>
  );
}
