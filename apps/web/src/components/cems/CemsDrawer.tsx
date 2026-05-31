"use client"

import * as React from "react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

interface CemsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
  side?: "bottom" | "right"
}

export function CemsDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  contentClassName,
  side = "bottom",
}: CemsDrawerProps) {
  const isRight = side === "right"

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={side}>
      <DrawerContent className={cn(
        "z-50 bg-background flex flex-col",
        isRight 
          ? "fixed !inset-x-auto right-0 top-0 bottom-0 mt-0 h-full w-full max-w-md rounded-none border-l shadow-2xl !left-auto" 
          : "max-h-[96vh]",
        className
      )}>
        {!isRight && <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted flex-shrink-0" />}
        <div className={cn(
          "flex-1 overflow-y-auto w-full",
          !isRight && "mx-auto max-w-4xl pb-8",
          contentClassName
        )}>
          {(title || description) && (
            <DrawerHeader className="text-left px-8 pt-8">
              {title && (
                <DrawerTitle className="text-3xl font-black tracking-tight text-gray-900 uppercase">
                  {title}
                </DrawerTitle>
              )}
              {description && (
                <DrawerDescription className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                  {description}
                </DrawerDescription>
              )}
            </DrawerHeader>
          )}
          <div className={cn("px-8", !isRight && "mt-4")}>
            {children}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
