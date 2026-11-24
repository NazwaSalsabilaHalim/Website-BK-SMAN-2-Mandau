import { ChevronLeft, ChevronRight, Check, ListFilter, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { Link } from "react-router";
import {
  AKTIF,
  PERMOHONAN,
  STATUS_PERMOHONAN,
  formatJadwal,
  type Permohonan,
  type StatusPermohonan,
} from "../../data/guruContoh";
import { KATEGORI, KATEGORI_STYLE } from "../../data/riwayatContoh";

const PER_HALAMAN = 5;

type Tab = "aktif" | "riwayat";

const STATUS_PER_TAB: Record<Tab, StatusPermohonan[]> = {
  aktif: ["menunggu", "disetujui", "lanjutan"],
  riwayat: ["selesai", "ditolak"],
};

export default function GuruPermohonan() {
  // Data disalin ke state supaya tombol terima/tolak langsung terlihat.
  // TODO: ganti dengan data dari API dan PATCH /api/konseling/{id}.
  const [data, setData] = useState<Permohonan[]>(PERMOHONAN);
  const [tab, setTab] = useState<Tab>("aktif");

  // Pilihan filter (belum berlaku) dan filter yang sudah diterapkan
  const [pilihStatus, setPilihStatus] = useState("semua");
  const [pilihJenis, setPilihJenis] = useState("semua");
  const [filter, setFilter] = useState({ status: "semua", jenis: "semua" });
  const [halaman, setHalaman] = useState(1);

  const [notif, setNotif] = useState("");
  const [tolakId, setTolakId] = useState<number | null>(null);
  const [alasan, setAlasan] = useState("");
  const [alasanError, setAlasanError] = useState("");

  const jumlahAktif = data.filter((d) => AKTIF.includes(d.status)).length;
  const jumlahRiwayat = data.length - jumlahAktif;

  const daftar = data.filter((d) => {
    const dalamTab = STATUS_PER_TAB[tab].includes(d.status);
    const cocokStatus = filter.status === "semua" || d.status === filter.status;
    const cocokJenis = filter.jenis === "semua" || d.jenis === filter.jenis;
    return dalamTab && cocokStatus && cocokJenis;
  });

  const totalHalaman = Math.max(1, Math.ceil(daftar.length / PER_HALAMAN));
  const aktifHal = Math.min(halaman, totalHalaman);
  const mulai = (aktifHal - 1) * PER_HALAMAN;
  const tampil = daftar.slice(mulai, mulai + PER_HALAMAN);

  function gantiTab(t: Tab) {
    setTab(t);
    setPilihStatus("semua");
    setPilihJenis("semua");
    setFilter({ status: "semua", jenis: "semua" });
    setHalaman(1);
  }

  function terapkan() {
    setFilter({ status: pilihStatus, jenis: pilihJenis });
    setHalaman(1);
  }

  function setuju(p: Permohonan) {
    setData((list) =>
      list.map((d) => (d.id === p.id ? { ...d, status: "disetujui" } : d)),
    );
    setNotif(`Permohonan ${p.nama} disetujui.`);
  }

  function bukaTolak(id: number) {
    setTolakId(id);
    setAlasan("");
    setAlasanError("");
  }

  function konfirmasiTolak() {
    if (alasan.trim().length < 10) {
      setAlasanError("Tulis alasan penolakan (minimal 10 karakter).");
      return;
    }
    const target = data.find((d) => d.id === tolakId);
    setData((list) =>
      list.map((d) => (d.id === tolakId ? { ...d, status: "ditolak" } : d)),
    );
    if (target) setNotif(`Permohonan ${target.nama} ditolak.`);
    setTolakId(null);
  }

  function tekanTombol(e: KeyboardEvent) {
    if (e.key === "Escape") setTolakId(null);
  }

  const target = data.find((d) => d.id === tolakId);

  return (
    <div className="gp-page">
      {/* Tab */}
      <div className="gp-tabs" role="tablist">
        {(
          [
            ["aktif", "Permohonan Aktif", jumlahAktif],
            ["riwayat", "Riwayat Selesai", jumlahRiwayat],
          ] as const
        ).map(([key, label, jumlah]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => gantiTab(key)}
            className={"gp-tab " + (tab === key ? "gp-tab-on" : "gp-tab-off")}
          >
            {label} <span className="gp-tab-count">{jumlah}</span>
          </button>
        ))}
      </div>

      {notif && (
        <p role="status" className="ui-notif ui-notif-success">
          {notif}
          <button
            type="button"
            onClick={() => setNotif("")}
            aria-label="Tutup pemberitahuan"
            className="ui-notif-close"
          >
            <X className="gp-icon" />
          </button>
        </p>
      )}

      {/* Filter */}
      <div className="gp-filter">
        <span className="gp-filter-label">FILTER BY:</span>
        <select
          value={pilihStatus}
          onChange={(e) => setPilihStatus(e.target.value)}
          aria-label="Filter status"
          className="dashboard-select"
        >
          <option value="semua">Semua Status</option>
          {STATUS_PER_TAB[tab].map((s) => (
            <option key={s} value={s}>
              {STATUS_PERMOHONAN[s].label}
            </option>
          ))}
        </select>
        <select
          value={pilihJenis}
          onChange={(e) => setPilihJenis(e.target.value)}
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
        <button type="button" onClick={terapkan} className="gp-apply">
          <ListFilter className="gp-icon" />
          Terapkan
        </button>
      </div>

      {/* Tabel */}
      <section className="gp-card">
        <div className="ui-table-wrap">
          <table className="gp-table">
            <thead className="gp-thead">
              <tr>
                <th>NAMA SISWA</th>
                <th>KELAS</th>
                <th>JENIS LAYANAN</th>
                <th>TOPIK</th>
                <th>TANGGAL &amp; WAKTU</th>
                <th>STATUS</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody className="gp-tbody">
              {tampil.length === 0 ? (
                <tr>
                  <td colSpan={7} className="gp-empty">
                    Tidak ada permohonan yang cocok.
                  </td>
                </tr>
              ) : (
                tampil.map((p) => {
                  const st = STATUS_PERMOHONAN[p.status];
                  return (
                    <tr key={p.id}>
                      <td className="gp-name">{p.nama}</td>
                      <td className="gp-muted">{p.kelas}</td>
                      <td>
                        <span className={"badge-sq-tight " + KATEGORI_STYLE[p.jenis]}>
                          {p.jenis}
                        </span>
                      </td>
                      <td className="gp-topic">{p.topik}</td>
                      <td className="gp-muted">{formatJadwal(p.tanggal, p.jam)}</td>
                      <td>
                        <span className={"gp-status " + st.teks}>
                          <span className={"dot " + st.dot} />
                          {st.label}
                        </span>
                      </td>
                      <td>
                        <div className="gp-actions">
                          <Link to={`/guru/permohonan/${p.id}`} className="gp-detail">
                            Lihat Detail
                          </Link>
                          {p.status === "menunggu" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setuju(p)}
                                aria-label={`Setujui permohonan ${p.nama}`}
                                title="Setujui"
                                className="gp-approve"
                              >
                                <Check className="gp-icon" />
                              </button>
                              <button
                                type="button"
                                onClick={() => bukaTolak(p.id)}
                                aria-label={`Tolak permohonan ${p.nama}`}
                                title="Tolak"
                                className="gp-reject"
                              >
                                <X className="gp-icon" />
                              </button>
                            </>
                          ) : (
                            <span className="gp-noaction">Tidak ada aksi</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="gp-foot">
          <p className="pg-info">
            {daftar.length === 0
              ? "Menampilkan 0 permohonan"
              : `Menampilkan ${mulai + 1}-${mulai + tampil.length} dari ${daftar.length} permohonan`}
          </p>
          <div className="ui-page-list">
            <button
              type="button"
              onClick={() => setHalaman(Math.max(1, aktifHal - 1))}
              disabled={aktifHal === 1}
              aria-label="Halaman sebelumnya"
              className="pg-btn"
            >
              <ChevronLeft className="gp-icon" />
            </button>
            {Array.from({ length: totalHalaman }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setHalaman(n)}
                aria-current={n === aktifHal ? "page" : undefined}
                className={"pg-num " + (n === aktifHal ? "pg-num-on" : "pg-num-off")}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setHalaman(Math.min(totalHalaman, aktifHal + 1))}
              disabled={aktifHal === totalHalaman}
              aria-label="Halaman berikutnya"
              className="pg-btn"
            >
              <ChevronRight className="gp-icon" />
            </button>
          </div>
        </div>
      </section>

      {/* Dialog alasan penolakan */}
      {target && (
        <div className="gp-overlay" onKeyDown={tekanTombol}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-tolak"
            className="dlg-narrow"
          >
            <h2 id="judul-tolak" className="dlg-title">
              Tolak permohonan
            </h2>
            <p className="copy-sub-1">
              {target.nama} • {target.topik}
            </p>
            <label htmlFor="alasan-tolak" className="gp-dlg-label">
              Alasan penolakan
            </label>
            <textarea
              id="alasan-tolak"
              rows={4}
              autoFocus
              value={alasan}
              onChange={(e) => {
                setAlasan(e.target.value);
                setAlasanError("");
              }}
              placeholder="Contoh: Jadwal bertabrakan dengan kegiatan sekolah."
              className="gp-dlg-textarea"
            />
            {alasanError && (
              <p role="alert" className="frm-error">
                {alasanError}
              </p>
            )}
            <div className="dlg-actions-tight">
              <button type="button" onClick={() => setTolakId(null)} className="btn-cancel">
                Batal
              </button>
              <button type="button" onClick={konfirmasiTolak} className="btn-danger">
                Tolak Permohonan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}