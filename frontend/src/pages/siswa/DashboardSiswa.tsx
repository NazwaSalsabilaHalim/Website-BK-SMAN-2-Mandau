import { Link } from "react-router";
import SafeImage from "../../components/bk/SafeImage";
import {
  IconCalendar,
  IconCheckCircle,
  IconChecks,
  IconClock,
  IconDoc,
  IconHistory,
  IconRoom,
  IconSend,
  IconUser,
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

const RINGKASAN = {
  totalPengajuan: 12,
  konselingSelesai: 8,
  statusTerbaru: { status: "disetujui" as Status, diperbarui: "2 jam lalu" },
};

const JADWAL: {
  tanggal: string;
  waktu: string;
  ruang: string;
  guru: string;
} | null = {
  tanggal: "Senin, 24 Oktober 2023",
  waktu: "10:00 - 11:30 WIB",
  ruang: "Ruang Konseling Utama",
  guru: "Ibu Ratna Sari, S.Pd.",
};

type Aktivitas = {
  tipe: "selesai" | "diterima" | "dikirim";
  judul: string;
  waktu: string;
  isi: string;
};

const AKTIVITAS: Aktivitas[] = [
  {
    tipe: "selesai",
    judul: "Sesi Selesai",
    waktu: "Kemarin, 14:20",
    isi: 'Sesi konseling mengenai "Manajemen Stress" telah selesai dilaksanakan.',
  },
  {
    tipe: "diterima",
    judul: "Pengajuan Diterima",
    waktu: "20 Okt, 09:15",
    isi: "Pengajuan jadwal konseling untuk tanggal 24 Oktober telah disetujui oleh Ibu Ratna.",
  },
  {
    tipe: "dikirim",
    judul: "Pengajuan Dikirim",
    waktu: "19 Okt, 16:45",
    isi: "Anda mengirimkan permohonan konseling baru perihal rencana karir.",
  },
];

const BERITA_UTAMA = {
  judul: "Tips Manajemen Waktu Untuk Siswa SMAN 2 Mandau",
  meta: "22 Okt 2023 • PIK-R Mandau",
  gambar: "/images/bk/berita-2.jpg",
};

const BERITA_LAIN = [
  {
    judul: "Sosialisasi Bahaya Narkoba & Kenakalan Remaja",
    tanggal: "20 Okt 2023",
    gambar: "/images/bk/berita-1.jpg",
    warna: ["#dbeafe", "#93c5fd"],
  },
  {
    judul: "Menentukan Jurusan Kuliah: Panduan Memilih",
    tanggal: "18 Okt 2023",
    gambar: "/images/bk/berita-3.jpg",
    warna: ["#d1fae5", "#6ee7b7"],
  },
  {
    judul: "Universitas terbaik di indonesia",
    tanggal: "23 Okt 2023",
    gambar: "/images/bk/berita-4.jpg",
    warna: ["#ebd1faff", "#c76ee7ff"],
  },
];

/* Nama class saja; isi gayanya ada di index.css */
const AKTIVITAS_STYLE = {
  selesai: { icon: IconChecks, cls: "tint-green-600" },
  diterima: { icon: IconCheckCircle, cls: "tint-indigo-700" },
  dikirim: { icon: IconSend, cls: "tint-blue-700" },
};

export default function DashboardSiswa() {
  return (
    <div className="dash-page">
      {/* Baris ringkasan */}
      <div className="sd-stats">
        <StatCard
          label="Total Pengajuan"
          value={RINGKASAN.totalPengajuan}
          icon={<IconDoc width={22} height={22} />}
          iconCls="tint-blue-800"
          footer={<p className="note">Sejak awal semester</p>}
        />

        <StatCard
          label="Konseling Selesai"
          value={String(RINGKASAN.konselingSelesai).padStart(2, "0")}
          icon={<IconCheckCircle width={22} height={22} />}
          iconCls="tint-green-600"
          footer={<p className="note">Telah ditangani</p>}
        />

        <StatCard
          label="Status Terbaru"
          value=""
          icon={<IconHistory width={22} height={22} />}
          iconCls="tint-amber-700"
          footer={
            <div className="sd-stat-stack">
              <Badge status={RINGKASAN.statusTerbaru.status} />
              <p className="note">
                Diperbarui: {RINGKASAN.statusTerbaru.diperbarui}
              </p>
            </div>
          }
        />
      </div>

      {/* Baris utama */}
      <div className="sd-columns">
        {/* Kolom kiri: jadwal dan aktivitas */}
        <div className="sd-main">
          {/* Jadwal konseling terdekat */}
          <Card>
            <CardHeader
              title="Jadwal Konseling Terdekat"
              right={<IconCalendar width={18} height={18} className="sd-icon-accent" />}
            />
            <div className="sd-pad">
              {JADWAL ? (
                <div className="sd-sched">
                  <ul className="sd-sched-list">
                    <li className="sd-sched-item">
                      <IconCalendar width={16} height={16} className="sd-sched-icon" />
                      {JADWAL.tanggal}
                    </li>
                    <li className="sd-sched-item">
                      <IconClock width={16} height={16} className="sd-sched-icon" />
                      {JADWAL.waktu}
                    </li>
                    <li className="sd-sched-item">
                      <IconRoom width={16} height={16} className="sd-sched-icon" />
                      {JADWAL.ruang}
                    </li>
                    <li className="sd-sched-item">
                      <IconUser width={16} height={16} className="sd-sched-icon" />
                      Guru BK: {JADWAL.guru}
                    </li>
                  </ul>
                  <Link to="/siswa/riwayat" className="sd-sched-link">
                    Lihat Detail
                  </Link>
                </div>
              ) : (
                <p className="sd-empty">
                  Belum ada jadwal konseling. Ajukan konseling untuk membuat jadwal baru.
                </p>
              )}
            </div>
          </Card>

          {/* Aktivitas terakhir */}
          <Card>
            <CardHeader title="Aktivitas Terakhir" />
            <ul className="sd-act-list">
              {AKTIVITAS.map((a) => {
                const { icon: Icon, cls } = AKTIVITAS_STYLE[a.tipe];
                return (
                  <li key={a.judul} className="sd-act-item">
                    <span className={"sd-act-icon " + cls}>
                      <Icon width={16} height={16} />
                    </span>
                    <div className="sd-act-body">
                      <div className="sd-act-head">
                        <p className="sd-act-title">{a.judul}</p>
                        <span className="sd-act-time">{a.waktu}</span>
                      </div>
                      <p className="sd-act-text">{a.isi}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* Kolom kanan: berita */}
        <Card className="sd-news">
          <CardHeader title="Berita & Artikel" />
          <div className="sd-pad">
            <SafeImage
              src={BERITA_UTAMA.gambar}
              alt={BERITA_UTAMA.judul}
              fallbackFrom="#fef3c7"
              fallbackTo="#fcd34d"
              className="sd-news-hero"
            />
            <h3 className="sd-news-title">{BERITA_UTAMA.judul}</h3>
            <p className="sd-news-meta">{BERITA_UTAMA.meta}</p>

            <ul className="sd-news-list">
              {BERITA_LAIN.map((b) => (
                <li key={b.judul} className="sd-news-item">
                  <SafeImage
                    src={b.gambar}
                    alt={b.judul}
                    fallbackFrom={b.warna[0]}
                    fallbackTo={b.warna[1]}
                    className="sd-news-thumb"
                  />
                  <div className="sd-news-body">
                    <p className="sd-news-item-title">{b.judul}</p>
                    <p className="sd-news-meta">{b.tanggal}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}