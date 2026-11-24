import NotificationDropdown from "@/components/shared/header/notification-dropdown";
import ThemeToggleButton from "@/components/shared/header/theme-toggler";
import UserDropdown from "@/components/shared/header/user-dropdown";
import { useSidebar } from "@/components/ui/sidebar";
import { useTranslations } from "@/i18n";
import { Menu, Search, X } from "lucide-react";
import { useRef } from "react";
import { useLocation } from "react-router";

const ADMIN_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/permohonan": "Permohonan Konseling",
  "/admin/siswa": "Data Siswa",
  "/admin/guru": "Data Guru BK",
  "/admin/berita": "Kelola Berita",
  "/admin/laporan": "Riwayat Konseling",
  "/admin/pengaturan": "Pengaturan",
};

export default function AppHeader() {
  const t = useTranslations("header");
  const inputRef = useRef<HTMLInputElement>(null);
  const { openMobile, toggleSidebar } = useSidebar();
  const { pathname } = useLocation();

  const path = pathname.replace(/\/$/, "") || "/admin";
  const judul = ADMIN_TITLES[path] ?? "BK SMAN 2 Mandau";

  return (
    <header className="adm-header">
      {/* Sisi kiri: Tombol Toggle Sidebar, Judul Halaman, dan Kolom Pencarian */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={t("toggleSidebar")}
          className="app-icon-btn"
        >
          {openMobile ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>

        <p className="app-topbar-title">{judul}</p>

        <label className="app-search app-search-w64">
          <Search className="app-search-icon size-4" />
          <input
            ref={inputRef}
            type="search"
            placeholder={t("searchPlaceholder")}
            aria-label="Cari data"
            className="app-search-input"
          />
        </label>
      </div>

      {/* Sisi kanan: Toggle Tema, Notifikasi, dan Profil Admin */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggleButton />
        <NotificationDropdown />
        <UserDropdown />
      </div>
    </header>
  );
}