"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CemsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

export function CemsSheet({
  open,
  onOpenChange,
  children,
  className,
}: CemsSheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-50 bg-black/10 duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        />
        {/* Content */}
        <DialogPrimitive.Popup
          className={cn(
            "fixed inset-y-0 right-0 z-50 h-full w-full max-w-lg bg-background shadow-2xl outline-none duration-300 transition-transform data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right",
            className
          )}
        >
          <div className="relative h-full flex flex-col">
            <DialogPrimitive.Close
              render={<Button variant="ghost" className="absolute top-4 right-4 z-50 text-white hover:text-brand" size="icon" />}
            >
              <XIcon className="w-5 h-5" />
            </DialogPrimitive.Close>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {children}
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
