import { PageMeta } from "@/components/shared/page-meta";
import {
  ALASAN_TOLAK_CONTOH,
  KATEGORI,
  KATEGORI_STYLE,
  type Kategori,
} from "@/data/riwayatContoh";
import {
  PERMOHONAN,
  formatJadwal,
  formatTanggalPendek,
  hasilAwal,
  inisial,
  profilSiswa,
  type Permohonan,
  type StatusPermohonan,
} from "@/data/guruContoh";
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ClipboardClock,
  Download,
  History,
  ListFilter,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useState, type KeyboardEvent, type ReactNode } from "react";

/* -----------------------------------------------------------
   DATA CONTOH: memakai dataset yang sama dengan halaman guru BK.
   Nanti diganti API (GET /api/konseling dengan filter) milik admin.
   ----------------------------------------------------------- */
type Baris = Permohonan & { guru: string };

// Contoh penugasan guru berdasarkan kategori. Nanti dari relasi guru_bk_id di database.
const GURU_KATEGORI: Record<Kategori, string> = {
  Akademik: "Dra. Hj. Siti Aminah",
  Pribadi: "Siska Maharani, S.Psi.",
  Karier: "Rahmat Hidayat, S.Pd.",
  Sosial: "Budi Santoso, S.Psi.",
};

const DATA: Baris[] = PERMOHONAN.map((p) => ({ ...p, guru: GURU_KATEGORI[p.jenis] }));
const DAFTAR_GURU = [...new Set(DATA.map((d) => d.guru))].sort();

const PER_HALAMAN = 5;

/* -----------------------------------------------------------
   Gaya dan helper
   ----------------------------------------------------------- */
const STATUS_LABEL: Record<StatusPermohonan, string> = {
  menunggu: "Menunggu",
  disetujui: "Disetujui",
  lanjutan: "Perlu Pertemuan Lanjutan",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

const STATUS_STYLE: Record<StatusPermohonan, { badge: string; dot: string }> = {
  menunggu: { badge: "tint-orange-700", dot: "dot-orange-500" },
  disetujui: { badge: "tint-blue-700", dot: "dot-blue-600" },
  lanjutan: { badge: "tint-amber-800", dot: "dot-amber-600" },
  selesai: { badge: "tint-green-700", dot: "dot-green-600" },
  ditolak: { badge: "tint-red-700", dot: "dot-red-600" },
};

const AVATAR = ["tint-indigo-700", "tint-orange-700", "tint-blue-700", "tint-slate"];

const angka = (n: number) => new Intl.NumberFormat("id-ID").format(n);
const tanggalHariIni = () => new Date().toLocaleDateString("en-CA");

function nomorHalaman(aktif: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, 2, total, aktif - 1, aktif, aktif + 1]);
  const urut = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const hasil: (number | "…")[] = [];
  urut.forEach((n, i) => {
    if (i > 0 && n - urut[i - 1] > 1) hasil.push("…");
    hasil.push(n);
  });
  return hasil;
}

function StatCard({
  label,
  nilai,
  ikon,
  ikonCls,
  keterangan,
}: {
  label: string;
  nilai: number;
  ikon: ReactNode;
  ikonCls: string;
  keterangan?: string;
}) {
  return (
    <section className="panel flex items-center gap-4 p-5">
      <span className={"grid size-11 shrink-0 place-items-center rounded-lg " + ikonCls}>
        {ikon}
      </span>
      <div>
        <p className="text-[11px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
          {label}
        </p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-white/90">
          {angka(nilai)}
        </p>
        {keterangan && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{keterangan}</p>
        )}
      </div>
    </section>
  );
}

