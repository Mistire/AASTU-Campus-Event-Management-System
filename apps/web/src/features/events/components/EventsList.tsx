"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Event, EventStatusName, PaginatedEventsResponse } from "../types";
import { useEvents, useMyOrganizedEvents } from "../api/get-events";
import { useVenues } from "../api/get-venues";
import { useUsers } from "../api/get-users";
import { useCreateEvent, useUpdateEvent, useDeleteEvent, useSubmitEvent, useApproveEvent, useRejectEvent, useGoLiveEvent, useArchiveEvent } from "../api/mutations";
import { useAttachTemplate } from "@/features/feedback/api";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { CemsTable } from "@/components/cems/CemsTable";
import { CemsButton } from "@/components/cems/CemsButton";
import { CemsBadge } from "@/components/cems/CemsBadge";
import { getEventsColumns, getStatusColor } from "@/features/events/components/EventsTableConfig";
import {
  Plus, Calendar, MapPin, Users, Clock, Hash, ArrowRight, X,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToastController } from "@/components/shared/ToastController";
import { EventFormModal } from "./EventFormModal";
import { DeleteConfirmation } from "@/components/shared/DeleteConfirmation";
import { ArchiveConfirmation } from "@/components/shared/ArchiveConfirmation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { STATUS_OPTIONS } from "../constants";
import { EventPreviewPanel } from "./EventPreviewPanel";



