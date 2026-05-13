"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Activity,
  Headset,
  AlertTriangle,
  FileDown,
  Layers,
  MapPin,
  Compass,
  Hash,
  LayoutGrid,
  MessageSquare,
  ClipboardCheck,
  BarChart3,
  LayoutTemplate,
  ChevronRight,
  LogOut,
  ChevronLeft,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuthStore, type Role } from "@/features/auth/store/useAuthStore"
import mainPages from "@/data/main-pages.json"
import { useSidebar, Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Logo from "@/components/ui/Logo"
import Image from "next/image"
import { Button } from "@/components/ui/button"

// Icon Map
const iconMap: Record<string, React.ElementType> = {
  Dashboard: LayoutDashboard,
  Events: Calendar,
  Users: Users,
  Activity: Activity,
  Headset: Headset,
  AlertTriangle: AlertTriangle,
  FileDown: FileDown,
  Categories: Layers,
  Venues: MapPin,
  Compass: Compass,
  Tags: Hash,
  Departments: LayoutGrid,
  Feedback: MessageSquare,
  Attendance: ClipboardCheck,
  FeedbackEvents: BarChart3,
  FeedbackTemplates: LayoutTemplate,
};

export function CemsSidebar() {
  const pathname = usePathname()
  const { profile, hasAnyRole, clearAuth } = useAuthStore()
  const { state, toggleSidebar, setOpenMobile } = useSidebar()
  const isCollapsed = state === "collapsed"

  const handleLogout = () => {
    clearAuth()
    window.location.href = "/login"
  }

  // Filter items
  const allowedItems = (mainPages as any[]).filter((item) =>
    hasAnyRole(item.allowed as Role[])
  )

  // Dynamic Grouping Logic
  const sections = allowedItems.reduce((acc, item) => {
    const section = item.section || "Other"
    if (!acc[section]) acc[section] = []
    acc[section].push(item)
    return acc
  }, {} as Record<string, any[]>)

  // Prepare groups for rendering
  const renderGroups = Object.entries(sections).map(([sectionName, items]) => {
    // Custom nesting logic for "System Metadata" to keep it clean
    if (sectionName === "System Metadata" && items.length > 0) {
      return {
        label: sectionName,
        items: [
          {
            title: "System Metadata",
            icon: "Categories",
            subItems: items
          }
        ]
      }
    }

    // Custom nesting for Management sub-groups
    if (sectionName === "Management") {
      const feedbackItems = items.filter(i => i.title.includes("Feedback") || i.title === "FB Templates")
      const eventItems = items.filter(i => ["Events", "Archive"].includes(i.title))
      const operationItems = items.filter(i => ["Users", "Attendance"].includes(i.title))
      const monitoringItems = items.filter(i => ["Support", "Activity"].includes(i.title))
      const otherItems = items.filter(i => 
        !feedbackItems.includes(i) && 
        !eventItems.includes(i) && 
        !operationItems.includes(i) &&
        !monitoringItems.includes(i)
      )

      const managementItems = []
      
      if (eventItems.length > 0) {
        managementItems.push({
          title: "Events",
          icon: "Events",
          subItems: eventItems
        })
      }

      if (feedbackItems.length > 0) {
        managementItems.push({
          title: "Feedback",
          icon: "Feedback",
          subItems: feedbackItems
        })
      }

      if (operationItems.length > 0) {
        managementItems.push({
          title: "Operations",
          icon: "Users",
          subItems: operationItems
        })
      }

      if (monitoringItems.length > 0) {
        managementItems.push({
          title: "Monitoring",
          icon: "Activity",
          subItems: monitoringItems
        })
      }

      managementItems.push(...otherItems)
      
      return {
        label: sectionName,
        items: managementItems
      }
    }

    return {
      label: sectionName,
      items: items
    }
  })

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-none bg-transparent"
      style={{ "--sidebar-background": "transparent", "--sidebar-border": "transparent" } as React.CSSProperties}
    >
      <div className="flex flex-col h-full min-h-0 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-800 overflow-hidden">
        
        {/* ── Sidebar Header ── */}
        <SidebarHeader className="p-0 shrink-0">
          <div className={cn(
            "flex items-center justify-between h-20 px-6 border-b border-gray-100 dark:border-gray-800",
            isCollapsed && "px-4 justify-center"
          )}>
            {!isCollapsed && <Logo />}
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex text-gray-400 dark:text-gray-500 hover:text-brand dark:hover:text-brand hover:bg-brand/5 dark:hover:bg-brand/10 rounded-lg transition-all"
                onClick={toggleSidebar}
              >
                {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
                onClick={() => setOpenMobile(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </SidebarHeader>

        {/* ── Sidebar Content ── */}
        <SidebarContent className="p-0 flex-1 min-h-0 overflow-y-auto scrollbar-subtle">
          <div className={cn("py-6 px-4", isCollapsed && "px-2")}>
            <nav className="space-y-8">
              {renderGroups.map((group) => {
                const filteredItems = group.items.filter(item => {
                  if ("subItems" in item) return item.subItems.length > 0
                  return true
                })

                if (filteredItems.length === 0) return null

                return (
                  <div key={group.label} className="space-y-1">
                    {!isCollapsed && (
                      <p className="px-3 mb-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] pl-4">
                        {group.label}
                      </p>
                    )}
                    {filteredItems.map((item: any) => {
                      const Icon = iconMap[item.icon || item.title] || LayoutDashboard

                      // Submenu handling
                      if (item.subItems) {
                        const isSubActive = item.subItems.some((sub: any) => pathname.startsWith(sub.to))
                        
                        return (
                          <Collapsible
                            key={item.title}
                            defaultOpen={isSubActive}
                            className="group w-full"
                          >
                            <div className="space-y-1">
                              <CollapsibleTrigger asChild>
                                <button
                                  className={cn(
                                    "group flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-all duration-300 text-sm font-bold tracking-tight",
                                    isCollapsed ? "px-0 justify-center h-10 w-10 mx-auto" : "px-4",
                                    isSubActive 
                                      ? "text-brand dark:text-white"
                                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand dark:hover:text-white",
                                  )}
                                >
                                  <Icon className={cn(
                                    "w-5 h-5 transition-colors shrink-0",
                                    isSubActive ? "text-brand dark:text-white" : "text-gray-400 group-hover:text-brand"
                                  )} />
                                  {!isCollapsed && <span>{item.title}</span>}
                                  {!isCollapsed && <ChevronRight className="ml-auto w-4 h-4 transition-transform duration-300 group-data-[state=open]:rotate-90" />}
                                </button>
                              </CollapsibleTrigger>
                              {!isCollapsed && (
                                <CollapsibleContent>
                                  <div className="border-l border-gray-100 dark:border-gray-800 ml-6 pl-2 mt-2 space-y-1">
                                    {item.subItems.map((sub: any) => {
                                      const subActive = pathname === sub.to
                                      return (
                                        <Link
                                          key={sub.title}
                                          href={sub.to}
                                          className={cn(
                                            "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 text-xs font-bold tracking-tight",
                                            subActive 
                                              ? "bg-brand text-white shadow-lg shadow-brand/20"
                                              : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand dark:hover:text-white"
                                          )}
                                        >
                                          <span>{sub.title}</span>
                                        </Link>
                                      )
                                    })}
                                  </div>
                                </CollapsibleContent>
                              )}
                            </div>
                          </Collapsible>
                        )
                      }

                      // Simple item handling
                      const isActive = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to))

                      return (
                        <Link
                          key={item.title}
                          href={item.to}
                          className={cn(
                            "group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 text-sm font-bold tracking-tight",
                            isCollapsed ? "px-0 justify-center h-10 w-10 mx-auto" : "px-4",
                            isActive
                              ? "bg-brand text-white shadow-lg shadow-brand/20"
                              : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-brand dark:hover:text-white",
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-5 h-5 transition-colors shrink-0",
                              isActive ? "text-white" : "text-gray-400 group-hover:text-brand",
                            )}
                          />
                          {!isCollapsed && <span>{item.title}</span>}
                        </Link>
                      )
                    })}
                  </div>
                )
              })}
            </nav>
          </div>
        </SidebarContent>

        {/* ── Sidebar Footer ── */}
        <SidebarFooter className="p-0 shrink-0">
          <div className={cn(
            "p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900",
            isCollapsed && "p-2"
          )}>
            <div className={cn(
              "group relative flex items-center gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100/50 dark:border-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:border-brand/20 dark:hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5 transition-all duration-500",
              isCollapsed && "p-0 h-12 w-12 mx-auto justify-center"
            )}>
              <div className="w-10 h-10 rounded-lg bg-brand/5 flex items-center justify-center border border-brand/10 shadow-sm group-hover:bg-brand/10 transition-colors shrink-0 overflow-hidden relative">
                 {profile?.profileImage ? (
                  <Image src={profile.profileImage as string} alt="Profile" fill className="object-cover" />
                ) : (
                  <Users className="text-brand w-5 h-5" />
                )}
              </div>
              
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0 mr-1">
                    <p className="text-[11px] font-black text-gray-900 dark:text-white leading-tight truncate">
                      {profile?.full_name || "Staff Member"}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 truncate">
                      {profile?.email || "staff@aastu.edu.et"}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all active:scale-90"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  )
}
