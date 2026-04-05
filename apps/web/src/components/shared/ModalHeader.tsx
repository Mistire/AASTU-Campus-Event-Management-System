import { DialogTitle, DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ModalHeaderProps {
  title: string;
}

export function ModalHeader({ title }: ModalHeaderProps) {
  return (
    <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white rounded-t-xl shrink-0">
      <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
      <DialogClose className="p-1 hover:bg-black/10 rounded-full transition-colors text-white/90 hover:text-white">
        <X className="h-5 w-5" />
      </DialogClose>
    </div>
  );
}
