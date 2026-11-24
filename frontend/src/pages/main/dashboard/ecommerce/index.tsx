import { PageMeta } from "@/components/shared/page-meta";
import {
  FilePlus2,
  GraduationCap,
  Mail,
  MessageSquare,
  Newspaper,
  Plus,
  Printer,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

/* -----------------------------------------------------------
   DATA CONTOH. Nanti diganti data dari API.
   ----------------------------------------------------------- */
type StatusAktivitas = "selesai" | "berjalan" | "menunggu";

type Aktivitas = {
  nama: string;
  kelas: string;
  layanan: string;
  waktu: string;
  status: StatusAktivitas;
};

const RINGKASAN = {
  totalSiswa: 1248,
  totalGuruBk: 8,
  permohonan: 24,
  totalBerita: 15,
};

const AKTIVITAS: Aktivitas[] = [
  { nama: "Andi Saputra", kelas: "XI MIPA 2", layanan: "Konseling Karir", waktu: "10:30 WIB", status: "selesai" },
  { nama: "Rina Mahendra", kelas: "X IPS 1", layanan: "Masalah Pribadi", waktu: "09:15 WIB", status: "berjalan" },
  { nama: "Budi Julianto", kelas: "XII BB 2", layanan: "Pelanggaran Disiplin", waktu: "08:00 WIB", status: "menunggu" },
  { nama: "Siska Putri", kelas: "XI IPS 4", layanan: "Konseling Belajar", waktu: "Kemarin", status: "selesai" },
];

const TREN = [
  { hari: "Sen", nilai: 8 },
  { hari: "Sel", nilai: 12 },
  { hari: "Rab", nilai: 6 },
  { hari: "Kam", nilai: 15 },
  { hari: "Jum", nilai: 10 },
];

const STATUS_STYLE: Record<StatusAktivitas, { label: string; cls: string }> = {
  selesai: { label: "SELESAI", cls: "badge-status-selesai" },
  berjalan: { label: "BERJALAN", cls: "badge-status-menunggu" },
  menunggu: { label: "MENUNGGU", cls: "badge-status-ditolak" },
};

const AVATAR_STYLE = ["avatar-col-1", "avatar-col-0", "avatar-col-4", "avatar-col-1"];

/* -----------------------------------------------------------
   Helper
   ----------------------------------------------------------- */
const angka = (n: number) => new Intl.NumberFormat("id-ID").format(n);

const inisial = (nama: string) =>
  nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k.charAt(0).toUpperCase())
    .join("");

/* -----------------------------------------------------------
   Komponen kecil
   ----------------------------------------------------------- */
type StatCardProps = {
  label: string;
  nilai: string;
  ikon: ReactNode;
  ikonCls: string;
  kanan?: ReactNode;
};

function StatCard({ label, nilai, ikon, ikonCls, kanan }: StatCardProps) {
  return (
    <section className="dashboard-card dash-stat">
      <div className="dash-stat-top">
        <span className={`dash-stat-icon ${ikonCls}`}>{ikon}</span>
        {kanan}
      </div>
      <p className="dash-stat-label">{label}</p>
      <p className="dash-stat-value">{nilai}</p>
    </section>
  );
}

type TombolCepatProps = {
  to: string;
  label: string;
  ikon: ReactNode;
};

function TombolCepat({ to, label, ikon }: TombolCepatProps) {
  return (
    <Link to={to} className="dash-quick">
      <span className="dash-quick-icon">{ikon}</span>
      {label}
    </Link>
  );
}

/* -----------------------------------------------------------
   Halaman
   ----------------------------------------------------------- */
