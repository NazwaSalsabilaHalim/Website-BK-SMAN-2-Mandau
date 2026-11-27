import { PageMeta } from "@/components/shared/page-meta";
import {
  FilePlus2,
  GraduationCap,
  Mail,
  MessageSquare,
  Newspaper,
  Plus,
  Printer,
  UserPlus,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { inisial } from "@/data/guruContoh";
import { useApi, type Konseling, type KonselingStatus } from "@/lib/konselingApi";

type StatusAktivitas = "selesai" | "berjalan" | "menunggu" | "ditolak";

const STATUS_STYLE: Record<StatusAktivitas, { label: string; cls: string }> = {
  selesai: { label: "SELESAI", cls: "badge-status-selesai" },
  berjalan: { label: "BERJALAN", cls: "badge-status-menunggu" },
  menunggu: { label: "MENUNGGU", cls: "badge-status-ditolak" },
  ditolak: { label: "DITOLAK", cls: "badge-status-ditolak" },
};

const AVATAR_STYLE = ["avatar-col-1", "avatar-col-0", "avatar-col-4", "avatar-col-1"];

const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum"];

/* -----------------------------------------------------------
   Helper
   ----------------------------------------------------------- */
const angka = (n: number) => new Intl.NumberFormat("id-ID").format(n);

/** Jumlah item dari respons list (array biasa atau { data: [...] }). */
function jumlah(d: unknown): number {
  if (Array.isArray(d)) return d.length;
  const dalam = (d as { data?: unknown } | null)?.data;
  return Array.isArray(dalam) ? dalam.length : 0;
}

const keStatusAktivitas = (s: KonselingStatus): StatusAktivitas =>
  s === "selesai" ? "selesai" : s === "menunggu" ? "menunggu" : s === "ditolak" ? "ditolak" : "berjalan";

/** "10:30 WIB" kalau hari ini, "Kemarin", atau "20 Nov". */
function labelWaktu(iso: string, sekarang: Date) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const hari = (x: Date) => x.toLocaleDateString("en-CA");
  const kemarin = new Date(sekarang);
  kemarin.setDate(kemarin.getDate() - 1);

  if (hari(d) === hari(sekarang)) {
    const jam = d
      .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
      .replace(".", ":");
    return `${jam} WIB`;
  }
  if (hari(d) === hari(kemarin)) return "Kemarin";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

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
  const { data: konseling } = useApi<Konseling[]>("/konseling");
  const { data: siswa } = useApi<unknown>("/siswa");
  const { data: guru } = useApi<unknown>("/guru-bk");
  const { data: berita } = useApi<unknown>("/berita");

  const [sekarang] = useState(() => new Date());
  const daftar = konseling ?? [];

  const menunggu = daftar.filter((k) => k.status === "menunggu").length;

  // Tren minggu ini (Senin sampai Jumat), dihitung dari tanggal sesi
  const senin = new Date(sekarang);
  senin.setDate(senin.getDate() - ((senin.getDay() + 6) % 7));
  const tren = HARI.map((hari, i) => {
    const t = new Date(senin);
    t.setDate(senin.getDate() + i);
    const tgl = t.toLocaleDateString("en-CA");
    return { hari, nilai: daftar.filter((k) => k.tanggal === tgl).length };
  });
  const maks = Math.max(1, ...tren.map((t) => t.nilai));

  const aktivitas = [...daftar]
    .sort((a, b) => Date.parse(b.diperbarui) - Date.parse(a.diperbarui))
    .slice(0, 4);

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
            nilai={angka(jumlah(siswa))}
            ikon={<Users className="size-5" />}
            ikonCls="dash-icon-blue"
          />
          <StatCard
            label="Total Guru BK"
            nilai={angka(jumlah(guru))}
            ikon={<GraduationCap className="size-5" />}
            ikonCls="dash-icon-orange"
          />
          <StatCard
            label="Permohonan Menunggu"
            nilai={angka(menunggu)}
            ikon={<MessageSquare className="size-5" />}
            ikonCls="dash-icon-red"
            kanan={menunggu > 0 ? <span className="dash-stat-pill">Perlu Respon</span> : undefined}
          />
          <StatCard
            label="Total Berita"
            nilai={angka(jumlah(berita))}
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
                  {aktivitas.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="dash-td-service">
                        Belum ada aktivitas konseling.
                      </td>
                    </tr>
                  ) : (
                    aktivitas.map((a, i) => {
                      const st = STATUS_STYLE[keStatusAktivitas(a.status)];
                      return (
                        <tr key={a.id}>
                          <td>
                            <div className="dash-person">
                              <span
                                className={`dash-avatar ${AVATAR_STYLE[i % AVATAR_STYLE.length]}`}
                              >
                                {inisial(a.siswa)}
                              </span>
                              <div>
                                <p className="dash-person-name">{a.siswa}</p>
                                <p className="dash-person-sub">{a.kelas}</p>
                              </div>
                            </div>
                          </td>
                          <td className="dash-td-service">{a.kategori}</td>
                          <td className="dash-td-time">{labelWaktu(a.diperbarui, sekarang)}</td>
                          <td>
                            <span className={`dash-badge ${st.cls}`}>{st.label}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Kolom kanan */}
          <div className="dash-side">
            <section className="dashboard-card dash-trend-card">
              <h2 className="dash-trend-title">Tren Konseling (Minggu Ini)</h2>
              <div className="dash-chart">
                {tren.map((t) => (
                  <div key={t.hari} className="dash-chart-col">
                    <div className="dash-chart-track">
                      <div
                        title={`${t.hari}: ${t.nilai} sesi`}
                        className={`dash-bar ${t.nilai === maks && t.nilai > 0 ? "dash-bar-max" : "dash-bar-normal"}`}
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