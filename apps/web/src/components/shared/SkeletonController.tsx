import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonControllerProps {
  className?: string;
  count?: number;
  containerClassName?: string;
}

export const SkeletonController = ({
  className,
  count = 1,
  containerClassName,
}: SkeletonControllerProps) => {
  if (count === 1) {
    return <Skeleton className={className} />;
  }
  return (
    <div className={cn("space-y-2", containerClassName)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  );
};