export default function AdminDashboardPage() {
  const maks = Math.max(...TREN.map((t) => t.nilai));

  return (
    <>
      <PageMeta
        title="Dashboard Admin | BK SMAN 2 Mandau"
        description="Dashboard admin sistem informasi bimbingan konseling SMAN 2 Mandau"
      />

      <div className="dash-page">
        {/* Judul halaman */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Overview Dashboard</h1>
            <p className="dash-subtitle">
              Selamat datang kembali, pantau perkembangan bimbingan siswa hari ini.
            </p>
          </div>
          <Link to="/admin/laporan" className="dash-btn-primary">
            <Plus className="size-4" />
            Laporan Baru
          </Link>
        </div>

        {/* Ringkasan */}
        <div className="dash-stat-grid">
          <StatCard
            label="Total Siswa"
            nilai={angka(RINGKASAN.totalSiswa)}
            ikon={<Users className="size-5" />}
            ikonCls="dash-icon-blue"
            kanan={
              <span className="dash-trend-up">
                <TrendingUp className="size-3.5" />
                +12
              </span>
            }
          />
          <StatCard
            label="Total Guru BK"
            nilai={angka(RINGKASAN.totalGuruBk)}
            ikon={<GraduationCap className="size-5" />}
            ikonCls="dash-icon-orange"
            kanan={<span className="dash-stat-note">Tetap</span>}
          />
          <StatCard
            label="Permohonan Konseling"
            nilai={angka(RINGKASAN.permohonan)}
            ikon={<MessageSquare className="size-5" />}
            ikonCls="dash-icon-red"
            kanan={<span className="dash-stat-pill">Perlu Respon</span>}
          />
          <StatCard
            label="Total Berita"
            nilai={angka(RINGKASAN.totalBerita)}
            ikon={<Newspaper className="size-5" />}
            ikonCls="dash-icon-gray"
          />
        </div>

        <div className="dash-main-grid">
          {/* Aktivitas terbaru */}
          <section className="dashboard-card dash-activity">
            <div className="dash-card-header dash-card-header-split">
              <h2 className="dash-card-title">Aktivitas Terbaru</h2>
              <Link to="/admin/permohonan" className="dash-card-link">
                Lihat Semua
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="dash-table">
                <thead className="dash-thead">
                  <tr>
                    <th>Siswa</th>
                    <th>Jenis Layanan</th>
                    <th>Waktu</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="dash-tbody">
                  {AKTIVITAS.map((a, i) => {
                    const st = STATUS_STYLE[a.status];
                    return (
                      <tr key={a.nama}>
                        <td>
                          <div className="dash-person">
                            <span className={`dash-avatar ${AVATAR_STYLE[i % AVATAR_STYLE.length]}`}>
                              {inisial(a.nama)}
                            </span>
                            <div>
                              <p className="dash-person-name">{a.nama}</p>
                              <p className="dash-person-sub">{a.kelas}</p>
                            </div>
                          </div>
                        </td>
                        <td className="dash-td-service">{a.layanan}</td>
                        <td className="dash-td-time">{a.waktu}</td>
                        <td>
                          <span className={`dash-badge ${st.cls}`}>{st.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Kolom kanan */}
          <div className="dash-side">
            <section className="dashboard-card dash-trend-card">
              <h2 className="dash-trend-title">Tren Konseling (Minggu Ini)</h2>
              <div className="dash-chart">
                {TREN.map((t) => (
                  <div key={t.hari} className="dash-chart-col">
                    <div className="dash-chart-track">
                      <div
                        title={`${t.hari}: ${t.nilai} sesi`}
                        className={`dash-bar ${t.nilai === maks ? "dash-bar-max" : "dash-bar-normal"}`}
                        style={{ height: `${(t.nilai / maks) * 100}%` }}
                      />
                    </div>
                    <span className="dash-chart-label">{t.hari}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="dashboard-card overflow-hidden">
              <div className="dash-card-header">
                <h2 className="dash-card-title">Kelola Cepat</h2>
              </div>
              <div className="dash-quick-grid">
                <TombolCepat to="/admin/siswa" label="Siswa Baru" ikon={<UserPlus className="size-5" />} />
                <TombolCepat to="/admin/berita" label="Buat Berita" ikon={<FilePlus2 className="size-5" />} />
                <TombolCepat to="/admin/laporan" label="Cetak Laporan" ikon={<Printer className="size-5" />} />
                <TombolCepat to="/admin/blast" label="Kirim Blast" ikon={<Mail className="size-5" />} />
              </div>
            </section>

          </div>
        </div>

        {/* Banner bantuan */}
        <section className="dash-banner">
          <div>
            <h2 className="dash-banner-title">Butuh bantuan sistem?</h2>
            <p className="dash-banner-text">
              Panduan lengkap penggunaan sistem bimbingan konseling SMAN 2 Mandau sudah tersedia.
            </p>
          </div>
          <div className="dash-banner-actions">
            <button type="button" className="dash-banner-btn-solid">
              Unduh Manual
            </button>
            <button type="button" className="dash-banner-btn-outline">
              Hubungi Support
            </button>
          </div>
        </section>
      </div>
    </>
  );
}