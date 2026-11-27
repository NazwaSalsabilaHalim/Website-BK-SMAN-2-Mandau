import { useState } from "react";
import { Link } from "react-router";
import {
  IconAlert,
  IconCalendar,
  IconClipboardClock,
  IconPin,
  IconPlus,
  IconUserSearch,
} from "@/components/bk/Icons";
import { Card, CardHeader, StatCard } from "@/components/bk/ui";
import { SESI_CONTOH } from "@/data/riwayatContoh";
import { gayaStatus, useApi, type Konseling } from "@/lib/konselingApi";

/* Nama class saja; isi gayanya ada di index.css */
const KATEGORI_STYLE: Record<string, string> = {
  Akademik: "badge-cat-akademik",
  Pribadi: "badge-cat-pribadi",
  Karier: "badge-cat-karir",
  Sosial: "badge-cat-sosial",
};

const AVATAR_STYLE = ["avatar-col-2", "avatar-col-1", "avatar-col-3", "avatar-col-4"];

const BAR_STYLE = ["gdash-sched-blue", "gdash-sched-indigo", "gdash-sched-orange"];

function inisial(nama: string) {
  return nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k.charAt(0).toUpperCase())
    .join("");
}

/** 24 Nov 2026 */
function tanggalPendek(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function bagianHari(waktu: string) {
  const jam = Number(waktu.slice(0, 2));
  if (jam < 11) return "PAGI";
  if (jam < 15) return "SIANG";
  return "SORE";
}

export default function DashboardGuru() {
  const { data, error } = useApi<Konseling[]>("/konseling");
  const daftar = data ?? [];

  const [sekarang] = useState(() => new Date());
  const hariIni = sekarang.toLocaleDateString("en-CA");

  const tanggalHariIni = sekarang.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const menunggu = daftar.filter((k) => k.status === "menunggu");

  const pengajuanHariIni = daftar.filter(
    (k) => new Date(k.dibuat).toLocaleDateString("en-CA") === hariIni,
  ).length;

  const jadwalHariIni = daftar
    .filter(
      (k) =>
        (k.status === "disetujui" || k.status === "perlu_pertemuan_lanjutan") &&
        k.tanggal === hariIni,
    )
    .sort((a, b) => a.waktu.localeCompare(b.waktu));

  const totalSiswa = new Set(daftar.map((k) => k.nis)).size;

  const terbaru = [...menunggu]
    .sort((a, b) => Date.parse(b.dibuat) - Date.parse(a.dibuat))
    .slice(0, 5);

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

      {error && <p className="frm-error">{error}</p>}

      {/* Ringkasan */}
      <div className="gdash-stats">
        <StatCard
          label="Pengajuan Hari Ini"
          value={pengajuanHariIni}
          icon={<IconClipboardClock width={22} height={22} />}
          iconCls="tint-red-600"
          footer={
            <p className="gdash-stat-alert">
              <IconAlert width={13} height={13} />
              {menunggu.length} permohonan menunggu ditinjau
            </p>
          }
        />

        <StatCard
          label="Jadwal Konseling Hari Ini"
          value={jadwalHariIni.length}
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
          value={totalSiswa}
          icon={<IconUserSearch width={22} height={22} />}
          iconCls="tint-indigo-700"
          footer={<p className="gdash-stat-muted">Siswa yang mengajukan konseling</p>}
        />
      </div>

      {/* Dua kolom bawah */}
      <div className="gdash-columns">
        {/* Permohonan terbaru, 2/3 lebar */}
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
                {terbaru.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="gp-empty">
                      Tidak ada permohonan yang menunggu.
                    </td>
                  </tr>
                ) : (
                  terbaru.map((p, i) => {
                    const st = gayaStatus(p.status);
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="media">
                            <span
                              className={
                                "gdash-avatar " + AVATAR_STYLE[i % AVATAR_STYLE.length]
                              }
                            >
                              {inisial(p.siswa)}
                            </span>
                            <span className="cell-strong">{p.siswa}</span>
                          </div>
                        </td>
                        <td>
                          <span className={"gdash-cat " + (KATEGORI_STYLE[p.kategori] ?? "")}>
                            {p.kategori}
                          </span>
                        </td>
                        <td className="gdash-date">{tanggalPendek(p.tanggal)}</td>
                        <td>
                          <span className={"badge-sq-tight " + st.badge}>{st.label}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Jadwal hari ini, 1/3 lebar */}
        <Card className="gdash-schedule">
          <div className="gdash-sched-head">
            <h2 className="gdash-sched-title">Jadwal Hari Ini</h2>
            <span className="gdash-sched-date">
              {sekarang.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            </span>
          </div>

          {jadwalHariIni.length === 0 ? (
            <p className="gp-empty">Tidak ada sesi konseling hari ini.</p>
          ) : (
            <ul className="gdash-sched-list">
              {jadwalHariIni.map((j, i) => (
                <li
                  key={j.id}
                  className={"gdash-sched-item " + BAR_STYLE[i % BAR_STYLE.length]}
                >
                  <div className="gdash-sched-time">
                    <p className="gdash-sched-jam">{j.waktu}</p>
                    <p className="gdash-sched-waktu">{bagianHari(j.waktu)}</p>
                  </div>
                  <div className="gdash-sched-body">
                    <p className="gdash-sched-judul">{j.topik}</p>
                    <p className="gdash-sched-siswa">
                      {j.siswa} ({j.kelas})
                    </p>
                    <p className="gdash-sched-tempat">
                      <IconPin width={12} height={12} />
                      {SESI_CONTOH.tempat}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

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