"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { 
  useEventRegistrations, 
} from "@/features/events/api/useRegistrationStatus";
import { 
  useApproveRegistration, 
  useRejectRegistration,
  useCancelRegistration,
  useManualCheckIn
} from "@/features/events/api/mutations";
import { useAttendance } from "@/features/events/api/get-attendance";
import { AttendeeScanner } from "@/features/events/components/attendance/AttendeeScanner";
import { 
  CemsCard, 
  CemsCardHeader, 
  CemsCardContent 
} from "@/components/cems/CemsCard";
import { CemsTable } from "@/components/cems/CemsTable";
import { CemsBadge } from "@/components/cems/CemsBadge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  CheckCircle2,
  Clock,
  ListOrdered,
  MessageSquare,
  QrCode,
  ScanLine,
  Search,
  UserMinus,
  Users,
  XCircle
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CemsButton } from "@/components/cems/CemsButton";
import Image from "next/image";

export default function EventAttendeesPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const { data, isLoading } = useEventRegistrations(eventId);
  const approve = useApproveRegistration();
  const reject = useRejectRegistration();
  const cancel = useCancelRegistration();
  const manualCheckIn = useManualCheckIn();
  
  const { data: attendance } = useAttendance(eventId);
  
  const [searchTerm, setSearchTerm] = useState("");
  
  const autoOpenScanner = searchParams.get("scanner") === "true";
  const [isScannerOpen, setIsScannerOpen] = useState(autoOpenScanner);

  const allAttendees = useMemo(() => {
    if (!data) return [];
    return [
      ...(data.registrations || []).map((r: any) => ({ ...r, type: "REGISTRATION" })),
      ...(data.waitlist || []).map((w: any) => ({ ...w, type: "WAITLIST", status: { name: "WAITLISTED" } }))
    ];
  }, [data]);

  const filteredAttendees = allAttendees.filter((a: any) => 
    a.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = async (action: any, id: any, name: string) => {
    try {
      await action.mutateAsync(id);
      toast.success(`Action successful for ${name}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to perform action");
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "user.fullName",
      header: "Attendee",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-9 h-9 rounded-lg bg-brand/5 border border-brand/10 flex items-center justify-center text-brand font-black text-xs shrink-0">
            {row.original.user.profileImage ? (
              <Image src={row.original.user.profileImage} alt="" width={36} height={36} className="w-full h-full object-cover rounded-lg" />
            ) : (
              row.original.user.fullName.charAt(0)
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight">{row.original.user.fullName}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{row.original.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Entry Type",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
            {row.original.type === "REGISTRATION" ? (
                <CemsBadge status="neutral" dot>REGULAR</CemsBadge>
            ) : (
                <CemsBadge status="warning" dot>WAITLIST</CemsBadge>
            )}
        </div>
      )
    },
    {
      accessorKey: "status.name",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status?.name;
        const variant = status === "CONFIRMED" ? "success" : 
                        status === "PENDING" ? "warning" : 
                        status === "WAITLISTED" ? "neutral" : "neutral";
        return <CemsBadge status={variant as any} dot>{status}</CemsBadge>;
      },
    },
    {
      id: "atttendance",
      header: "Attendance",
      cell: ({ row }) => {
        const userId = row.original.user.id;
        const isCheckedIn = attendance?.some(a => a.userId === userId);
        return (
          <div className="flex items-center gap-2">
            {isCheckedIn ? (
              <CemsBadge status="success" dot>PRESENT</CemsBadge>
            ) : (
              <CemsBadge status="neutral" dot>ABSENT</CemsBadge>
            )}
          </div>
        );
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const status = row.original.status?.name;
        const isPending = status === "PENDING";
        const isConfirmed = status === "CONFIRMED";
        const isWaitlisted = status === "WAITLISTED";
        const userId = row.original.user.id;
        const isCheckedIn = attendance?.some(a => a.userId === userId);
        
        return (
          <div className="flex items-center gap-2">
            {isPending && (
              <>
                <Button 
                  size="sm" 
                  className="h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest gap-1.5"
                  onClick={() => handleAction(approve, row.original.id, row.original.user.fullName)}
                  disabled={approve.isPending}
                >
                  <CheckCircle2 size={12} /> Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8 rounded-lg border-red-100 text-red-500 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest gap-1.5"
                  onClick={() => handleAction(reject, row.original.id, row.original.user.fullName)}
                  disabled={reject.isPending}
                >
                  <XCircle size={12} /> Reject
                </Button>
              </>
            )}
            
            {isConfirmed && !isCheckedIn && (
              <CemsButton 
                size="sm" 
                className="h-8 rounded-lg bg-brand hover:bg-brand/90 text-white text-[10px] font-black uppercase tracking-widest gap-1.5"
                onClick={() => handleAction(manualCheckIn, { eventId, userId }, row.original.user.fullName)}
                disabled={manualCheckIn.isPending}
              >
                <CheckCircle2 size={12} /> Check In
              </CemsButton>
            )}

            {(isConfirmed || isWaitlisted) && (
              <Button 
                size="sm" 
                variant="outline"
                className="h-8 rounded-lg border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest gap-1.5"
                onClick={() => handleAction(cancel, row.original.id, row.original.user.fullName)}
                disabled={cancel.isPending}
              >
                <UserMinus size={12} /> Remove
              </Button>
            )}
            
             <Button 
              size="sm" 
              variant="ghost"
              className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-brand"
            >
              <MessageSquare size={14} />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    );
  }

  const pendingCount = allAttendees.filter(a => a.status?.name === "PENDING").length;
  const waitlistCount = allAttendees.filter(a => a.type === "WAITLIST").length;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="w-fit text-gray-400 hover:text-brand font-black uppercase tracking-widest text-[10px] gap-2 rounded-lg mb-2 -ml-2"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center text-brand shadow-sm shadow-brand/20">
               <Users size={24} />
             </div>
             <div>
               <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Attendee <span className="text-brand">Management</span></h1>
               <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                 Control access and manage the guest list for this event
               </p>
             </div>
          </div>
        </div>

        <Button 
          onClick={() => setIsScannerOpen(true)}
          className="h-16 px-8 rounded-lg bg-brand hover:bg-brand/90 text-white font-black uppercase tracking-widest shadow-xl shadow-brand/20 gap-3 group transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ScanLine size={18} />
          </div>
          Scan QR & Check-in
        </Button>
      </div>

      <AnimatePresence>
        {isScannerOpen && (
          <AttendeeScanner 
            eventId={eventId} 
            onClose={() => setIsScannerOpen(false)} 
          />
        )}
      </AnimatePresence>

      <CemsCard className="border-none shadow-2xl shadow-brand/5 overflow-hidden">
        <CemsCardHeader 
          className="pb-0"
          title="Attendee List"
          description="Click on an attendee to view profile or use actions to moderate"
          action={
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-10 h-10 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          }
        />
        <CemsCardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 bg-gray-50/50 dark:bg-gray-800/50 p-1 rounded-lg h-auto">
              <TabsTrigger value="all" className="rounded-lg text-[10px] font-black uppercase tracking-widest px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-brand data-[state=active]:shadow-sm">All</TabsTrigger>
              <TabsTrigger value="pending" className="rounded-lg text-[10px] font-black uppercase tracking-widest px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-brand data-[state=active]:shadow-sm">Pending Approval</TabsTrigger>
              <TabsTrigger value="confirmed" className="rounded-lg text-[10px] font-black uppercase tracking-widest px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-brand data-[state=active]:shadow-sm">Confirmed</TabsTrigger>
              <TabsTrigger value="waitlist" className="rounded-lg text-[10px] font-black uppercase tracking-widest px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-brand data-[state=active]:shadow-sm">Waitlist</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <CemsTable 
                columns={columns} 
                data={filteredAttendees} 
                pageSize={10}
                emptyMessage="No attendees found matching your criteria."
              />
            </TabsContent>
            <TabsContent value="pending">
              <CemsTable 
                columns={columns} 
                data={filteredAttendees.filter(a => a.status?.name === "PENDING")} 
                pageSize={10}
              />
            </TabsContent>
            <TabsContent value="confirmed">
              <CemsTable 
                columns={columns} 
                data={filteredAttendees.filter(a => a.status?.name === "CONFIRMED")} 
                pageSize={10}
              />
            </TabsContent>
            <TabsContent value="waitlist">
              <CemsTable 
                columns={columns} 
                data={filteredAttendees.filter(a => a.type === "WAITLIST")} 
                pageSize={10}
              />
            </TabsContent>
          </Tabs>
        </CemsCardContent>
      </CemsCard>
    </div>
  );
}
