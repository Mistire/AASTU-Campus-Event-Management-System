"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Event, EventStatusName } from "../types";
import { useEvents } from "../api/get-events";
import { useVenues } from "../api/get-venues";
import { useUsers } from "../api/get-users";
import { useCreateEvent, useUpdateEvent, useDeleteEvent } from "../api/mutations";
import { TableController } from "@/components/shared/TableController";
import { getEventsColumns } from "@/features/events/components/EventsTableConfig";
import { ButtonController } from "@/components/shared/ButtonController";
import { Search, Plus, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputController } from "@/components/shared/InputController";
import { ToastController } from "@/components/shared/ToastController";
import { EventFormModal } from "./EventFormModal";
import { DeleteConfirmation } from "@/components/shared/DeleteConfirmation";

const STATUS_OPTIONS = ["DRAFT", "PENDING", "APPROVED", "LIVE", "CANCELLED", "ARCHIVED", "REJECTED"];

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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { data: venues } = useVenues();
  const { data: users } = useUsers();

  const { data: eventsData, isLoading, isError, error } = useEvents({
    page,
    limit,
    search,
    status: status === "" ? undefined : (status as EventStatusName),
    venueId: venueId === "" ? undefined : venueId,
    createdById: createdById === "" ? undefined : createdById,
  });

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

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

  const columns = useMemo(() => getEventsColumns(handleEdit, handleDelete), []);

  const totalPages = eventsData?.meta?.totalPages || 1;
  const totalItems = eventsData?.meta?.total || 0;

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200">
        Error loading events: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand/5 flex items-center justify-center text-brand border border-brand/10 shadow-sm">
            <Calendar size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">Events</h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Create, edit and monitor campus events</p>
          </div>
        </div>
        
        <ButtonController 
          onClick={handleAddEvent}
          className="bg-brand hover:bg-brand-hover text-white rounded-2xl px-8 py-6 h-auto font-black text-xs uppercase tracking-widest shadow-xl shadow-brand/20 transition-all active:scale-95 flex items-center gap-3 border-none group"
        >
          <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          Create New Event
        </ButtonController>
      </div>

      {/* Filter Bar - Premium Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-50">
        <div className="md:col-span-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Search Events</label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={16} />
            <InputController
              className="pl-12 h-12 bg-gray-50/50 border-transparent rounded-xl text-sm font-semibold transition-all focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/5"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Organized By</label>
          <Select value={createdById} onValueChange={(val) => { setCreatedById(val ?? ""); setPage(1); }}>
            <SelectTrigger className="h-12 bg-gray-50/50 border-transparent rounded-xl text-sm font-semibold text-gray-700 hover:bg-white transition-all">
              <SelectValue placeholder="All Organizers" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
              <SelectItem value="">All Organizers</SelectItem>
              {users?.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Event Status</label>
          <Select value={status} onValueChange={(val) => { setStatus(val ?? ""); setPage(1); }}>
            <SelectTrigger className="h-12 bg-gray-50/50 border-transparent rounded-xl text-sm font-semibold text-gray-700 hover:bg-white transition-all">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
              <SelectItem value="">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Venue</label>
          <Select value={venueId} onValueChange={(val) => { setVenueId(val ?? ""); setPage(1); }}>
            <SelectTrigger className="h-12 bg-gray-50/50 border-transparent rounded-xl text-sm font-semibold text-gray-700 hover:bg-white transition-all">
              <SelectValue placeholder="All Venues" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
              <SelectItem value="">All Venues</SelectItem>
              {venues?.map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content Table - Elevated White Card */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/40 border border-gray-50 overflow-hidden transition-all duration-500">
        <div className="p-0">
          <TableController
            columns={columns}
            data={eventsData?.data || []}
            loading={isLoading}
            emptyMessage="No events found matching your criteria."
            onRowClick={(event) => router.push(`/dashboard/events/${event.id}`)}
            // Manual pagination synchronization
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
          />
        </div>
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
    </div>
  );
};
