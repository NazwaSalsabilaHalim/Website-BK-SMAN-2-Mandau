import { useState } from "react";
import { Link } from "react-router";
import { IconCap, IconClose, IconMenu } from "../bk/Icons";

// Menu yang belum punya halaman diarahkan ke "#" dulu.
const NAV_ITEMS = [
  { label: "Beranda", href: "/" },
  { label: "Tentang", href: "/#visi-misi" },
  { label: "Guru", href: "/#guru" },
  { label: "Informasi", href: "/#informasi" },
  { label: "Alumni", href: "#" },
  { label: "Materi Layanan", href: "#" },
];

type Props = {
  /** Label menu yang sedang aktif, contoh: "Beranda" */
  active?: string;
};

export default function BkNavbar({ active = "Beranda" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="pub-nav">
      <div className="pub-nav-inner">
        <Link to="/" className="pub-nav-brand">
          <IconCap width={20} height={20} />
          SMAN 2 MANDAU BK
        </Link>

        {/* Menu desktop */}
        <nav className="pub-nav-menu" aria-label="Menu utama">
          {NAV_ITEMS.map((item) => {
            const isActive = item.label === active;
            return (
              <a
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  "pub-nav-link " +
                  (isActive ? "pub-nav-link-active" : "pub-nav-link-idle")
                }
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="pub-nav-actions">
          <Link to="/layanan" className="pub-nav-cta">
            Layanan Konsultasi
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="pub-nav-toggle"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <nav className="pub-mnav" aria-label="Menu utama">
          <ul className="pub-mnav-list">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={
                    "pub-mnav-link " +
                    (item.label === active
                      ? "pub-mnav-link-active"
                      : "pub-mnav-link-idle")
                  }
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="pub-mnav-cta-wrap">
              <Link
                to="/layanan"
                onClick={() => setOpen(false)}
                className="pub-mnav-cta"
              >
                Layanan Konsultasi
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}