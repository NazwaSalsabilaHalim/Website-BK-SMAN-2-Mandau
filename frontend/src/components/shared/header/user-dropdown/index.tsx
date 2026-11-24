import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { API_URL, clearSession, getSession } from "@/lib/bkAuth";
import { cn } from "@/utils";
import { ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

const ROLE_LABEL: Record<string, string> = {
  admin: "Super User",
  guru_bk: "Guru BK",
  siswa: "Siswa",
};

export default function UserDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const session = getSession();
  const nama = session?.name || "Admin BK";
  const peran = ROLE_LABEL[session?.role ?? "admin"];

  async function handleLogout() {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session?.token ?? ""}`,
        },
      });
    } catch {
      // server mati pun tetap keluar di sisi browser
    }
    clearSession();
    void navigate("/", { replace: true });
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="dropdown-toggle adm-user-trigger">
        <span className="adm-user-avatar">{nama.charAt(0).toUpperCase()}</span>

        <span className="adm-user-info">
          <span className="adm-user-name">{nama}</span>
          <span className="adm-note">{peran}</span>
        </span>

        <ChevronDown
          className={cn("adm-user-chevron", isOpen && "adm-user-chevron-open")}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={12} className="adm-user-menu">
        <div className="adm-user-menu-head">
          <span className="adm-user-menu-name">{nama}</span>
          <span className="adm-user-menu-role">{peran}</span>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut className="size-5" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}