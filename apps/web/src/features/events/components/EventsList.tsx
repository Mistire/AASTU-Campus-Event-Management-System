import { useState, useMemo } from "react";
import { useEvents } from "../apis/get-events";
import { useVenues } from "../apis/get-venues";
import { useUsers } from "../apis/get-users";
import { useCreateEvent, useUpdateEvent, useDeleteEvent } from "../apis/mutations";
import { TableController } from "@/components/controllers/TableController";
import { getEventColumns } from "./EventColumns";
import { ButtonController } from "@/components/controllers/ButtonController";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputController } from "@/components/controllers/InputController";
import { useEffect } from "react";
import { ToastController } from "@/components/controllers/ToastController";
import { useRouter } from "next/navigation";
import { EventFormModal } from "./EventFormModal";
import { DeleteConfirmation } from "@/components/common/deleteConformation";

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
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const { data: venues } = useVenues();
  const { data: users } = useUsers();

  const { data: eventsData, isLoading, isError, error } = useEvents({
    page,
    limit,
    search,
    status: status === "" ? undefined : (status as any),
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
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEdit = (event: any) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDelete = (event: any) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEvent = (data: any) => {
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

  const columns = useMemo(() => getEventColumns(handleEdit, handleDelete), []);

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
    <div className="space-y-4 pt-2">
      {/* Header with Title and Add Button */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Events</h1>
        <ButtonController 
          onClick={handleAddEvent}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          ADD EVENT
        </ButtonController>
      </div>

      {/* Filter Bar - White Card matching Stations UI */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-3 gap-3">
          {/* Creator Filter */}
          <div>
            <Select value={createdById} onValueChange={(val) => { setCreatedById(val ?? ""); setPage(1); }}>
              <SelectTrigger className="h-10 bg-white border-gray-200 rounded-lg text-sm text-gray-700">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Users</SelectItem>
                {users?.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Select value={status} onValueChange={(val) => { setStatus(val ?? ""); setPage(1); }}>
              <SelectTrigger className="h-10 bg-white border-gray-200 rounded-lg text-sm text-gray-700">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Venue Filter */}
          <div>
            <Select value={venueId} onValueChange={(val) => { setVenueId(val ?? ""); setPage(1); }}>
              <SelectTrigger className="h-10 bg-white border-gray-200 rounded-lg text-sm text-gray-700">
                <SelectValue placeholder="All Venues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Venues</SelectItem>
                {venues?.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content Table - Elevated White Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* Search bar inside the table card */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <InputController
              className="pl-10 h-10 bg-gray-50/50 border-gray-200 rounded-lg text-sm transition-all focus:bg-white"
              placeholder="Search event by name or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="px-1">
          <TableController
            columns={columns}
            data={eventsData?.data || []}
            loading={isLoading}
            onRowClick={(row) => router.push(`/events/${row.id}`)}
            emptyMessage="No events found matching your criteria."
          />
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-gray-50/30 border-t border-gray-100">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-gray-500">
              Showing <span className="text-gray-900">{totalItems > 0 ? ((page - 1) * limit) + 1 : 0}</span> to{" "}
              <span className="text-gray-900">{Math.min(page * limit, totalItems)}</span> of{" "}
              <span className="text-gray-900">{totalItems}</span> entries
            </span>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Rows per page:</span>
              <Select
                value={limit.toString()}
                onValueChange={(val) => {
                  setLimit(Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[70px] h-9 border-none bg-transparent shadow-none focus:ring-0 text-gray-700 font-semibold">
                  <SelectValue placeholder={limit} />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ButtonController
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-3 h-9 rounded-lg border-gray-200"
            >
              <ChevronsLeft className="h-4 w-4 text-gray-600" />
            </ButtonController>
            <ButtonController
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 h-9 rounded-lg border-gray-200"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </ButtonController>

            <div className="flex items-center gap-1.5 px-1">
              <span className="text-sm font-semibold text-blue-600 px-3 py-1 bg-blue-50 rounded-md">
                {page}
              </span>
              <span className="text-sm text-gray-400 font-medium">of {totalPages}</span>
            </div>

            <ButtonController
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 h-9 rounded-lg border-gray-200"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </ButtonController>
            <ButtonController
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-3 h-9 rounded-lg border-gray-200"
            >
              <ChevronsRight className="h-4 w-4 text-gray-600" />
            </ButtonController>
          </div>
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

