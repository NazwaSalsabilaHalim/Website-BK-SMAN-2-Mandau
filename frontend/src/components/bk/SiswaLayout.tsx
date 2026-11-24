import { ArrowLeft } from "lucide-react";
import { useState } from "react";
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
  IconClose,
  IconForm,
  IconGrid,
  IconHelp,
  IconHistory,
  IconMenu,
  IconPlus,
  IconSearch,
  IconSettings,
} from "./Icons";

const NAV = [
  { to: "/siswa", label: "Dashboard", icon: IconGrid, end: true },
  { to: "/siswa/ajukan", label: "Ajukan Konseling", icon: IconForm },
  { to: "/siswa/riwayat", label: "Riwayat Konseling", icon: IconHistory },
  { to: "/siswa/pengaturan", label: "Pengaturan", icon: IconSettings },
];

function sapaan() {
  const jam = new Date().getHours();
  if (jam < 11) return "pagi";
  if (jam < 15) return "siang";
  if (jam < 18) return "sore";
  return "malam";
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const session = getSession();
  const nama = session?.name || "Siswa";

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
      <Link to="/siswa" className="app-brand">
        <span className="app-brand-logo">
          <IconCap width={20} height={20} />
        </span>
        <span className="app-brand-text">
          <span className="app-brand-name">BK SMAN 2</span>
          <span className="app-brand-tag">Portal Siswa</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="app-nav" aria-label="Menu siswa">
        <p className={NAV_LABEL_CLS}>Menu</p>
        <div className="app-nav-list">
          {NAV.map(({ to, label, icon: Icon, end }) => (
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
        </div>
      </nav>

      {/* User card */}
      <SidebarUserCard
        nama={nama}
        peran="Siswa"
        onLogout={handleLogout}
      />
    </div>
  );
}

export default function SiswaLayout() {
  const [drawer, setDrawer] = useState(false);
  const { pathname } = useLocation();
  const session = getSession();

  const path = pathname.replace(/\/$/, "") || "/siswa";
  const namaDepan = (session?.name || "Siswa").split(" ")[0];
  const isDetail = /^\/siswa\/riwayat\/[^/]+$/.test(path);
  const judul =
    path === "/siswa"
      ? `Selamat ${sapaan()}, ${namaDepan}!`
      : isDetail
        ? "Detail Hasil Konseling"
        : "BK SMAN 2 Mandau";

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
              to="/siswa/riwayat"
              aria-label="Kembali ke riwayat"
              className="app-icon-btn"
            >
              <ArrowLeft className="size-5" />
            </Link>
          )}

          <p className="app-topbar-title">{judul}</p>

          <label className="app-search app-search-w48">
            <IconSearch width={16} height={16} className="app-search-icon" />
            <input
              type="search"
              placeholder="Cari..."
              aria-label="Cari"
              className="app-search-input"
            />
          </label>

          <Link to="/siswa/ajukan" className="app-cta">
            <IconPlus width={14} height={14} />
            <span className="app-cta-long">Ajukan Konseling</span>
            <span className="app-cta-short">Ajukan</span>
          </Link>

          <button
            type="button"
            aria-label="Notifikasi"
            className="app-icon-btn-bell"
          >
            <IconBell width={18} height={18} />
            <span className="app-notif-dot" />
          </button>
          <button
            type="button"
            aria-label="Bantuan"
            className="app-icon-btn-help"
          >
            <IconHelp width={18} height={18} />
          </button>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}