import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleEllipsis,
  CircleX,
  ExternalLink,
  FileText,
  Search,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import Breadcrumb from "@/components/bk/Breadcrumb";
import { KATEGORI_STYLE, formatTanggal } from "@/data/riwayatContoh";
import {
  gayaStatus,
  hitungRingkasan,
  useApi,
  type Konseling,
  type KonselingStatus,
} from "@/lib/konselingApi";

const PER_HALAMAN = 5;

function StatCard({
  label,
  nilai,
  keterangan,
  ikon,
}: {
  label: string;
  nilai: number;
  keterangan: string;
  ikon: ReactNode;
}) {
  return (
    <section className="sr-stat">
      <div className="sr-stat-top">
        <p className="sr-stat-label">{label}</p>
        {ikon}
      </div>
      <p className="sr-stat-value">{nilai}</p>
      <p className="sr-stat-note">{keterangan}</p>
    </section>
  );
}

export default function SiswaRiwayat() {
  const { data, error, loading } = useApi<Konseling[]>("/konseling");
  const daftar = useMemo(() => data ?? [], [data]);

  const [cari, setCari] = useState("");
  const [filter, setFilter] = useState<KonselingStatus | "semua">("semua");
  const [halaman, setHalaman] = useState(1);

  const ringkasan = hitungRingkasan(daftar);

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return daftar.filter((r) => {
      if (filter !== "semua" && r.status !== filter) return false;
      if (!q) return true;
      return [
        r.kategori,
        r.guru,
        r.topik,
        formatTanggal(r.tanggal),
        gayaStatus(r.status).label,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [daftar, cari, filter]);

  const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN));
  const aktif = Math.min(halaman, totalHalaman);
  const mulai = (aktif - 1) * PER_HALAMAN;
  const tampil = hasil.slice(mulai, mulai + PER_HALAMAN);

  const keHalaman = (n: number) =>
    setHalaman(Math.min(Math.max(1, n), totalHalaman));

  const pesanKosong = loading
    ? "Memuat riwayat..."
    : error || "Tidak ada riwayat yang cocok.";

  return (
    <div className="sr-page">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", to: "/siswa" },
            { label: "Riwayat Konseling" },
          ]}
        />
        <h1 className="sr-title">Riwayat Konseling</h1>
      </div>

      {/* Ringkasan */}
      <div className="sr-stats">
        <StatCard
          label="Total pengajuan saya"
          nilai={ringkasan.total}
          keterangan="Seluruh pengajuan"
          ikon={<FileText className="sr-icon-blue" />}
        />
        <StatCard
          label="Menunggu"
          nilai={ringkasan.menunggu}
          keterangan="Butuh tindak lanjut Guru BK"
          ikon={<CircleEllipsis className="sr-icon-amber" />}
        />
        <StatCard
          label="Selesai"
          nilai={ringkasan.selesai}
          keterangan="Konseling telah dituntaskan"
          ikon={<CircleCheck className="sr-icon-sky" />}
        />
        <StatCard
          label="Ditolak"
          nilai={ringkasan.ditolak}
          keterangan="Memerlukan pengajuan ulang"
          ikon={<CircleX className="sr-icon-red" />}
        />
      </div>

      {/* Tabel */}
      <section className="sr-card">
        <div className="sr-toolbar">
          <label className="sr-search">
            <Search className="sr-search-icon" />
            <input
              type="search"
              value={cari}
              onChange={(e) => {
                setCari(e.target.value);
                setHalaman(1);
              }}
              placeholder="Cari riwayat..."
              aria-label="Cari riwayat"
              className="sr-search-input"
            />
          </label>

          <label className="sr-filter-label">
            Filter Status:
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as KonselingStatus | "semua");
                setHalaman(1);
              }}
              className="dashboard-select"
            >
              <option value="semua">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="disetujui">Disetujui</option>
              <option value="selesai">Selesai</option>
              <option value="perlu_pertemuan_lanjutan">Perlu Pertemuan Lanjutan</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </label>
        </div>

        <div className="ui-table-wrap">
          <table className="sr-table">
            <thead className="sr-thead">
              <tr>
                <th>TANGGAL</th>
                <th>KATEGORI</th>
                <th>GURU BK</th>
                <th>STATUS</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody className="sr-tbody">
              {tampil.length === 0 ? (
                <tr>
                  <td colSpan={5} className="sr-empty">
                    {pesanKosong}
                  </td>
                </tr>
              ) : (
                tampil.map((r) => {
                  const st = gayaStatus(r.status);
                  return (
                    <tr key={r.id}>
                      <td className="sr-date">{formatTanggal(r.tanggal)}</td>
                      <td>
                        <span className={"sr-badge " + (KATEGORI_STYLE[r.kategori] ?? "")}>
                          {r.kategori}
                        </span>
                      </td>
                      <td className="sr-guru">{r.guru}</td>
                      <td>
                        <span className={"sr-status " + st.badge}>
                          <span className={"dot " + st.dot} />
                          {st.label}
                        </span>
                      </td>
                      <td>
                        <Link to={`/siswa/riwayat/${r.id}`} className="sr-link">
                          Lihat Detail
                          <ExternalLink className="sr-link-icon" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="sr-foot">
          <p className="pg-info">
            {hasil.length === 0
              ? "Menampilkan 0 riwayat"
              : `Menampilkan ${mulai + 1}-${mulai + tampil.length} dari ${hasil.length} riwayat`}
          </p>
          <div className="ui-page-list">
            <button
              type="button"
              onClick={() => keHalaman(aktif - 1)}
              disabled={aktif === 1}
              aria-label="Halaman sebelumnya"
              className="pg-btn"
            >
              <ChevronLeft className="sr-icon-sm" />
            </button>
            {Array.from({ length: totalHalaman }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => keHalaman(n)}
                aria-current={n === aktif ? "page" : undefined}
                className={"pg-num " + (n === aktif ? "pg-num-on" : "pg-num-off")}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => keHalaman(aktif + 1)}
              disabled={aktif === totalHalaman}
              aria-label="Halaman berikutnya"
              className="pg-btn"
            >
              <ChevronRight className="sr-icon-sm" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}