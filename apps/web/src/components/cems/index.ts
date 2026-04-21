/**
 * CEMS Design System — Barrel Export
 *
 * Usage: import { CemsCard, CemsTable, CemsBadge } from "@/components/cems";
 */

// Theme
export { cemsColors, chartColorsFallback } from "./theme";
export type { CemsStatusVariant } from "./theme";

// Card
export {
  CemsCard,
  CemsCardHeader,
  CemsCardContent,
  CemsCardFooter,
} from "./CemsCard";

// Metric Card
export { CemsMetricCard } from "./CemsMetricCard";

// Table
export { CemsTable } from "./CemsTable";

// Button
export { CemsButton, cemsButtonVariants } from "./CemsButton";
export type { CemsButtonVariant } from "./CemsButton";

// Dropdown
export {
  CemsDropdown,
  CemsDropdownTrigger,
  CemsDropdownContent,
  CemsDropdownGroup,
  CemsDropdownItem,
  CemsDropdownLabel,
  CemsDropdownSeparator,
} from "./CemsDropdown";

// Badge
export { CemsBadge } from "./CemsBadge";

// Dialog
export {
  CemsDialog,
  CemsDialogTrigger,
  CemsDialogClose,
  CemsDialogContent,
  CemsDialogHeader,
  CemsDialogTitle,
  CemsDialogDescription,
  CemsDialogFooter,
} from "./CemsDialog";

// Status Dot
export { CemsStatusDot } from "./CemsStatusDot";
