import { CircleX } from "lucide-react";
import { useState, type ComponentType } from "react";
import { Link } from "react-router";
import SafeImage from "@/components/bk/SafeImage";
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
} from "@/components/bk/Icons";
import { Card, CardHeader, StatCard } from "@/components/bk/ui";
import {
  SESI_CONTOH,
  formatTanggal,
  formatTanggalPanjang,
} from "@/data/riwayatContoh";
import {
  gayaStatus,
  hitungRingkasan,
  useApi,
  type Konseling,
} from "@/lib/konselingApi";

/* -----------------------------------------------------------
   Berita: MASIH DATA CONTOH. Nanti dari GET /api/berita.
   ----------------------------------------------------------- */
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

/* -----------------------------------------------------------
   Aktivitas diturunkan dari data konseling
   ----------------------------------------------------------- */
type Aktivitas = {
  key: string;
  tipe: "selesai" | "diterima" | "dikirim" | "ditolak";
  judul: string;
  waktu: string;
  isi: string;
  t: number;
};

type IkonProps = ComponentType<{ width?: number; height?: number }>;

/* Nama class saja; isi gayanya ada di index.css */
const AKTIVITAS_STYLE: Record<Aktivitas["tipe"], { icon: IkonProps; cls: string }> = {
  selesai: { icon: IconChecks, cls: "tint-green-600" },
  diterima: { icon: IconCheckCircle, cls: "tint-indigo-700" },
  dikirim: { icon: IconSend, cls: "tint-blue-700" },
  ditolak: { icon: CircleX, cls: "tint-amber-700" },
};

const waktuMs = (iso: string) => {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
};

/** "Hari ini, 14:20" / "Kemarin, 14:20" / "20 Nov, 09:15" */
function labelWaktu(iso: string, sekarang: number) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const jam = d
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(".", ":");
  const hari = (x: Date) => x.toLocaleDateString("en-CA");
  const kemarin = new Date(sekarang);
  kemarin.setDate(kemarin.getDate() - 1);

  if (hari(d) === hari(new Date(sekarang))) return `Hari ini, ${jam}`;
  if (hari(d) === hari(kemarin)) return `Kemarin, ${jam}`;
  return `${d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}, ${jam}`;
}

/** "2 jam lalu" */
function waktuRelatif(iso: string, sekarang: number) {
  const t = waktuMs(iso);
  if (!t) return "";
  const menit = Math.floor((sekarang - t) / 60000);
  if (menit < 1) return "Baru saja";
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  return `${Math.floor(jam / 24)} hari lalu`;
}

function buatAktivitas(daftar: Konseling[], sekarang: number): Aktivitas[] {
  const hasil: Aktivitas[] = [];

  for (const k of daftar) {
    hasil.push({
      key: `${k.id}-dikirim`,
      tipe: "dikirim",
      judul: "Pengajuan Dikirim",
      waktu: labelWaktu(k.dibuat, sekarang),
      isi: `Kamu mengirim permohonan konseling "${k.topik}".`,
      t: waktuMs(k.dibuat),
    });

    const t = waktuMs(k.diperbarui);
    const waktu = labelWaktu(k.diperbarui, sekarang);

    if (k.status === "disetujui") {
      hasil.push({
        key: `${k.id}-status`,
        tipe: "diterima",
        judul: "Pengajuan Diterima",
        waktu,
        isi: `Pengajuan "${k.topik}" untuk tanggal ${formatTanggal(k.tanggal)} disetujui oleh ${k.guru}.`,
        t,
      });
    } else if (k.status === "ditolak") {
      hasil.push({
        key: `${k.id}-status`,
        tipe: "ditolak",
        judul: "Pengajuan Ditolak",
        waktu,
        isi: `Pengajuan "${k.topik}" ditolak oleh ${k.guru}.`,
        t,
      });
    } else if (k.status === "selesai" || k.status === "perlu_pertemuan_lanjutan") {
      hasil.push({
        key: `${k.id}-status`,
        tipe: "selesai",
        judul: k.status === "selesai" ? "Sesi Selesai" : "Perlu Pertemuan Lanjutan",
        waktu,
        isi: `Sesi konseling "${k.topik}" bersama ${k.guru} sudah dilaksanakan.`,
        t,
      });
    }
  }

  return hasil.sort((a, b) => b.t - a.t).slice(0, 3);
}

export default function DashboardSiswa() {
  const { data, error } = useApi<Konseling[]>("/konseling");
  const daftar = data ?? [];

  // Waktu "sekarang" diambil sekali saat halaman dibuka
  const [sekarang] = useState(() => Date.now());
  const hariIni = new Date(sekarang).toLocaleDateString("en-CA");

  const ringkasan = hitungRingkasan(daftar);

  const terbaru =
    [...daftar].sort((a, b) => waktuMs(b.diperbarui) - waktuMs(a.diperbarui))[0] ?? null;

  const jadwal =
    daftar
      .filter((k) => k.status === "disetujui" && k.tanggal >= hariIni)
      .sort((a, b) => `${a.tanggal} ${a.waktu}`.localeCompare(`${b.tanggal} ${b.waktu}`))[0] ??
    null;

  const aktivitas = buatAktivitas(daftar, sekarang);

  return (
    <div className="dash-page">
      {error && <p className="sd-empty">{error}</p>}

      {/* Baris ringkasan */}
      <div className="sd-stats">
        <StatCard
          label="Total Pengajuan"
          value={ringkasan.total}
          icon={<IconDoc width={22} height={22} />}
          iconCls="tint-blue-800"
          footer={<p className="note">Seluruh pengajuan</p>}
        />

        <StatCard
          label="Konseling Selesai"
          value={String(ringkasan.selesai).padStart(2, "0")}
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
            terbaru ? (
              <div className="sd-stat-stack">
                <span className={"badge-sq-tight " + gayaStatus(terbaru.status).badge}>
                  {gayaStatus(terbaru.status).label}
                </span>
                <p className="note">
                  Diperbarui: {waktuRelatif(terbaru.diperbarui, sekarang)}
                </p>
              </div>
            ) : (
              <p className="note">Belum ada pengajuan</p>
            )
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
              {jadwal ? (
                <div className="sd-sched">
                  <ul className="sd-sched-list">
                    <li className="sd-sched-item">
                      <IconCalendar width={16} height={16} className="sd-sched-icon" />
                      {formatTanggalPanjang(jadwal.tanggal)}
                    </li>
                    <li className="sd-sched-item">
                      <IconClock width={16} height={16} className="sd-sched-icon" />
                      {jadwal.waktu} WIB
                    </li>
                    <li className="sd-sched-item">
                      <IconRoom width={16} height={16} className="sd-sched-icon" />
                      {SESI_CONTOH.tempat}
                    </li>
                    <li className="sd-sched-item">
                      <IconUser width={16} height={16} className="sd-sched-icon" />
                      Guru BK: {jadwal.guru}
                    </li>
                  </ul>
                  <Link to={`/siswa/riwayat/${jadwal.id}`} className="sd-sched-link">
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
            {aktivitas.length === 0 ? (
              <p className="sd-empty">Belum ada aktivitas.</p>
            ) : (
              <ul className="sd-act-list">
                {aktivitas.map((a) => {
                  const { icon: Icon, cls } = AKTIVITAS_STYLE[a.tipe];
                  return (
                    <li key={a.key} className="sd-act-item">
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
            )}
          </Card>
        </div>

        {/* Kolom kanan: berita (masih data contoh) */}
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