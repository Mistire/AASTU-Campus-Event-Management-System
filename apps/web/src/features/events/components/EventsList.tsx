import { useState } from "react";
import { useEvents } from "../apis/get-events";
import { TableController } from "@/components/controllers/TableController";
import { eventColumns } from "./EventColumns";
import { StatsSummary } from "./StatsSummary";
import { ButtonController } from "@/components/controllers/ButtonController";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const EventsList = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error } = useEvents({
    page,
    limit,
    search,
  });

  const totalPages = data?.meta.totalPages || 1;
  const totalItems = data?.meta.total || 0;

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
        Error loading events: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsSummary stats={data?.meta.stats} />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
           {/* Search and Filters placeholder */}
           <div className="flex-1 w-full md:max-w-sm">
             <input
               type="text"
               placeholder="Search events..."
               className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               value={search}
               onChange={(e) => {
                 setSearch(e.target.value);
                 setPage(1); // Reset to first page on search
               }}
             />
           </div>
        </div>

        <TableController
          columns={eventColumns}
          data={data?.data || []}
          loading={isLoading}
          emptyMessage="No events found matching your criteria."
        />

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Showing {((page - 1) * limit) + 1} to{" "}
              {Math.min(page * limit, totalItems)} of {totalItems} entries
            </span>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-gray-500">Per page:</span>
              <Select
                value={limit.toString()}
                onValueChange={(val) => {
                  setLimit(Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[80px] h-8">
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

          <div className="flex items-center gap-1">
            <ButtonController
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2"
            >
              <ChevronsLeft className="h-4 w-4" />
            </ButtonController>
            <ButtonController
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </ButtonController>
            
            <div className="flex items-center px-4 text-sm font-medium">
              Page {page} of {totalPages}
            </div>

            <ButtonController
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </ButtonController>
            <ButtonController
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-2"
            >
              <ChevronsRight className="h-4 w-4" />
            </ButtonController>
          </div>
        </div>
      </div>
    </div>
  );
};
