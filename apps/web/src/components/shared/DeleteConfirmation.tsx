import { useState } from "react";
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { ModalHeader } from "./ModalHeader";
import { ButtonController } from "./ButtonController";
import { DialogClose } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { InputController } from "./InputController";

interface DeleteConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  itemName: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmation({
  open,
  onOpenChange,
  title = "Confirm deletion",
  itemName,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmationProps) {
  const [confirmText, setConfirmText] = useState("");
  const isMatch = confirmText === itemName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/40 backdrop-blur-sm z-50" />
        <DialogContent 
          showCloseButton={false} 
          className="p-0 border-none rounded-xl gap-0 overflow-hidden shadow-2xl bg-white max-w-md sm:max-w-md w-full z-50"
        >
          {/* Custom Header (Magenta/Red flavor commonly used for destructive actions, but user requested standard blue if it matches others, wait, the screenshot showed magenta for the delete modal Header but user said "header color which is the standard blue" "use the standard blue". So let's use ModalHeader which is blue.) */}
          <ModalHeader title={title} />
          
          <div className="p-6 space-y-4">
            <p className="text-gray-700 font-medium">Are you sure you want to delete this Event?</p>
            
            <p className="font-bold text-gray-900">{itemName}</p>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Type "{itemName}" to confirm the delete operation:
              </p>
              <InputController 
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder=""
                className="w-full"
              />
            </div>
            
            <div className="flex items-center gap-2 text-red-500 text-sm font-medium pt-2">
              <AlertCircle className="h-4 w-4" />
              <p>This action is irreversible. Please make sure you are deleting permanently.</p>
            </div>
          </div>

          <div className="px-6 py-4 flex items-center justify-end gap-3 bg-gray-50 border-t border-gray-100 shrink-0 rounded-b-xl">
             <DialogClose render={
               <ButtonController
                 variant="outline"
                 disabled={isDeleting}
                 className="px-6 border-gray-200 text-gray-600 rounded-md bg-white hover:bg-gray-100"
               >
                 Cancel
               </ButtonController>
            } />
            <ButtonController
              className="bg-[#b0125a] hover:bg-[#900e4a] text-white px-6 rounded-md shadow-sm"
              onClick={onConfirm}
              disabled={!isMatch || isDeleting}
              loading={isDeleting}
            >
              Delete
            </ButtonController>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
