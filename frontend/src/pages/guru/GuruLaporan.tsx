import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  ListFilter,
  Printer,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AVATAR_STYLE,
  PERMOHONAN,
  STATUS_PERMOHONAN,
  buatCsv,
  formatTanggalPendek,
  inisial,
  semesterDari,
} from "../../data/guruContoh";
import { KATEGORI, KATEGORI_STYLE } from "../../data/riwayatContoh";

const PER_HALAMAN = 5;

// Laporan hanya memuat sesi yang sudah dilakukan (selesai atau perlu lanjutan), terbaru di atas.
const REKAMAN = PERMOHONAN.filter(
  (p) => p.status === "selesai" || p.status === "lanjutan",
).sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));

const SEMESTER = [...new Set(REKAMAN.map((r) => semesterDari(r.tanggal)))];
const KELAS = [...new Set(REKAMAN.map((r) => r.kelas))].sort();

export default function GuruLaporan() {
  const [semester, setSemester] = useState("semua");
  const [kelas, setKelas] = useState("semua");
  const [jenis, setJenis] = useState("semua");
  const [halaman, setHalaman] = useState(1);

  const hasil = useMemo(
    () =>
      REKAMAN.filter(
        (r) =>
          (semester === "semua" || semesterDari(r.tanggal) === semester) &&
          (kelas === "semua" || r.kelas === kelas) &&
          (jenis === "semua" || r.jenis === jenis),
      ),
    [semester, kelas, jenis],
  );

  const total = hasil.length;
  const akademik = hasil.filter((r) => r.jenis === "Akademik").length;
  const karier = hasil.filter((r) => r.jenis === "Karier").length;
  const lanjutan = hasil.filter((r) => r.status === "lanjutan").length;
  const persen = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  const totalHalaman = Math.max(1, Math.ceil(total / PER_HALAMAN));
  const aktif = Math.min(halaman, totalHalaman);
  const mulai = (aktif - 1) * PER_HALAMAN;
  const tampil = hasil.slice(mulai, mulai + PER_HALAMAN);

  const filterAktif = semester !== "semua" || kelas !== "semua" || jenis !== "semua";

  function reset() {
    setSemester("semua");
    setKelas("semua");
    setJenis("semua");
    setHalaman(1);
  }

  function unduh() {
    const blob = new Blob([buatCsv(hasil)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-konseling-${new Date().toLocaleDateString("en-CA")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="gl-page">
      <div className="gl-header">
        <div>
          <h1 className="gl-title">Laporan Konseling Saya</h1>
          <p className="gl-desc">
            Rekapitulasi data layanan konseling untuk siswa bimbingan Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={unduh}
          disabled={total === 0}
          className="gl-download"
        >
          <Download className="gl-icon" />
          Unduh Laporan
        </button>
      </div>

      {/* Ringkasan */}
      <div className="gl-stats">
        <section className="gl-stat">
          <p className="gl-stat-label">TOTAL KONSELING</p>
          <p className="gl-stat-value">{total}</p>
          <p className="gl-stat-note-ok">
            {filterAktif ? "Sesuai filter aktif" : "Seluruh rekaman"}
          </p>
        </section>

        {(
          [
            ["LAYANAN AKADEMIK", akademik],
            ["LAYANAN KARIER", karier],
          ] as const
        ).map(([label, n]) => (
          <section key={label} className="gl-stat">
            <p className="gl-stat-label">{label}</p>
            <p className="gl-stat-value">{n}</p>
            <div
              className="gl-bar"
              role="progressbar"
              aria-label={`${label} ${persen(n)} persen`}
              aria-valuenow={persen(n)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="gl-bar-fill" style={{ width: `${persen(n)}%` }} />
            </div>
          </section>
        ))}

        <section className="gl-stat">
          <p className="gl-stat-label">PENDING FOLLOW-UP</p>
          <p className="gl-stat-value gl-stat-value-danger">{lanjutan}</p>
          <p className="gl-stat-note">Perlu perhatian segera</p>
        </section>
      </div>

      {/* Filter */}
      <div className="gl-filter">
        <span className="gl-filter-label">
          <ListFilter className="gl-icon" />
          Filter:
        </span>
        <select
          value={semester}
          onChange={(e) => {
            setSemester(e.target.value);
            setHalaman(1);
          }}
          aria-label="Filter semester"
          className="dashboard-select"
        >
          <option value="semua">Semua Semester</option>
          {SEMESTER.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={kelas}
          onChange={(e) => {
            setKelas(e.target.value);
            setHalaman(1);
          }}
          aria-label="Filter kelas"
          className="dashboard-select"
        >
          <option value="semua">Semua Kelas</option>
          {KELAS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <select
          value={jenis}
          onChange={(e) => {
            setJenis(e.target.value);
            setHalaman(1);
          }}
          aria-label="Filter jenis layanan"
          className="dashboard-select"
        >
          <option value="semua">Semua Jenis Layanan</option>
          {KATEGORI.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <button type="button" onClick={reset} className="link-action-end">
          Reset Filter
        </button>
      </div>

      {/* Tabel */}
      <section className="gl-card">
        <div className="gl-card-head">
          <h2 className="gl-card-title">Rekaman Layanan Terkini</h2>
          <button
            type="button"
            onClick={() => window.print()}
            aria-label="Cetak laporan"
            title="Cetak"
            className="gl-print"
          >
            <Printer className="gl-icon-lg" />
          </button>
        </div>

        <div className="ui-table-wrap">
          <table className="gl-table">
            <thead className="gl-thead">
              <tr>
                <th>NAMA SISWA</th>
                <th>KELAS</th>
                <th>JENIS LAYANAN</th>
                <th>TANGGAL</th>
                <th>STATUS</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody className="gl-tbody">
              {tampil.length === 0 ? (
                <tr>
                  <td colSpan={6} className="gl-empty">
                    Tidak ada rekaman yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                tampil.map((r, i) => {
                  const st = STATUS_PERMOHONAN[r.status];
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="media">
                          <span
                            className={
                              "avatar-sm " +
                              AVATAR_STYLE[(mulai + i) % AVATAR_STYLE.length]
                            }
                          >
                            {inisial(r.nama)}
                          </span>
                          <span className="gl-name">{r.nama}</span>
                        </div>
                      </td>
                      <td className="gl-text">{r.kelas}</td>
                      <td>
                        <span className={"gl-badge " + KATEGORI_STYLE[r.jenis]}>
                          {r.jenis}
                        </span>
                      </td>
                      <td className="gl-muted">{formatTanggalPendek(r.tanggal)}</td>
                      <td>
                        <span className={"gl-badge " + st.badge}>{st.label}</span>
                      </td>
                      <td>
                        <Link
                          to={`/guru/permohonan/${r.id}`}
                          aria-label={`Lihat detail ${r.nama}`}
                          title="Lihat detail"
                          className="gl-view"
                        >
                          <Eye className="gl-icon-lg" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="gl-foot">
          <p className="pg-info">
            {total === 0
              ? "Menampilkan 0 rekaman"
              : `Menampilkan ${mulai + 1}-${mulai + tampil.length} dari ${total} rekaman`}
          </p>
          <div className="ui-page-list">
            <button
              type="button"
              onClick={() => setHalaman(Math.max(1, aktif - 1))}
              disabled={aktif === 1}
              aria-label="Halaman sebelumnya"
              className="pg-btn"
            >
              <ChevronLeft className="gl-icon" />
            </button>
            {Array.from({ length: totalHalaman }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setHalaman(n)}
                aria-current={n === aktif ? "page" : undefined}
                className={"pg-num " + (n === aktif ? "pg-num-on" : "pg-num-off")}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setHalaman(Math.min(totalHalaman, aktif + 1))}
              disabled={aktif === totalHalaman}
              aria-label="Halaman berikutnya"
              className="pg-btn"
            >
              <ChevronRight className="gl-icon" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}