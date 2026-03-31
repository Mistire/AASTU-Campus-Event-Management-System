'use client';

import { X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    description?: string;
    className?: string;
}

export function Modal({ isOpen, onClose, title, children, description, className }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className={cn(
                    "relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300",
                    className
                )}
            >
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex items-start justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
                        {description && <p className="text-sm text-gray-500 font-medium">{description}</p>}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="px-8 pb-8 max-h-[80vh] overflow-y-auto scrollbar-hide">
                    {children}
                </div>
            </div>
        </div>
    );
}
