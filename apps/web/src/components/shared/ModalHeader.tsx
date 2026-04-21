import { DialogTitle, DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ModalHeaderProps {
  title: string;
}

export function ModalHeader({ title }: ModalHeaderProps) {
  return (
    <div className="bg-brand px-8 py-6 flex items-center justify-between text-white rounded-t-xl shrink-0 border-b border-white/10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-linear-to-r from-white/10 to-transparent pointer-events-none" />
      <DialogTitle className="text-xl font-black tracking-tighter relative z-10">{title}</DialogTitle>
      <DialogClose className="p-2 hover:bg-white/20 rounded-2xl border border-white/10 transition-all text-white/90 hover:text-white active:scale-90 relative z-10">
        <X className="h-5 w-5" />
      </DialogClose>
    </div>
  );
}
