import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

/* ─── Section header with icon + black divider ─── */
export const DetailCardSection = ({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) => (
  <div>
    <div className="px-6 pt-5 pb-2 flex items-center gap-2">
      <Icon className="h-4 w-4 text-gray-500" />
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
        {label}
      </h3>
    </div>
    <div className="border-t border-gray-900 mx-6" />
    <div className="px-6 py-4 space-y-4">{children}</div>
  </div>
);

/* ─── Single info row: icon + label + value + optional sub ─── */
export const DetailCardRow = ({
  icon: Icon,
  iconClassName = "text-gray-400",
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  value: string;
  sub?: string;
}) => (
  <div className="flex items-start gap-3">
    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconClassName}`} />
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ─── Timestamp row (label left, value right) ─── */
export const DetailCardTimestamp = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3">
    <Icon className="h-4 w-4 text-gray-400 shrink-0" />
    <div className="flex justify-between w-full">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xs font-semibold text-gray-700">{value}</p>
    </div>
  </div>
);

/* ─── Card shell: blue banner + children ─── */
export interface DetailCardBanner {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
}

export const DetailCard = ({
  banner,
  children,
}: {
  banner: DetailCardBanner;
  children: ReactNode;
}) => {
  const BannerIcon = banner.icon;
  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100 h-full">
      {/* Blue banner */}
      <div className="bg-blue-600 px-6 py-8 text-white">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-4 bg-white/20 rounded-full">
            <BannerIcon className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight">{banner.title}</h2>
            {banner.subtitle && (
              <p className="text-blue-100 text-sm mt-1">{banner.subtitle}</p>
            )}
          </div>
          {banner.badge}
        </div>
      </div>
      {children}
    </div>
  );
};
