import { SidebarHeader } from "@/components/ui/sidebar";
import { cn } from "@/utils";
import { GraduationCap } from "lucide-react";
import { Link } from "react-router";

interface AppSidebarHeaderProps {
  showContent: boolean;
}

export default function AppSidebarHeader({
  showContent,
}: AppSidebarHeaderProps) {
  return (
    <SidebarHeader className="p-0">
      <Link
        to="/admin"
        className={cn(
          "app-brand",
          !showContent && "justify-center px-0",
        )}
      >
        <span className="app-brand-logo">
          <GraduationCap className="size-5 text-white" />
        </span>
        {showContent && (
          <span className="app-brand-text">
            <span className="app-brand-name">BK SMAN 2</span>
            <span className="app-brand-tag">Panel Admin</span>
          </span>
        )}
      </Link>
    </SidebarHeader>
  );
}