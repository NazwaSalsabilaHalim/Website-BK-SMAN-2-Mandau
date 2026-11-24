import AppHeader from "@/components/layout/app-layout/header";
import AppSidebar from "@/components/layout/app-layout/sidebar";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/utils";
import React from "react";
import { Outlet, useLocation } from "react-router";

export default function AppLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { pathname } = useLocation();

  const isAiRoute =
    pathname.startsWith("/ai-chat") || pathname.startsWith("/ai-settings");

  // Route-specific styles for the main content container
  const getRouteSpecificStyles = () => {
    if (isAiRoute) {
      return "adm-content-ai";
    }
    return "adm-content";
  };

  return (
    <SidebarProvider className={cn(isAiRoute && "adm-fullscreen")}>
      <AppSidebar />

      <SidebarInset
        className={cn(
          "min-h-screen bg-soft text-gray-800 dark:bg-gray-950 dark:text-gray-200",
          isAiRoute && "adm-fullscreen",
        )}
      >
        <AppHeader />

        <div className={getRouteSpecificStyles()}>{children ?? <Outlet />}</div>
      </SidebarInset>
      <ScrollToTop />
    </SidebarProvider>
  );
}