import { Link } from "react-router";
import {
  IconAlert,
  IconCalendar,
  IconClipboardClock,
  IconPin,
  IconPlus,
  IconUserSearch,
} from "../../components/bk/Icons";
import {
  Card,
  CardHeader,
  StatCard,
  Badge,
} from "../../components/bk/ui";

/* -----------------------------------------------------------
   DATA CONTOH. Nanti diganti data dari API (tabel konseling).
   ----------------------------------------------------------- */
type Status = "menunggu" | "disetujui" | "ditolak" | "selesai";
type Kategori = "Akademik" | "Pribadi" | "Karir" | "Sosial";

const RINGKASAN = {
  pengajuanHariIni: 5,
  jadwalHariIni: 3,
  totalSiswa: 156,
};

const PERMOHONAN: {
  nama: string;
  kategori: Kategori;
  tanggal: string;
  status: Status;
}[] = [
  { nama: "Andi Saputra", kategori: "Akademik", tanggal: "10 Okt 2023", status: "menunggu" },
  { nama: "Rina Marlina", kategori: "Pribadi", tanggal: "09 Okt 2023", status: "menunggu" },
];

const JADWAL_HARI_INI = [
  {
    jam: "08:30",
    waktu: "PAGI",
    judul: "Sesi Konseling Karir",
    siswa: "Andra Wijaya (XII IPA 1)",
    tempat: "Ruang BK 1",
    barCls: "gdash-sched-blue",
  },
  {
    jam: "10:15",
    waktu: "PAGI",
    judul: "Mediasi Kedisiplinan",
    siswa: "Rizky Ramadhan (XI IPS 2)",
    tempat: "Ruang BK Utama",
    barCls: "gdash-sched-indigo",
  },
  {
    jam: "13:00",
    waktu: "SIANG",
    judul: "Konsultasi PTN",
    siswa: "Siti Fatimah (XII IPA 3)",
    tempat: "Perpustakaan",
    barCls: "gdash-sched-orange",
  },
];

/* Nama class saja; isi gayanya ada di index.css */
const KATEGORI_STYLE: Record<Kategori, string> = {
  Akademik: "badge-cat-akademik",
  Pribadi: "badge-cat-pribadi",
  Karir: "badge-cat-karir",
  Sosial: "badge-cat-sosial",
};

const AVATAR_STYLE = [
  "avatar-col-2",
  "avatar-col-1",
  "avatar-col-3",
  "avatar-col-4",
];

function inisial(nama: string) {
  return nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k.charAt(0).toUpperCase())
    .join("");
}

export default function DashboardGuru() {
  const tanggalHariIni = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="dash-page">
      {/* Judul halaman */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Dashboard Overview</h1>
          <p className="ui-page-desc">
            {tanggalHariIni} — Mari tinjau aktivitas bimbingan hari ini.
          </p>
        </div>
        <Link to="/guru/sesi-baru" className="gdash-cta">
          <IconPlus width={16} height={16} />
          Buat Sesi Baru
        </Link>
      </div>

      {/* Ringkasan */}
      <div className="gdash-stats">
        <StatCard
          label="Pengajuan Hari Ini"
          value={RINGKASAN.pengajuanHariIni}
          icon={<IconClipboardClock width={22} height={22} />}
          iconCls="tint-red-600"
          footer={
            <p className="gdash-stat-alert">
              <IconAlert width={13} height={13} />
              Perlu segera ditinjau
            </p>
          }
        />

        <StatCard
          label="Jadwal Konseling Hari Ini"
          value={RINGKASAN.jadwalHariIni}
          icon={<IconCalendar width={22} height={22} />}
          iconCls="tint-blue-700"
          footer={
            <p className="gdash-stat-info">
              <IconCalendar width={13} height={13} />
              Sesi terjadwal
            </p>
          }
        />

        <StatCard
          label="Total Siswa Dibimbing"
          value={RINGKASAN.totalSiswa}
          icon={<IconUserSearch width={22} height={22} />}
          iconCls="tint-indigo-700"
          footer={<p className="gdash-stat-muted">Siswa aktif dalam bimbingan</p>}
        />
      </div>

      {/* Dua kolom bawah */}
      <div className="gdash-columns">
        {/* Permohonan terbaru – 2/3 lebar */}
        <Card className="gdash-requests">
          <CardHeader
            title="Permohonan Terbaru"
            right={
              <Link to="/guru/permohonan" className="dash-card-link">
                Lihat Semua →
              </Link>
            }
          />
          <div className="ui-table-wrap">
            <table className="gdash-table">
              <thead className="gdash-thead">
                <tr>
                  <th>Nama Siswa</th>
                  <th>Kategori</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="gdash-tbody">
                {PERMOHONAN.map((p, i) => (
                  <tr key={p.nama}>
                    <td>
                      <div className="media">
                        <span
                          className={
                            "gdash-avatar " + AVATAR_STYLE[i % AVATAR_STYLE.length]
                          }
                        >
                          {inisial(p.nama)}
                        </span>
                        <span className="cell-strong">{p.nama}</span>
                      </div>
                    </td>
                    <td>
                      <span className={"gdash-cat " + KATEGORI_STYLE[p.kategori]}>
                        {p.kategori}
                      </span>
                    </td>
                    <td className="gdash-date">{p.tanggal}</td>
                    <td>
                      <Badge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Jadwal hari ini – 1/3 lebar */}
        <Card className="gdash-schedule">
          <div className="gdash-sched-head">
            <h2 className="gdash-sched-title">Jadwal Hari Ini</h2>
            <span className="gdash-sched-date">
              {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            </span>
          </div>

          <ul className="gdash-sched-list">
            {JADWAL_HARI_INI.map((j) => (
              <li key={j.jam} className={"gdash-sched-item " + j.barCls}>
                <div className="gdash-sched-time">
                  <p className="gdash-sched-jam">{j.jam}</p>
                  <p className="gdash-sched-waktu">{j.waktu}</p>
                </div>
                <div className="gdash-sched-body">
                  <p className="gdash-sched-judul">{j.judul}</p>
                  <p className="gdash-sched-siswa">{j.siswa}</p>
                  <p className="gdash-sched-tempat">
                    <IconPin width={12} height={12} />
                    {j.tempat}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="gdash-sched-foot">
            <Link to="/guru/jadwal" className="gdash-sched-link">
              Lihat Kalender Lengkap
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}