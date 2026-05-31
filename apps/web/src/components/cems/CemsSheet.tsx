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
  footer?: React.ReactNode
  className?: string
  scrollable?: boolean
}

export function CemsSheet({
  open,
  onOpenChange,
  children,
  footer,
  className,
  scrollable = true,
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
            "fixed inset-y-0 right-0 z-50 h-screen w-full max-w-lg bg-background shadow-2xl outline-none duration-300 transition-transform data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right",
            className
          )}
        >
          <div className="relative h-full flex flex-col">
            <DialogPrimitive.Close
              render={<Button variant="ghost" className="absolute top-4 right-4 z-50 text-gray-400 hover:text-brand" size="icon" />}
            >
              <XIcon className="w-5 h-5" />
            </DialogPrimitive.Close>
            <div className={cn("flex-1 flex flex-col scrollbar-hide min-h-0", scrollable && "overflow-y-auto")}>
              {children}
            </div>
            {footer && (
              <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                {footer}
              </div>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
