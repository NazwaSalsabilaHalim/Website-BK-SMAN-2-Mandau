import { ChevronLeft, ChevronRight, Check, ListFilter, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { Link } from "react-router";
import { STATUS_PERMOHONAN, formatJadwal } from "@/data/guruContoh";
import { KATEGORI, KATEGORI_STYLE } from "@/data/riwayatContoh";
import {
  apiFetch,
  useApi,
  type Konseling,
  type KonselingStatus,
} from "@/lib/konselingApi";

const PER_HALAMAN = 5;

type Tab = "aktif" | "riwayat";

const STATUS_PER_TAB: Record<Tab, KonselingStatus[]> = {
  aktif: ["menunggu", "disetujui", "perlu_pertemuan_lanjutan"],
  riwayat: ["selesai", "ditolak"],
};

/** Gaya status halaman guru (kunci "lanjutan" di data lama = perlu_pertemuan_lanjutan di API). */
const gayaGuru = (s: KonselingStatus) =>
  STATUS_PERMOHONAN[s === "perlu_pertemuan_lanjutan" ? "lanjutan" : s];

export default function GuruPermohonan() {
  const { data, error, loading } = useApi<Konseling[]>("/konseling");

  // Perubahan dari tombol terima/tolak ditimpakan di atas data dari server
  const [ubahan, setUbahan] = useState<Record<number, Konseling>>({});
  const semua = (data ?? []).map((d) => ubahan[d.id] ?? d);

  const [tab, setTab] = useState<Tab>("aktif");

  // Pilihan filter (belum berlaku) dan filter yang sudah diterapkan
  const [pilihStatus, setPilihStatus] = useState("semua");
  const [pilihJenis, setPilihJenis] = useState("semua");
  const [filter, setFilter] = useState({ status: "semua", jenis: "semua" });
  const [halaman, setHalaman] = useState(1);

  const [notif, setNotif] = useState("");
  const [galat, setGalat] = useState("");
  const [proses, setProses] = useState<number | null>(null);
  const [tolakId, setTolakId] = useState<number | null>(null);
  const [alasan, setAlasan] = useState("");
  const [alasanError, setAlasanError] = useState("");

  const jumlahAktif = semua.filter((d) => STATUS_PER_TAB.aktif.includes(d.status)).length;
  const jumlahRiwayat = semua.length - jumlahAktif;

  const daftar = semua.filter((d) => {
    const dalamTab = STATUS_PER_TAB[tab].includes(d.status);
    const cocokStatus = filter.status === "semua" || d.status === filter.status;
    const cocokJenis = filter.jenis === "semua" || d.kategori === filter.jenis;
    return dalamTab && cocokStatus && cocokJenis;
  });

  const totalHalaman = Math.max(1, Math.ceil(daftar.length / PER_HALAMAN));
  const aktifHal = Math.min(halaman, totalHalaman);
  const mulai = (aktifHal - 1) * PER_HALAMAN;
  const tampil = daftar.slice(mulai, mulai + PER_HALAMAN);

  function simpan(baru: Konseling) {
    setUbahan((u) => ({ ...u, [baru.id]: baru }));
  }

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

  async function setuju(p: Konseling) {
    setGalat("");
    setProses(p.id);
    try {
      const baru = await apiFetch<Konseling>(`/konseling/${p.id}/status`, {
        method: "PATCH",
        body: { status: "disetujui" },
      });
      simpan(baru);
      setNotif(`Permohonan ${p.siswa} disetujui.`);
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal menyetujui permohonan.");
    } finally {
      setProses(null);
    }
  }

  function bukaTolak(id: number) {
    setTolakId(id);
    setAlasan("");
    setAlasanError("");
  }

  async function konfirmasiTolak() {
    if (tolakId === null) return;
    if (alasan.trim().length < 10) {
      setAlasanError("Tulis alasan penolakan (minimal 10 karakter).");
      return;
    }
    setGalat("");
    setProses(tolakId);
    try {
      const baru = await apiFetch<Konseling>(`/konseling/${tolakId}/status`, {
        method: "PATCH",
        body: { status: "ditolak", alasan_penolakan: alasan.trim() },
      });
      simpan(baru);
      setNotif(`Permohonan ${baru.siswa} ditolak.`);
      setTolakId(null);
    } catch (err) {
      setAlasanError(err instanceof Error ? err.message : "Gagal menolak permohonan.");
    } finally {
      setProses(null);
    }
  }

  function tekanTombol(e: KeyboardEvent) {
    if (e.key === "Escape") setTolakId(null);
  }

  const target = semua.find((d) => d.id === tolakId);
  const pesanKosong = loading
    ? "Memuat permohonan..."
    : error || "Tidak ada permohonan yang cocok.";

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

      {galat && (
        <p role="alert" className="frm-error">
          {galat}
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
              {gayaGuru(s).label}
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
                    {pesanKosong}
                  </td>
                </tr>
              ) : (
                tampil.map((p) => {
                  const st = gayaGuru(p.status);
                  return (
                    <tr key={p.id}>
                      <td className="gp-name">{p.siswa}</td>
                      <td className="gp-muted">{p.kelas}</td>
                      <td>
                        <span className={"badge-sq-tight " + (KATEGORI_STYLE[p.kategori] ?? "")}>
                          {p.kategori}
                        </span>
                      </td>
                      <td className="gp-topic">{p.topik}</td>
                      <td className="gp-muted">{formatJadwal(p.tanggal, p.waktu)}</td>
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
                                onClick={() => void setuju(p)}
                                disabled={proses === p.id}
                                aria-label={`Setujui permohonan ${p.siswa}`}
                                title="Setujui"
                                className="gp-approve"
                              >
                                <Check className="gp-icon" />
                              </button>
                              <button
                                type="button"
                                onClick={() => bukaTolak(p.id)}
                                disabled={proses === p.id}
                                aria-label={`Tolak permohonan ${p.siswa}`}
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
              {target.siswa} • {target.topik}
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
              <button
                type="button"
                onClick={() => void konfirmasiTolak()}
                disabled={proses === target.id}
                className="btn-danger"
              >
                {proses === target.id ? "Memproses..." : "Tolak Permohonan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}