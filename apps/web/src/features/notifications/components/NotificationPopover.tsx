"use client";

import React from "react";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Clock, 
  Info, 
  AlertCircle,
  Calendar,
  X
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from "../hooks/useNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationPopover() {
  const { data: notificationsData, isLoading } = useNotifications({ limit: 5 });
  const { data: unreadCount } = useUnreadCount();
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();
  const deleteNotif = useDeleteNotification();

  const notifications = notificationsData?.data || [];
  const hasUnread = (unreadCount || 0) > 0;

  return (
    <Popover>
      <PopoverTrigger render={
        <button className="relative p-2 text-gray-400 hover:text-brand rounded-lg transition-all active:scale-95 hover:bg-gray-50 dark:hover:bg-gray-800 group">
          <Bell size={25} className={cn("transition-transform group-hover:rotate-12", hasUnread && "animate-pulse text-brand")} />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-black text-white ring-2 ring-white dark:ring-gray-900">
              {unreadCount}
            </span>
          )}
        </button>
      } />
      <PopoverContent className="w-80 p-0 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-gray-100 dark:border-gray-800 dark:bg-gray-900 overflow-hidden" align="end">
        <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Notifications</h3>
            {hasUnread && (
               <span className="px-1.5 py-0.5 bg-brand/10 text-brand text-[9px] font-black rounded-md">
                 {unreadCount} NEW
               </span>
            )}
          </div>
          {notifications.length > 0 && (
            <button 
              onClick={() => markAllRead.mutate()}
              className="text-[10px] font-bold text-brand hover:underline flex items-center gap-1"
            >
              <CheckCheck size={12} />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto overflow-x-hidden p-2 space-y-1">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg space-y-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-700 mb-4">
                <Bell size={32} />
              </div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">All caught up!</p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">No new notifications at the moment</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={cn(
                  "group relative p-3 rounded-lg transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800 flex gap-3 cursor-pointer",
                  !n.isRead && "bg-brand/[0.02] dark:bg-brand/[0.05] border-brand/5 dark:border-brand/10"
                )}
                onClick={() => !n.isRead && markRead.mutate(n.id)}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
                  n.type.includes("ERROR") || n.type.includes("REJECTED") ? "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border-red-100 dark:border-red-500/20" :
                  n.type.includes("SUCCESS") || n.type.includes("APPROVED") ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20" :
                  "bg-brand/5 dark:bg-brand/10 text-brand border-brand/10 dark:border-brand/20"
                )}>
                  {n.type.includes("EVENT") ? <Calendar size={18} /> : 
                   n.type.includes("ERROR") ? <AlertCircle size={18} /> : 
                   <Info size={18} />}
                </div>
                
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={cn("text-xs leading-none transition-colors", n.isRead ? "text-gray-600 dark:text-gray-400 font-semibold" : "text-gray-900 dark:text-white font-black")}>
                      {n.title}
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-1.5">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                    <Clock size={10} />
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </div>
                </div>

                {!n.isRead && (
                  <div className="absolute top-4 right-10 w-1.5 h-1.5 rounded-full bg-brand" />
                )}

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotif.mutate(n.id);
                  }}
                  className="absolute top-3 right-3 p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                >
                  <X size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-2 border-t border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
            <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-brand hover:bg-brand/5 dark:hover:bg-brand/10 transition-all">
              View All Notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
