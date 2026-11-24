import { useNavigate } from "react-router";
import { IconCap } from "../components/bk/Icons";
import { API_URL, clearSession, getSession } from "../lib/bkAuth";

type Props = {
  title: string;
  deskripsi: string;
};

function DashboardShell({ title, deskripsi }: Props) {
  const navigate = useNavigate();
  const session = getSession();

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
    navigate("/", { replace: true });
  }

  return (
    <div className="ds-shell">
      <header className="ds-header">
        <div className="pub-nav-inner">
          <span className="pub-nav-brand">
            <IconCap width={20} height={20} />
            SMAN 2 MANDAU BK
          </span>
          <div className="media">
            <span className="ds-name">{session?.name}</span>
            <button type="button" onClick={handleLogout} className="ds-logout">
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="ds-main">
        <div className="ds-card">
          <h1 className="ds-title">{title}</h1>
          <p className="ds-welcome">
            Selamat datang, {session?.name || "pengguna"}.
          </p>
          <p className="ds-note">{deskripsi}</p>
        </div>
      </main>
    </div>
  );
}

export const DashboardGuru = () => (
  <DashboardShell
    title="Dashboard Guru BK"
    deskripsi="Halaman sementara. Nanti berisi daftar permohonan konseling, riwayat siswa, dan laporan."
  />
);

export const DashboardSiswa = () => (
  <DashboardShell
    title="Dashboard Siswa"
    deskripsi="Halaman sementara. Nanti berisi form pengajuan konseling, status permohonan, dan riwayat."
  />
);