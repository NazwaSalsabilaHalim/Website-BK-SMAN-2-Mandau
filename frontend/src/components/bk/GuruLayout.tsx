import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { API_URL, clearSession, getSession } from "../../lib/bkAuth";
import {
  NAV_ITEM_ACTIVE,
  NAV_ITEM_CLS,
  NAV_ITEM_IDLE,
  NAV_LABEL_CLS,
  SidebarUserCard,
} from "./ui";
import {
  IconBell,
  IconCap,
  IconChart,
  IconClose,
  IconForm,
  IconGrid,
  IconHelp,
  IconMenu,
  IconSearch,
  IconSettings,
} from "./Icons";

const NAV_UTAMA = [
  { to: "/guru", label: "Dashboard", icon: IconGrid, end: true },
  { to: "/guru/permohonan", label: "Permohonan Konseling", icon: IconForm },
  { to: "/guru/laporan", label: "Laporan Konseling", icon: IconChart },
];

const NAV_BAWAH = [
  { to: "/guru/pengaturan", label: "Pengaturan", icon: IconSettings },
];

const JUDUL: Record<string, string> = {
  "/guru/permohonan": "Permohonan Konseling",
  "/guru/laporan": "Laporan Konseling",
  "/guru/pengaturan": "Pengaturan",
};

type NavItem = {
  to: string;
  label: string;
  icon: typeof IconGrid;
  end?: boolean;
};

function NavList({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  return (
    <>
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `${NAV_ITEM_CLS} ${isActive ? NAV_ITEM_ACTIVE : NAV_ITEM_IDLE}`
          }
        >
          <Icon width={18} height={18} />
          {label}
        </NavLink>
      ))}
    </>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const session = getSession();
  const nama = session?.name || "Guru BK";

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
    <div className="app-sidebar">
      {/* Logo */}
      <Link to="/guru" className="app-brand">
        <span className="app-brand-logo">
          <IconCap width={20} height={20} />
        </span>
        <span className="app-brand-text">
          <span className="app-brand-name">BK SMAN 2</span>
          <span className="app-brand-tag">Counseling System</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="app-nav" aria-label="Menu guru BK">
        <p className={NAV_LABEL_CLS}>Menu Utama</p>
        <div className="app-nav-list">
          <NavList items={NAV_UTAMA} onNavigate={onNavigate} />
        </div>

        <div className="app-nav-section">
          <p className={NAV_LABEL_CLS}>Lainnya</p>
          <div className="app-nav-list">
            <NavList items={NAV_BAWAH} onNavigate={onNavigate} />
          </div>
        </div>
      </nav>

      {/* User card */}
      <SidebarUserCard
        nama={nama}
        peran="Guru BK"
        onLogout={handleLogout}
      />
    </div>
  );
}

export default function GuruLayout() {
  const [drawer, setDrawer] = useState(false);
  const { pathname } = useLocation();
  const session = getSession();
  const nama = session?.name || "Guru BK";

  const path = pathname.replace(/\/$/, "") || "/guru";
  const isDetail = /^\/guru\/permohonan\/[^/]+$/.test(path);
  const judul = isDetail
    ? "Detail Permohonan"
    : path === "/guru"
      ? ""
      : JUDUL[path] ?? "BK SMAN 2 Mandau";

  return (
    <div className="app-shell">
      {/* Sidebar desktop */}
      <aside className="app-aside app-aside-w64">
        <Sidebar />
      </aside>

      {/* Sidebar mobile (drawer) */}
      {drawer && (
        <div className="app-drawer">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setDrawer(false)}
            className="app-drawer-backdrop"
          />
          <aside className="app-drawer-panel">
            <Sidebar onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className="app-body">
        {/* Topbar */}
        <header className="app-topbar">
          <button
            type="button"
            onClick={() => setDrawer((v) => !v)}
            aria-label={drawer ? "Tutup menu" : "Buka menu"}
            className="app-icon-btn-menu"
          >
            {drawer ? <IconClose /> : <IconMenu />}
          </button>

          {isDetail && (
            <Link
              to="/guru/permohonan"
              aria-label="Kembali ke permohonan"
              className="app-icon-btn"
            >
              <ArrowLeft className="size-5" />
            </Link>
          )}

          {judul && <p className="app-topbar-title">{judul}</p>}

          <label
            className={
              "app-search " + (judul ? "app-search-w64" : "app-search-grow")
            }
          >
            <IconSearch width={16} height={16} className="app-search-icon" />
            <input
              type="search"
              placeholder="Cari data siswa atau sesi..."
              aria-label="Cari data siswa atau sesi"
              className="app-search-input"
            />
          </label>

          <div className="app-topbar-actions">
            <button
              type="button"
              aria-label="Notifikasi"
              className="app-icon-btn-bell"
            >
              <IconBell width={18} height={18} />
              {/* Badge notif */}
              <span className="app-notif-dot" />
            </button>
            <button
              type="button"
              aria-label="Bantuan"
              className="app-icon-btn-help"
            >
              <IconHelp width={18} height={18} />
            </button>
            <span className="app-topbar-sep" />
            <span className="app-topbar-name">{nama}</span>
            <span className="app-avatar-sm">{nama.charAt(0).toUpperCase()}</span>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}