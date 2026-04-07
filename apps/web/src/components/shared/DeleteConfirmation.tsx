import { useState } from "react";
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { ModalHeader } from "@/components/shared/ModalHeader";
import { ButtonController } from "@/components/shared/ButtonController";
import { DialogClose } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { InputController } from "@/components/shared/InputController";

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
          className="p-0 border-none rounded-[3rem] gap-0 overflow-hidden shadow-2xl bg-white max-w-md sm:max-w-md w-full z-50 animate-in zoom-in-95 duration-300"
        >
          <ModalHeader title={title} />
          
          <div className="p-10 space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest text-center">Destructive Action</p>
              <h2 className="text-xl font-black text-gray-900 text-center tracking-tight px-4">
                Confirm deletion of <span className="text-red-500 underline decoration-2 underline-offset-4">{itemName}</span>?
              </h2>
            </div>
            
            <div className="bg-red-50/50 rounded-[2rem] p-8 border border-red-100 flex flex-col items-center text-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-500 shadow-sm group-hover:scale-110 transition-transform">
                <AlertCircle size={28} />
              </div>
              <p className="text-xs font-bold text-red-700 leading-relaxed uppercase tracking-wider">
                This action is irreversible. All associated data will be permanently removed from our systems.
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 block text-center">
                Type &quot;<span className="text-gray-900">{itemName}</span>&quot; to confirm
              </label>
              <InputController 
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type here..."
                className="w-full h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-center font-black tracking-widest uppercase text-xs"
              />
            </div>
          </div>

          <div className="px-10 py-8 flex items-center justify-end gap-4 bg-gray-50/50 border-t border-gray-100 shrink-0 rounded-b-[3rem] mt-auto">
             <DialogClose render={
               <ButtonController
                 variant="outline"
                 disabled={isDeleting}
                 className="rounded-2xl font-bold text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-all text-xs uppercase tracking-widest px-8 h-12"
               >
                 Go Back
               </ButtonController>
            } />
            <ButtonController
              className="rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest px-10 shadow-xl shadow-red-200 transition-all active:scale-95 h-12 group disabled:opacity-50"
              onClick={onConfirm}
              disabled={!isMatch || isDeleting}
              loading={isDeleting}
            >
              Confirm Delete
            </ButtonController>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
