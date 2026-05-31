"use client";

import { useRecommendationManagement } from "../api/useRecommendationManagement";
import { 
  CemsCard, 
  CemsCardHeader, 
  CemsCardContent 
} from "@/components/cems/CemsCard";
import { CemsBadge } from "@/components/cems/CemsBadge";
import { 
  Brain, 
  RefreshCw, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Database,
  History
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CemsButton } from "@/components/cems/CemsButton";

export function RecommendationStatusCard() {
  const { health, isLoadingHealth, isRetraining, triggerRetrain } = useRecommendationManagement();

  const handleSync = async () => {
    try {
      const res = await triggerRetrain();
      toast.success("Discovery Engine Synced", {
        description: `Successfully indexed ${res.events_count} events and ${res.users_count} users.`,
      });
    } catch (err: any) {
      toast.error("Sync Failed", {
        description: err.message || "An error occurred while retraining the model.",
      });
    }
  };

  const isHealthy = health?.status === "healthy" && health?.models_loaded;
  const lastTrained = health?.last_trained ? new Date(health.last_trained) : null;

  return (
    <CemsCard className="overflow-hidden border-brand/5 shadow-xl shadow-brand/5 bg-gradient-to-br from-white dark:from-gray-900 to-brand/2 dark:to-brand/5">
      <CemsCardHeader
        icon={<Brain className="text-brand animate-pulse-slow" />}
        title="Discovery Engine"
        description="Hybrid Recommendation Model Status"
        bordered
        action={
          <CemsBadge 
            status={isHealthy ? "success" : health?.status === "healthy" ? "warning" : "danger"} 
            dot
            className="uppercase tracking-tighter text-[9px]"
          >
            {isHealthy ? "Operational" : !health?.models_loaded ? "Models Missing" : "Degraded"}
          </CemsBadge>
        }
      />
      <CemsCardContent className="pt-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Metrics */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-lg bg-brand/5 flex items-center justify-center border border-brand/10 transition-colors group-hover:bg-brand/10 shrink-0">
                <History className="w-5 h-5 text-brand/70" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] leading-none mb-1">
                  Last Model Sync
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {lastTrained ? formatDistanceToNow(lastTrained, { addSuffix: true }) : "Never"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center border transition-colors shrink-0",
                isHealthy ? "bg-green-50 border-green-100 group-hover:bg-green-100 dark:bg-black dark:border-black " : "bg-orange-50 border-orange-100 group-hover:bg-orange-100 dark:bg-black dark:border-black"
              )}>
                {isHealthy ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-orange-600" />}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] leading-none mb-1">
                  Model Integrity
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {isHealthy ? "Hybrid Weights Loaded" : "Partial State (Cold Start Only)"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Center */}
          <div className="flex flex-col justify-center items-center md:items-end gap-3">
             <div className="text-center md:text-right hidden sm:block">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-[200px]">
                  Triggers database scan & retraining of vectors. Use after bulk data imports.
                </p>
             </div>
             
             <CemsButton
                variant="default"
                disabled={isRetraining || isLoadingHealth}
                onClick={handleSync}
                className={cn(
                  "relative h-11 px-8 rounded-lg font-black text-[11px] uppercase tracking-widest transition-all",
                  "bg-brand hover:bg-brand-dark shadow-lg shadow-brand/20 active:scale-95 disabled:grayscale-[0.5]",
                  isRetraining && "pl-12"
                )}
             >
                <AnimatePresence>
                  {isRetraining && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="absolute left-4"
                    >
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {isRetraining ? "Reprocessing..." : "Sync Discovery Engine"}
             </CemsButton>

             {!isHealthy && !isLoadingHealth && (
               <p className="text-[10px] font-bold text-orange-600 flex items-center gap-1.5 animate-pulse">
                 <Database size={10} />
                 Action Required: System out of date
               </p>
             )}
          </div>
        </div>
      </CemsCardContent>
    </CemsCard>
  );
}
