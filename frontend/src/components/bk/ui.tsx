/**
 * ui.tsx — Komponen UI bersama untuk seluruh halaman BK SMAN 2 Mandau.
 * Semua gaya ada di index.css (class "ui-*", "crumb-*", "dashboard-*", "btn-*").
 */
import { ChevronRight, LogOut, X } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

/* ------------------------------------------------------------------ */
/*  Token gaya (nama class dari index.css)                             */
/* ------------------------------------------------------------------ */

/** Card putih dengan bayangan ringan — gunakan di seluruh halaman */
export const CARD_CLS = "dashboard-card";

/** Input teks standar */
export const INPUT_CLS = "dashboard-input";

/** Select standar */
export const SELECT_CLS = "dashboard-select";

/** Tombol primer */
export const BTN_PRIMARY = "btn-primary-bk";

/** Tombol sekunder / outline */
export const BTN_SECONDARY = "btn-secondary-bk";

/* ------------------------------------------------------------------ */
/*  Token gaya Sidebar bersama (Siswa, Guru, Admin)                   */
/* ------------------------------------------------------------------ */

/** Lebar sidebar desktop standar (256px) */
export const SIDEBAR_WIDTH_CLS = "w-64";

/** Ukuran ikon menu sidebar standar (18px) */
export const SIDEBAR_ICON_SIZE = 18;

/** Kelas dasar item navigasi sidebar */
export const NAV_ITEM_CLS = "app-nav-link";
export const SIDEBAR_NAV_ITEM_CLS = NAV_ITEM_CLS;

/** Kelas item navigasi sidebar aktif */
export const NAV_ITEM_ACTIVE = "app-nav-link-active";
export const SIDEBAR_NAV_ITEM_ACTIVE = NAV_ITEM_ACTIVE;

/** Kelas item navigasi sidebar normal / idle */
export const NAV_ITEM_IDLE = "app-nav-link-idle";
export const SIDEBAR_NAV_ITEM_IDLE = NAV_ITEM_IDLE;

/** Kelas label grup navigasi sidebar */
export const NAV_LABEL_CLS = "app-nav-label";
export const SIDEBAR_NAV_LABEL_CLS = NAV_LABEL_CLS;

/**
 * Kartu profil pengguna + tombol keluar di dasar sidebar.
 * Digunakan bersama oleh layout Siswa, Guru BK, dan Admin.
 */