function Bagian({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold tracking-wider text-blue-900 uppercase dark:text-blue-300">
        {judul}
      </p>
      <div className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">
        {children}
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   Halaman
   ----------------------------------------------------------- */
export default function AdminPermohonanPage() {
  const [cari, setCari] = useState("");
  const [kategori, setKategori] = useState("semua");
  const [status, setStatus] = useState("semua");
  const [lanjut, setLanjut] = useState(false);
  const [guru, setGuru] = useState("semua");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");
  const [halaman, setHalaman] = useState(1);
  const [detail, setDetail] = useState<Baris | null>(null);

  const total = DATA.length;
  const menunggu = DATA.filter((d) => d.status === "menunggu").length;
  const selesai = DATA.filter((d) => d.status === "selesai").length;
  const berjalan = DATA.filter((d) => d.status === "disetujui" || d.status === "lanjutan").length;

  const hasil = DATA.filter((d) => {
    const q = cari.trim().toLowerCase();
    return (
      (!q || d.nama.toLowerCase().includes(q)) &&
      (kategori === "semua" || d.jenis === kategori) &&
      (status === "semua" || d.status === status) &&
      (guru === "semua" || d.guru === guru) &&
      (!dari || d.tanggal >= dari) &&
      (!sampai || d.tanggal <= sampai)
    );
  }).sort((a, b) => (a.tanggal < b.tanggal ? 1 : a.tanggal > b.tanggal ? -1 : b.id - a.id));

  const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN));
  const aktif = Math.min(halaman, totalHalaman);
  const mulai = (aktif - 1) * PER_HALAMAN;
  const tampil = hasil.slice(mulai, mulai + PER_HALAMAN);

  const ada = (fn: (v: string) => void) => (v: string) => {
    fn(v);
    setHalaman(1);
  };

  function resetFilter() {
    setCari("");
    setKategori("semua");
    setStatus("semua");
    setGuru("semua");
    setDari("");
    setSampai("");
    setHalaman(1);
  }

  function unduh() {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const baris = [
      ["Tanggal", "Nama Siswa", "Kelas", "Kategori", "Topik", "Guru BK", "Status"],
      ...hasil.map((d) => [
        formatTanggalPendek(d.tanggal),
        d.nama,
        d.kelas,
        d.jenis,
        d.topik,
        d.guru,
        STATUS_LABEL[d.status],
      ]),
    ].map((r) => r.map(esc).join(","));
    const blob = new Blob(["\uFEFF" + baris.join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `riwayat-konseling-${tanggalHariIni()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function tekan(e: KeyboardEvent) {
    if (e.key === "Escape") setDetail(null);
  }

  const profil = detail ? profilSiswa(detail) : null;
  const hasilSesi = detail ? hasilAwal(detail) : null;
  const sudahSesi = detail?.status === "selesai" || detail?.status === "lanjutan";

  return (
    <>
      <PageMeta
        title="Riwayat Konseling | BK SMAN 2 Mandau"
        description="Riwayat konseling seluruh siswa SMAN 2 Mandau"
      />

      <div className="space-y-6">
        {/* Judul */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">
              Riwayat Konseling
            </h1>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
              Tinjau dan kelola riwayat sesi konseling seluruh siswa.
            </p>
          </div>
          <button
            type="button"
            onClick={unduh}
            disabled={hasil.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="size-4" />
            Unduh Laporan
          </button>
        </div>

        {/* Ringkasan */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Kasus"
            nilai={total}
            ikon={<History className="size-5" />}
            ikonCls="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
          />
          <StatCard
            label="Menunggu"
            nilai={menunggu}
            ikon={<ClipboardClock className="size-5" />}
            ikonCls="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300"
          />
          <StatCard
            label="Selesai"
            nilai={selesai}
            ikon={<CircleCheck className="size-5" />}
            ikonCls="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-300"
          />
          <StatCard
            label="Berjalan"
            nilai={berjalan}
            ikon={<RefreshCw className="size-5" />}
            ikonCls="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
            keterangan="Disetujui dan perlu pertemuan lanjutan"
          />
        </div>

        {/* Tabel */}
        <section className="panel panel-clip">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-white/3">
            <label className="flex w-full items-center gap-2 rounded-md border border-gray-300 bg-white px-3 sm:w-56 dark:border-gray-700 dark:bg-gray-900">
              <Search className="size-4 shrink-0 text-gray-400" />
              <input
                type="search"
                value={cari}
                onChange={(e) => ada(setCari)(e.target.value)}
                placeholder="Cari nama siswa..."
                aria-label="Cari nama siswa"
                className="w-full border-0 bg-transparent p-0 py-2 text-sm text-gray-800 shadow-none outline-none placeholder:text-gray-400 focus:border-0 focus:ring-0 dark:text-white/90"
              />
            </label>
            <select
              value={kategori}
              onChange={(e) => ada(setKategori)(e.target.value)}
              aria-label="Filter kategori"
              className="field-select"
            >
              <option value="semua">Semua Kategori</option>
              {KATEGORI.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => ada(setStatus)(e.target.value)}
              aria-label="Filter status"
              className="field-select"
            >
              <option value="semua">Semua Status</option>
              {(Object.keys(STATUS_LABEL) as StatusPermohonan[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLanjut((v) => !v)}
                aria-expanded={lanjut}
                aria-label="Filter lanjutan"
                title="Filter lanjutan"
                className={
                  "rounded-md border p-2 " +
                  (lanjut
                    ? "border-blue-800 bg-blue-50 text-blue-800 dark:bg-blue-500/10"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300")
                }
              >
                <ListFilter className="size-4" />
              </button>
              <button
                type="button"
                onClick={unduh}
                disabled={hasil.length === 0}
                aria-label="Unduh data terfilter"
                title="Unduh data terfilter"
                className="rounded-md border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <Download className="size-4" />
              </button>
            </div>
          </div>

          {lanjut && (
            <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-5 py-3 dark:border-gray-800">
              <select
                value={guru}
                onChange={(e) => ada(setGuru)(e.target.value)}
                aria-label="Filter guru BK"
                className="field-select"
              >
                <option value="semua">Semua Guru BK</option>
                {DAFTAR_GURU.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                Dari
                <input
                  type="date"
                  value={dari}
                  onChange={(e) => ada(setDari)(e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className="field-date"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                Sampai
                <input
                  type="date"
                  value={sampai}
                  onChange={(e) => ada(setSampai)(e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className="field-date"
                />
              </label>
              <button
                type="button"
                onClick={resetFilter}
                className="ml-auto text-sm font-semibold text-blue-800 hover:underline dark:text-blue-400"
              >
                Reset Filter
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead className="bg-gray-100 text-[11px] font-semibold tracking-wider text-gray-600 dark:bg-white/5 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-3">TANGGAL</th>
                  <th className="px-3 py-3">NAMA SISWA</th>
                  <th className="px-3 py-3">KATEGORI</th>
                  <th className="px-3 py-3">GURU BK</th>
                  <th className="px-3 py-3">STATUS</th>
                  <th className="px-5 py-3 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {tampil.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500">
                      Tidak ada data konseling yang cocok.
                    </td>
                  </tr>
                ) : (
                  tampil.map((d, i) => {
                    const st = STATUS_STYLE[d.status];
                    return (
                      <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-white/3">
                        <td className="px-5 py-4 font-medium text-gray-900 dark:text-white/90">
                          {formatTanggalPendek(d.tanggal)}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={
                                "grid size-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold " +
                                AVATAR[(mulai + i) % AVATAR.length]
                              }
                            >
                              {inisial(d.nama)}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white/90">
                              {d.nama}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={
                              "rounded px-2 py-0.5 text-[10px] font-bold uppercase " +
                              KATEGORI_STYLE[d.jenis]
                            }
                          >
                            {d.jenis}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-gray-700 dark:text-gray-300">{d.guru}</td>
                        <td className="px-3 py-4">
                          <span
                            className={
                              "inline-flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-bold uppercase " +
                              st.badge
                            }
                          >
                            <span className={"size-1.5 rounded-full " + st.dot} />
                            {STATUS_LABEL[d.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setDetail(d)}
                            aria-label={`Detail konseling ${d.nama}`}
                            className="text-xs font-semibold text-blue-800 hover:underline dark:text-blue-400"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-white/3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {hasil.length === 0
                ? "Menampilkan 0 data"
                : `Menampilkan ${mulai + 1}-${mulai + tampil.length} dari ${angka(hasil.length)} data`}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setHalaman(Math.max(1, aktif - 1))}
                disabled={aktif === 1}
                aria-label="Halaman sebelumnya"
                className="grid size-8 place-items-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <ChevronLeft className="size-4" />
              </button>
              {nomorHalaman(aktif, totalHalaman).map((n, i) =>
                n === "…" ? (
                  <span key={`t${i}`} className="px-1 text-gray-400">…</span>
                ) : (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setHalaman(n)}
                    aria-current={n === aktif ? "page" : undefined}
                    className={
                      "grid h-8 min-w-8 place-items-center rounded-md border px-2 text-xs font-semibold " +
                      (n === aktif
                        ? "border-blue-900 bg-blue-900 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300")
                    }
                  >
                    {n}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => setHalaman(Math.min(totalHalaman, aktif + 1))}
                disabled={aktif === totalHalaman}
                aria-label="Halaman berikutnya"
                className="grid size-8 place-items-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Dialog detail (hanya baca) */}
      {detail && profil && hasilSesi && (
        <div
          className="fixed inset-0 z-99999 grid place-items-start overflow-y-auto bg-gray-900/50 p-4 sm:place-items-center"
          onKeyDown={tekan}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-detail-konseling"
            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="judul-detail-konseling"
                  className="text-lg font-bold text-gray-900 dark:text-white/90"
                >
                  Detail Konseling
                </h2>
                <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                  {detail.topik}
                </p>
              </div>
              <button
                type="button"
                autoFocus
                onClick={() => setDetail(null)}
                aria-label="Tutup detail"
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <X className="size-5" />
              </button>
            </div>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Siswa", `${detail.nama} (${detail.kelas})`],
                ["NISN", profil.nisn],
                ["Kategori", detail.jenis],
                ["Guru BK", detail.guru],
                ["Jadwal", formatJadwal(detail.tanggal, detail.jam)],
                ["Status", STATUS_LABEL[detail.status]],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] text-gray-500 dark:text-gray-400">{k}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white/90">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 space-y-4 border-t border-gray-200 pt-5 dark:border-gray-800">
              <Bagian judul="Deskripsi Masalah (Siswa)">{profil.deskripsi}</Bagian>

              {sudahSesi && (
                <>
                  <Bagian judul="Deskripsi Kegiatan">{hasilSesi.deskripsi}</Bagian>
                  <Bagian judul="Hasil Kegiatan">{hasilSesi.hasil}</Bagian>
                  <Bagian judul="Evaluasi dan Tindak Lanjut">{hasilSesi.evaluasi}</Bagian>
                </>
              )}
              {detail.status === "ditolak" && (
                <Bagian judul="Alasan Penolakan">{ALASAN_TOLAK_CONTOH}</Bagian>
              )}
              {!sudahSesi && detail.status !== "ditolak" && (
                <p className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 ring-1 ring-gray-200 dark:bg-white/5 dark:text-gray-400 dark:ring-gray-800">
                  Hasil konseling belum tersedia. Guru BK mengisinya setelah sesi selesai.
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