export const EventsList = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [venueId, setVenueId] = useState<string>("");
  const [createdById, setCreatedById] = useState<string>("");

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [previewEvent, setPreviewEvent] = useState<Event | null>(null);

  const { data: venues } = useVenues();
  const { data: users } = useUsers();

  const { profile } = useAuthStore();
  const userRole = (profile?.role || "") as string;
  const isOrganizer = userRole === "ORGANIZER";

  const eventQueryParams = {
    page,
    limit,
    search,
    status: status === "" ? undefined : (status as EventStatusName),
    venueId: venueId === "" ? undefined : venueId,
    createdById: createdById === "" ? undefined : createdById,
  };

  const globalEvents = useEvents(eventQueryParams, { enabled: !isOrganizer });
  const organizedEvents = useMyOrganizedEvents(eventQueryParams, { enabled: isOrganizer });

  const { data: eventsData, isLoading, isError, error } = isOrganizer ? organizedEvents : globalEvents;

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const submitEvent = useSubmitEvent();
  const approveEvent = useApproveEvent();
  const rejectEvent = useRejectEvent();
  const goLiveEvent = useGoLiveEvent();
  const archiveEvent = useArchiveEvent();
  const attachTemplate = useAttachTemplate();

  useEffect(() => {
    if (isError && error) {
      ToastController.error({
        message: "Failed to load events",
        description: error.message,
      });
    }
  }, [isError, error]);

  const handleAddEvent = () => {
    router.push("/dashboard/events/create");
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDelete = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEvent = (data: Partial<Event>) => {
    if (selectedEvent) {
      updateEvent.mutate({ id: selectedEvent.id, data }, {
        onSuccess: () => {
          setIsEventModalOpen(false);
          ToastController.success({ message: "Event updated successfully" });
        },
        onError: (err) => {
          ToastController.error({ message: "Failed to update event", description: err.message });
        }
      });
    } else {
      createEvent.mutate(data, {
        onSuccess: () => {
          setIsEventModalOpen(false);
          ToastController.success({ message: "Event created successfully" });
        },
        onError: (err) => {
          ToastController.error({ message: "Failed to create event", description: err.message });
        }
      });
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedEvent) return;
    deleteEvent.mutate(selectedEvent.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        ToastController.success({ message: "Event deleted successfully" });
      },
      onError: (err) => {
        ToastController.error({ message: "Failed to delete event", description: err.message });
      }
    });
  };

  const handleSubmit = (event: Event) => {
    submitEvent.mutate(event.id, {
      onSuccess: () => ToastController.success({ message: "Event submitted for approval" }),
      onError: (err) => ToastController.error({ message: "Failed to submit event", description: err.message })
    });
  };

  const handleApprove = (event: Event) => {
    approveEvent.mutate(event.id, {
      onSuccess: () => ToastController.success({ message: "Event approved successfully" }),
      onError: (err) => ToastController.error({ message: "Failed to approve event", description: err.message })
    });
  };

  const handleReject = (event: Event) => {
    const reason = window.prompt("Enter rejection reason (optional):");
    if (reason === null) return; // Cancelled
    rejectEvent.mutate({ id: event.id, reason: reason || undefined }, {
      onSuccess: () => ToastController.success({ message: "Event rejected" }),
      onError: (err) => ToastController.error({ message: "Failed to reject event", description: err.message })
    });
  };

  const handleGoLive = (event: Event) => {
    goLiveEvent.mutate(event.id, {
      onSuccess: () => ToastController.success({ message: "Event is now LIVE!" }),
      onError: (err) => ToastController.error({ message: "Failed to set event to LIVE", description: err.message })
    });
  };

  const handleArchive = (event: Event) => {
    setSelectedEvent(event);
    setIsArchiveModalOpen(true);
  };

  const handleConfirmArchive = async (templateId: string) => {
    if (!selectedEvent) return;
    try {
      if (templateId) {
        await attachTemplate.mutateAsync({ templateId, eventId: selectedEvent.id });
      }
      archiveEvent.mutate(selectedEvent.id, {
        onSuccess: () => {
          setIsArchiveModalOpen(false);
          ToastController.success({ message: "Event archived successfully" });
        },
        onError: (err) => {
          ToastController.error({ message: "Failed to archive event", description: err.message });
        }
      });
    } catch (err: any) {
      ToastController.error({ message: "Failed to attach template", description: err.message });
    }
  };

  const handleManageAttendees = (event: Event) => {
    router.push(`/dashboard/events/${event.id}/attendees`);
  };

  const columns = useMemo(() => 
    getEventsColumns(userRole, handleEdit, handleDelete, handleSubmit, handleApprove, handleReject, handleGoLive, handleArchive, handleManageAttendees), 
  [userRole]);

  const totalPages = (eventsData as PaginatedEventsResponse)?.meta?.totalPages || 1;
  const totalItems = (eventsData as PaginatedEventsResponse)?.meta?.total || 0;

  if (isError) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-500/20">
        Error loading events: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-brand/5 dark:bg-brand/10 flex items-center justify-center text-brand border border-brand/10 dark:border-brand/20 shadow-sm">
            <Calendar size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Events</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Create, edit and monitor campus events</p>
          </div>
        </div>
        
        {userRole !== "ADMIN" && (
          <CemsButton 
            cemsVariant="brand"
            onClick={handleAddEvent}
            className="rounded-lg px-8 py-6 h-auto font-black text-xs uppercase tracking-widest shadow-xl shadow-brand/20 transition-all active:scale-95 flex items-center gap-3 group"
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            Create New Event
          </CemsButton>
        )}
      </div>



      {/* Master-Detail Layout */}
      <div className="flex gap-6">
        {/* Table */}
        <div className={cn(
          "bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 flex-1 min-w-0",
        )}>
          <CemsTable
            columns={columns}
            data={(eventsData as PaginatedEventsResponse)?.data || []}
            loading={isLoading}
            emptyMessage="No events found matching your criteria."
            onRowClick={(event) => setPreviewEvent(event)}
            enableSorting
            enableGlobalFilter
            enableColumnVisibility
            manualPagination
            pageCount={totalPages}
            pageIndex={page - 1}
            pageSize={limit}
            totalItems={totalItems}
            onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
            onPageSizeChange={(newSize) => {
                setLimit(newSize);
                setPage(1);
            }}
            renderToolbarActions={() => (
              <div className="flex items-center gap-2">
                {!isOrganizer && (
                  <Select value={createdById} onValueChange={(val) => { setCreatedById(val ?? ""); setPage(1); }}>
                    <SelectTrigger className="h-8 min-w-[140px] bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-all">
                      <SelectValue placeholder="Organizer" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-gray-100 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-950">
                      <SelectItem value="">All Organizers</SelectItem>
                      {users?.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select value={status} onValueChange={(val) => { setStatus(val ?? ""); setPage(1); }}>
                  <SelectTrigger className="h-8 min-w-[120px] bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-all">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-gray-100 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-950">
                    <SelectItem value="">All Statuses</SelectItem>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={venueId} onValueChange={(val) => { setVenueId(val ?? ""); setPage(1); }}>
                  <SelectTrigger className="h-8 min-w-[130px] bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-all">
                    <SelectValue placeholder="Venue" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-gray-100 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-950">
                    <SelectItem value="">All Venues</SelectItem>
                    {venues?.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

          />
        </div>

        {/* Detail Panel Overlay */}
        <EventPreviewPanel 
          event={previewEvent} 
          onClose={() => setPreviewEvent(null)} 
        />
      </div>

      <EventFormModal 
        open={isEventModalOpen}
        onOpenChange={setIsEventModalOpen}
        event={selectedEvent}
        onSave={handleSaveEvent}
        isSaving={createEvent.isPending || updateEvent.isPending}
      />

      <DeleteConfirmation 
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        itemName={selectedEvent?.title || "Unknown Event"}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteEvent.isPending}
      />

      <ArchiveConfirmation
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        itemName={selectedEvent?.title || "Unknown Event"}
        onConfirm={handleConfirmArchive}
        isArchiving={archiveEvent.isPending || attachTemplate.isPending}
      />
    </div>
  );
};
