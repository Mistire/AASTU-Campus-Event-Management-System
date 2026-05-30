import { useState } from "react";
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { ModalHeader } from "@/components/shared/ModalHeader";
import { CemsButton } from "@/components/cems/CemsButton";
import { DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFeedbackTemplates } from "@/features/feedback/api";
import { Archive, ClipboardList } from "lucide-react";

interface ArchiveConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  itemName: string;
  onConfirm: (templateId: string) => void;
  isArchiving?: boolean;
}

export function ArchiveConfirmation({
  open,
  onOpenChange,
  title = "Confirm Archiving",
  itemName,
  onConfirm,
  isArchiving = false,
}: ArchiveConfirmationProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState("default");
  const { data: templates = [] } = useFeedbackTemplates();

  const selectedLabel = selectedTemplateId === "default"
    ? "Default Feedback Form"
    : templates.find((t) => t.id === selectedTemplateId)?.name || "Select Feedback Template";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/40 z-50" />
        <DialogContent 
          showCloseButton={false} 
          className="p-0 border-none rounded-lg gap-0 overflow-hidden shadow-2xl bg-white dark:bg-gray-900 max-w-md sm:max-w-md w-full z-50 animate-in zoom-in-95 duration-300"
        >
          <ModalHeader title={title} />
          
          <div className="p-10 space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Status Action</p>
              <h2 className="text-xl font-black text-gray-900 dark:text-white text-center tracking-tight px-4">
                Confirm archiving of <span className="text-brand underline decoration-2 underline-offset-4">{itemName}</span>?
              </h2>
            </div>
            
            <div className="bg-brand/5 dark:bg-brand/10 rounded-lg p-8 border border-brand/10 dark:border-brand/20 flex flex-col items-center text-center gap-4 group">
              <div className="w-14 h-14 rounded-lg bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-brand shadow-sm group-hover:scale-110 transition-transform">
                <Archive size={28} />
              </div>
              <p className="text-xs font-bold text-brand leading-relaxed uppercase tracking-wider">
                This will close event registration and manually trigger feedback request emails to all registered attendees.
              </p>
            </div>

            <div className="space-y-3 px-2">
              <div className="flex items-center gap-2">
                <ClipboardList size={12} className="text-brand/50" />
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
                  Feedback Template
                </label>
              </div>
              <Select value={selectedTemplateId} onValueChange={(val) => setSelectedTemplateId(val || "default")}>
                <SelectTrigger className="h-12 bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-lg text-sm font-semibold focus:bg-white dark:focus:bg-gray-800 transition-all w-full">
                  <SelectValue placeholder="Select Feedback Template">
                    {selectedLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-lg border-gray-100 dark:border-gray-800 shadow-2xl p-1 bg-white dark:bg-gray-900 z-50">
                  <SelectItem value="default" className="rounded-lg font-bold text-xs py-2.5 focus:bg-brand/5 dark:focus:bg-brand/10 focus:text-brand transition-colors">
                    Default Feedback Form
                  </SelectItem>
                  {templates.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id} className="rounded-lg font-bold text-xs py-2.5 focus:bg-brand/5 dark:focus:bg-brand/10 focus:text-brand transition-colors">
                      {tpl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="px-10 py-8 flex items-center justify-end gap-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 shrink-0 rounded-b-lg mt-auto">
             <DialogClose render={
                 <CemsButton
                   variant="outline"
                   disabled={isArchiving}
                   className="rounded-lg font-bold text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all text-xs uppercase tracking-widest px-8 h-12 dark:bg-gray-900"
                 >
                   Go Back
                 </CemsButton>
             } />
            <CemsButton
              className="rounded-lg bg-brand hover:bg-brand/90 text-white font-black text-xs uppercase tracking-widest px-10 shadow-xl shadow-brand/20 transition-all active:scale-95 h-12 group disabled:opacity-50"
              onClick={() => onConfirm(selectedTemplateId === "default" ? "" : selectedTemplateId)}
              disabled={isArchiving}
              loading={isArchiving}
            >
              Confirm Archive
            </CemsButton>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