export function SidebarUserCard({
  nama,
  peran,
  onLogout,
  showContent = true,
}: {
  nama: string;
  peran: string;
  onLogout: () => void;
  showContent?: boolean;
}) {
  return (
    <div className="app-user">
      <div
        className={
          "app-user-card " + (!showContent ? "justify-center p-2" : "")
        }
      >
        <span className="app-avatar shrink-0">{nama.charAt(0).toUpperCase()}</span>
        {showContent && (
          <>
            <div className="app-user-info min-w-0 flex-1">
              <p className="app-user-name truncate">{nama}</p>
              <p className="app-user-role">{peran}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Keluar"
              title="Keluar"
              className="app-logout shrink-0"
            >
              <LogOut className="size-[18px]" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */

/** Wrapper card — tambahkan className untuk padding/spacing. */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`${CARD_CLS} ${className}`}>{children}</section>;
}

/** Header dalam card: judul kiri + slot kanan opsional. */
export function CardHeader({
  title,
  right,
  className = "",
}: {
  title: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`ui-card-header ${className}`}>
      <h2 className="ui-card-title">{title}</h2>
      {right}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

type StatCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  /** Class latar + warna ikon, mis. "dash-icon-blue", "dash-icon-red" */
  iconCls?: string;
  /** Konten tambahan di bawah angka (misalnya badge tren atau keterangan) */
  footer?: ReactNode;
};

/**
 * Kartu statistik standar admin dashboard.
 *
 * ```tsx
 * <StatCard label="Total Siswa" value={240} icon={<Users />} iconCls="dash-icon-blue" />
 * ```
 */
export function StatCard({
  label,
  value,
  icon,
  iconCls = "dash-icon-blue",
  footer,
}: StatCardProps) {
  return (
    <Card className="ui-stat">
      <div className="ui-stat-top">
        <div className="ui-stat-body">
          <p className="ui-stat-label">{label}</p>
          <p className="ui-stat-value">{value}</p>
        </div>
        <span className={`ui-stat-icon ${iconCls}`}>{icon}</span>
      </div>
      {footer && <div className="ui-stat-footer">{footer}</div>}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Breadcrumb                                                         */
/* ------------------------------------------------------------------ */

type Crumb = { label: string; to?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="crumb-nav">
      {items.map((c, i) => (
        <span key={c.label} className="crumb-item">
          {i > 0 && <ChevronRight className="size-3" aria-hidden />}
          {c.to ? (
            <Link to={c.to} className="crumb-link">
              {c.label}
            </Link>
          ) : (
            <span className="crumb-current">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Badge Status                                                       */
/* ------------------------------------------------------------------ */

const STATUS_PRESET = {
  aktif: { label: "Aktif", cls: "badge-status-aktif" },
  nonaktif: { label: "Nonaktif", cls: "badge-status-nonaktif" },
  menunggu: { label: "Menunggu", cls: "badge-status-menunggu" },
  disetujui: { label: "Disetujui", cls: "badge-status-disetujui" },
  ditolak: { label: "Ditolak", cls: "badge-status-ditolak" },
  selesai: { label: "Selesai", cls: "badge-status-selesai" },
  lanjutan: { label: "Lanjutan", cls: "badge-status-lanjutan" },
};

export type StatusKey = keyof typeof STATUS_PRESET;

export function Badge({
  status,
  label: overrideLabel,
  cls: overrideCls,
}: {
  status?: StatusKey;
  label?: string;
  cls?: string;
}) {
  const preset = status ? STATUS_PRESET[status] : undefined;
  const label = overrideLabel ?? preset?.label ?? status ?? "";
  const cls = overrideCls ?? preset?.cls ?? "badge-status-nonaktif";
  return <span className={`ui-badge ${cls}`}>{label}</span>;
}

/* ------------------------------------------------------------------ */
/*  Tabel standar                                                      */
/* ------------------------------------------------------------------ */

export function TableWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="ui-table-wrap">
      <table className="ui-table">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return <thead className="ui-thead">{children}</thead>;
}

export function Th({
  children,
  center,
}: {
  children?: ReactNode;
  center?: boolean;
}) {
  return <th className={center ? "ui-th ui-th-center" : "ui-th"}>{children}</th>;
}

/* ------------------------------------------------------------------ */
/*  Paginasi                                                           */
/* ------------------------------------------------------------------ */

export function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const pages = buildPages(current, total);
  return (
    <div className="ui-pagination">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="ui-page-btn"
      >
        ‹ Sebelumnya
      </button>

      <div className="ui-page-list">
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="ui-page-gap">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p as number)}
              aria-current={p === current ? "page" : undefined}
              className={
                "ui-page-num " +
                (p === current ? "ui-page-num-active" : "ui-page-num-idle")
              }
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        className="ui-page-btn"
      >
        Selanjutnya ›
      </button>
    </div>
  );
}

function buildPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, 2, total, current - 1, current, current + 1]);
  const sorted = [...set]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) result.push("…");
    result.push(n);
  });
  return result;
}

/* ------------------------------------------------------------------ */
/*  Notifikasi / Alert bar                                             */
/* ------------------------------------------------------------------ */

const NOTIF_VARIANT = {
  success: "ui-notif-success",
  error: "ui-notif-error",
  info: "ui-notif-info",
};

export function NotifBar({
  message,
  onClose,
  variant = "success",
}: {
  message: string;
  onClose: () => void;
  variant?: keyof typeof NOTIF_VARIANT;
}) {
  return (
    <p role="status" className={`ui-notif ${NOTIF_VARIANT[variant]}`}>
      {message}
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup pemberitahuan"
        className="ui-notif-close"
      >
        <X className="size-4" />
      </button>
    </p>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Header                                                        */
/* ------------------------------------------------------------------ */

export function PageHeader({
  breadcrumb,
  title,
  description,
  action,
}: {
  breadcrumb?: Crumb[];
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="dash-header">
      <div>
        {breadcrumb && (
          <div className="ui-page-crumb">
            <Breadcrumb items={breadcrumb} />
          </div>
        )}
        <h1 className="dash-title">{title}</h1>
        {description && <p className="ui-page-desc">{description}</p>}
      </div>
      {action && <div className="ui-page-action">{action}</div>}
    </div>
  );
}