import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

export const exportAnalytics = async ({
  type,
  eventId,
  format,
}: {
  type: "admin" | "event";
  eventId?: string;
  format: "csv" | "pdf";
}) => {
  const url = type === "admin" 
    ? `/api/analytics/admin/export?format=${format}`
    : `/api/analytics/events/${eventId}/export?format=${format}`;

  try {
    const res = await apiFetch(url);
    if (!res.ok) throw new Error("Export failed");

    const blob = await res.blob();
    if (blob.size < 10) {
      throw new Error("Generated report is empty or invalid");
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = type === "admin" 
      ? `cems-admin-report-${timestamp}.${format}`
      : `cems-event-${eventId}-report-${timestamp}.${format}`;
    
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    
    toast.success(`${format.toUpperCase()} report downloaded successfully`);
  } catch (error: any) {
    console.error("Export Error:", error);
    toast.error(error.message || "Failed to export report");
  }
};
