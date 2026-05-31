"use client";

interface NPSInputProps {
    value: number | null;
    onChange: (val: number) => void;
}

const labels: Record<number, string> = {
    1: "Not at all", 2: "", 3: "", 4: "", 5: "Neutral",
    6: "", 7: "", 8: "", 9: "", 10: "Definitely",
};

export function NPSInput({ value, onChange }: NPSInputProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-1.5 flex-wrap">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                    const isSelected = value === n;
                    const color =
                        n <= 3 ? "hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 data-[sel=true]:border-rose-500 data-[sel=true]:bg-rose-50 dark:data-[sel=true]:bg-rose-500/10 data-[sel=true]:text-rose-600 dark:data-[sel=true]:text-rose-400"
                        : n <= 7 ? "hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 data-[sel=true]:border-amber-500 data-[sel=true]:bg-amber-50 dark:data-[sel=true]:bg-amber-500/10 data-[sel=true]:text-amber-600 dark:data-[sel=true]:text-amber-400"
                        : "hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 data-[sel=true]:border-emerald-500 data-[sel=true]:bg-emerald-50 dark:data-[sel=true]:bg-emerald-500/10 data-[sel=true]:text-emerald-600 dark:data-[sel=true]:text-emerald-400";

                    return (
                        <button
                            key={n}
                            type="button"
                            data-sel={isSelected}
                            onClick={() => onChange(n)}
                            className={`w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-sm font-black text-gray-500 dark:text-gray-400 transition-all duration-150 ${color} ${isSelected ? "scale-110 shadow-md" : ""}`}
                        >
                            {n}
                        </button>
                    );
                })}
            </div>
            <div className="flex justify-between text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">
                <span>Not likely</span>
                <span>Very likely</span>
            </div>
        </div>
    );
}
