"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingInputProps {
    value: number;
    onChange: (val: number) => void;
    max?: number;
    size?: number;
}

export function StarRatingInput({ value, onChange, max = 5, size = 36 }: StarRatingInputProps) {
    const [hovered, setHovered] = useState<number>(0);

    return (
        <div className="flex items-center gap-2">
            {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
                const isActive = star <= (hovered || value);
                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        className="transition-all duration-150 focus:outline-none"
                        aria-label={`Rate ${star} out of ${max}`}
                        style={{ width: size, height: size }}
                    >
                        <Star
                            size={size}
                            className={`transition-all duration-150 ${
                                isActive
                                    ? "text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]"
                                    : "text-gray-300 dark:text-gray-600"
                            }`}
                        />
                    </button>
                );
            })}
            {value > 0 && (
                <span className="ml-2 text-sm font-black text-amber-500 uppercase tracking-widest">
                    {value}/{max}
                </span>
            )}
        </div>
    );
}
