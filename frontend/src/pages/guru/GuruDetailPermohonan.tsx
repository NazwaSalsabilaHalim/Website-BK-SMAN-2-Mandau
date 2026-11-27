import { CircleCheck, History, Info, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { STATUS_PERMOHONAN, inisial } from "@/data/guruContoh";
import { KATEGORI_STYLE } from "@/data/riwayatContoh";
import {
  ApiError,
  apiFetch,
  punyaHasil,
  useApi,
  type Konseling,
  type RencanaTindak,
} from "@/lib/konselingApi";

type StatusForm = "menunggu" | "disetujui" | "ditolak";

type FormState = {
  status: StatusForm;
  alasan: string;
  tanggal: string;
  waktu: string;
  deskripsi: string;
  hasil: string;
  evaluasi: string;
  rencana: RencanaTindak[];
  penyelesaian: "selesai" | "lanjutan";
};

type Errors = Partial<Record<keyof FormState, string>>;

const MAKS_RENCANA = 10;

/** Nama field di API -> nama field di form */
const PETA_FIELD: Record<string, keyof FormState> = {
  alasan_penolakan: "alasan",
  tanggal: "tanggal",
  waktu: "waktu",
  deskripsi_kegiatan: "deskripsi",
  hasil_konseling: "hasil",
  evaluasi: "evaluasi",
};

const fieldDari = (kunci: string): keyof FormState | undefined =>
  PETA_FIELD[kunci] ??
  (kunci.startsWith("rencana_tindak_lanjut") ? "rencana" : undefined);

function awalDari(k: Konseling): FormState {
  return {
    status: k.status === "menunggu" ? "menunggu" : "disetujui",
    alasan: "",
    tanggal: k.tanggal,
    waktu: k.waktu,
    deskripsi: k.deskripsi_kegiatan,
    hasil: k.hasil_konseling,
    evaluasi: k.evaluasi,
    rencana: k.rencana_tindak_lanjut.map((r) => ({ judul: r.judul, isi: r.isi })),
    penyelesaian: k.status === "perlu_pertemuan_lanjutan" ? "lanjutan" : "selesai",
  };
}

/** 2026-11-24T08:45:00+07:00 -> "24 November 2026 — 08:45 WIB" */
function formatDiajukan(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const tgl = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const jam = d
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(".", ":");
  return `${tgl} — ${jam} WIB`;
}

/** Kunci "lanjutan" di data lama = perlu_pertemuan_lanjutan di API. */
const gayaGuru = (s: Konseling["status"]) =>
  STATUS_PERMOHONAN[s === "perlu_pertemuan_lanjutan" ? "lanjutan" : s];

function Kotak({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <section className="gd-box">
      <h2 className="gd-box-title">{judul}</h2>
      <div className="gd-box-body">{children}</div>
    </section>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="gd-label">
      {children}
    </label>
  );
}

function Galat({ pesan }: { pesan?: string }) {
  return pesan ? (
    <p role="alert" className="frm-error">
      {pesan}
    </p>
  ) : null;
}

function Formulir({
  item,
  totalSesi,
  onUbah,
}: {
  item: Konseling;
  totalSesi: number;
  onUbah: (k: Konseling) => void;
}) {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(() => awalDari(item));
  const [errors, setErrors] = useState<Errors>({});
  const [galat, setGalat] = useState("");
  const [loading, setLoading] = useState(false);
  const [tersimpan, setTersimpan] = useState(false);
  const [hariIni] = useState(() => new Date().toLocaleDateString("en-CA"));

  const menunggu = item.status === "menunggu";
  const hasilAktif =
    (menunggu && form.status === "disetujui") ||
    item.status === "disetujui" ||
    item.status === "perlu_pertemuan_lanjutan";
  const jadwalAktif = menunggu && form.status !== "ditolak";
  const adaYangDisimpan = menunggu || hasilAktif;

  const pesanNonaktif =
    item.status === "selesai"
      ? "Sesi sudah selesai, hasil konseling tidak bisa diubah."
      : item.status === "ditolak"
        ? "Permohonan ini ditolak, jadi tidak ada hasil konseling."
        : "Form ini aktif setelah permohonan berstatus Disetujui.";

  function ubah<K extends keyof FormState>(key: K, nilai: FormState[K]) {
    setForm((f) => ({ ...f, [key]: nilai }));
    setTersimpan(false);
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function tambahRencana() {
    if (form.rencana.length >= MAKS_RENCANA) return;
    ubah("rencana", [...form.rencana, { judul: "", isi: "" }]);
  }

  function ubahRencana(i: number, kunci: keyof RencanaTindak, nilai: string) {
    ubah(
      "rencana",
      form.rencana.map((r, idx) => (idx === i ? { ...r, [kunci]: nilai } : r)),
    );
  }

  function hapusRencana(i: number) {
    ubah(
      "rencana",
      form.rencana.filter((_, idx) => idx !== i),
    );
  }

  function validasi(): Errors {
    const e: Errors = {};

    if (menunggu) {
      if (form.status === "menunggu") e.status = "Pilih Disetujui atau Ditolak.";
      if (form.status === "ditolak" && form.alasan.trim().length < 10) {
        e.alasan = "Tulis alasan penolakan (minimal 10 karakter).";
      }
      if (form.status === "disetujui") {
        if (!form.tanggal) e.tanggal = "Pilih tanggal pertemuan.";
        if (!form.waktu) e.waktu = "Pilih waktu pertemuan.";
      }
    }

    if (hasilAktif) {
      const adaIsi = [form.deskripsi, form.hasil, form.evaluasi].some((v) => v.trim());
      // Saat menyetujui, hasil boleh dikosongkan. Untuk sesi yang sudah disetujui, hasil wajib.
      if (adaIsi || !menunggu) {
        if (!form.deskripsi.trim()) e.deskripsi = "Deskripsi kegiatan wajib diisi.";
        if (!form.hasil.trim()) e.hasil = "Hasil kegiatan wajib diisi.";
        if (!form.evaluasi.trim()) e.evaluasi = "Evaluasi dan tindak lanjut wajib diisi.";
      }

      const setengah = form.rencana.some(
        (r) => Boolean(r.judul.trim()) !== Boolean(r.isi.trim()),
      );
      if (setengah) {
        e.rencana = "Isi judul dan isi rencana, atau hapus barisnya.";
      }
    }
    return e;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setGalat("");
    setTersimpan(false);
    const e = validasi();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      let terkini = item;

      // Langkah 1: setujui atau tolak (hanya dari status menunggu)
      if (menunggu && form.status !== "menunggu") {
        const body =
          form.status === "ditolak"
            ? { status: "ditolak", alasan_penolakan: form.alasan.trim() }
            : {
                status: "disetujui",
                ...(form.tanggal !== item.tanggal ? { tanggal: form.tanggal } : {}),
                ...(form.waktu !== item.waktu ? { waktu: form.waktu } : {}),
              };
        terkini = await apiFetch<Konseling>(`/konseling/${item.id}/status`, {
          method: "PATCH",
          body,
        });
        onUbah(terkini);
      }

      // Langkah 2: simpan hasil konseling
      const bisaIsiHasil =
        terkini.status === "disetujui" || terkini.status === "perlu_pertemuan_lanjutan";
      const hasilLengkap =
        form.deskripsi.trim() && form.hasil.trim() && form.evaluasi.trim();

      if (bisaIsiHasil && hasilLengkap) {
        terkini = await apiFetch<Konseling>(`/konseling/${item.id}/hasil`, {
          method: "PATCH",
          body: {
            status: form.penyelesaian === "selesai" ? "selesai" : "perlu_pertemuan_lanjutan",
            deskripsi_kegiatan: form.deskripsi.trim(),
            hasil_konseling: form.hasil.trim(),
            evaluasi: form.evaluasi.trim(),
            rencana_tindak_lanjut: form.rencana
              .filter((r) => r.judul.trim() && r.isi.trim())
              .map((r) => ({ judul: r.judul.trim(), isi: r.isi.trim() })),
          },
        });
        onUbah(terkini);
      }

      setTersimpan(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const baru: Errors = {};
        for (const [kunci, pesan] of Object.entries(err.errors)) {
          const field = fieldDari(kunci);
          if (field) baru[field] = pesan[0];
        }
        setErrors(baru);
        if (Object.keys(baru).length === 0) setGalat(err.message);
      } else {
        setGalat(err instanceof Error ? err.message : "Gagal menyimpan perubahan.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Nama class untuk border error; kondisi normal sudah diurus dashboard-input
  const bd = (k: keyof FormState) => (errors[k] ? "gd-invalid" : "");

  const st = gayaGuru(item.status);

  return (
    <form onSubmit={(ev) => void handleSubmit(ev)} noValidate className="gd-form">
      <div className="gd-grid">
        {/* Kolom kiri: profil siswa */}
        <div className="gd-side">
          <section className="gd-profile">
            <span className="gd-profile-avatar">{inisial(item.siswa)}</span>
            <h1 className="gd-profile-name">{item.siswa}</h1>
            <p className="gd-profile-nisn">NIS: {item.nis || "-"}</p>

            <dl className="gd-facts">
              <div className="gd-fact">
                <dt className="gd-fact-label">KELAS</dt>
                <dd className="gd-fact-value">{item.kelas}</dd>
              </div>
              <div className="gd-fact gd-fact-row">
                <div>
                  <dt className="gd-fact-label gd-fact-label-accent">TOTAL SESI</dt>
                  <dd className="gd-fact-value gd-fact-value-accent">{totalSesi} Kali</dd>
                </div>
                <History className="gd-fact-icon" />
              </div>
            </dl>
          </section>
        </div>

        {/* Kolom kanan */}
        <div className="gd-main">
          <Kotak judul="Detail Permohonan">
            <div className="gd-detail-grid">
              <div>
                <p className="gd-meta-label">Kategori Masalah</p>
                <div className="gd-cat-row">
                  <span className={"badge-sq-tight " + (KATEGORI_STYLE[item.kategori] ?? "")}>
                    {item.kategori}
                  </span>
                  <span className="gd-value">{item.topik}</span>
                </div>
              </div>
              <div>
                <p className="gd-meta-label">Tanggal Pengajuan</p>
                <p className="gd-value gd-value-mt">{formatDiajukan(item.dibuat)}</p>
              </div>
            </div>
            <p className="gd-meta-label gd-meta-label-top">Deskripsi Masalah (Siswa)</p>
            <blockquote className="gd-quote">“{item.deskripsi}”</blockquote>
          </Kotak>

          <div className="gd-pair">
            <Kotak judul="Status Permohonan">
              {menunggu ? (
                <>
                  <Label htmlFor="status">Update Status</Label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) => ubah("status", e.target.value as StatusForm)}
                    className={"dashboard-input " + bd("status")}
                  >
                    <option value="menunggu">Menunggu</option>
                    <option value="disetujui">Disetujui</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                  <Galat pesan={errors.status} />
                </>
              ) : null}
              <p className="gd-status-hint">
                Status saat ini:{" "}
                <span className={"semibold " + st.teks}>{st.label}</span>
              </p>

              {item.status === "ditolak" && item.alasan_penolakan && (
                <p className="gd-status-hint">Alasan penolakan: {item.alasan_penolakan}</p>
              )}

              {menunggu && form.status === "ditolak" && (
                <div className="gd-reject">
                  <Label htmlFor="alasan">Alasan penolakan</Label>
                  <textarea
                    id="alasan"
                    rows={3}
                    value={form.alasan}
                    onChange={(e) => ubah("alasan", e.target.value)}
                    placeholder="Contoh: Jadwal bertabrakan dengan kegiatan sekolah."
                    className={"dashboard-input " + bd("alasan")}
                  />
                  <Galat pesan={errors.alasan} />
                </div>
              )}
            </Kotak>

            <Kotak judul="Jadwal Pertemuan">
              <Label htmlFor="tanggal">Pilih Tanggal &amp; Waktu</Label>
              <div className="gd-stack">
                <input
                  id="tanggal"
                  type="date"
                  min={hariIni}
                  value={form.tanggal}
                  disabled={!jadwalAktif}
                  onChange={(e) => ubah("tanggal", e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className={"dashboard-input " + bd("tanggal")}
                />
                <Galat pesan={errors.tanggal} />
                <input
                  id="waktu"
                  type="time"
                  aria-label="Waktu pertemuan"
                  value={form.waktu}
                  disabled={!jadwalAktif}
                  onChange={(e) => ubah("waktu", e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className={"dashboard-input " + bd("waktu")}
                />
                <Galat pesan={errors.waktu} />
              </div>
            </Kotak>
          </div>

          {/* Form hasil konseling */}
          <section className="gd-box">
            <div className="gd-result-head">
              <h2 className="gd-result-title">Form Hasil Konseling</h2>
              <span className="gd-result-tag">CONFIDENTIAL</span>
            </div>

            <div className="gd-result-body">
              {!hasilAktif && (
                <p className="gd-inactive">
                  <Info className="gd-icon gd-icon-shrink" />
                  {pesanNonaktif}
                </p>
              )}

              <div>
                <Label htmlFor="deskripsi">Deskripsi Kegiatan / Permasalahan</Label>
                <textarea
                  id="deskripsi"
                  rows={4}
                  value={form.deskripsi}
                  disabled={!hasilAktif}
                  onChange={(e) => ubah("deskripsi", e.target.value)}
                  placeholder="Uraikan detail jalannya sesi dan eksplorasi masalah..."
                  className={"dashboard-input " + bd("deskripsi")}
                />
                <Galat pesan={errors.deskripsi} />
              </div>

              <div>
                <Label htmlFor="hasil">Hasil Kegiatan</Label>
                <textarea
                  id="hasil"
                  rows={4}
                  value={form.hasil}
                  disabled={!hasilAktif}
                  onChange={(e) => ubah("hasil", e.target.value)}
                  placeholder="Apa saja solusi atau perubahan mindset yang dicapai? (satu poin per baris)"
                  className={"dashboard-input " + bd("hasil")}
                />
                <Galat pesan={errors.hasil} />
              </div>

              <div>
                <Label htmlFor="evaluasi">Evaluasi dan Tindak Lanjut</Label>
                <textarea
                  id="evaluasi"
                  rows={4}
                  value={form.evaluasi}
                  disabled={!hasilAktif}
                  onChange={(e) => ubah("evaluasi", e.target.value)}
                  placeholder="Kesimpulan konselor dan langkah selanjutnya untuk siswa..."
                  className={"dashboard-input " + bd("evaluasi")}
                />
                <Galat pesan={errors.evaluasi} />
              </div>

              {/* Rencana tindakan (opsional) */}
              <div>
                <Label htmlFor="rencana-0">Rencana Tindakan (opsional)</Label>
                <div className="flex flex-col gap-3">
                  {form.rencana.length === 0 && (
                    <p className="gd-status-hint">
                      Belum ada rencana tindakan. Klik Tambah Rencana untuk membuat.
                    </p>
                  )}

                  {form.rencana.map((r, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3"
                    >
                      <input
                        id={`rencana-${i}`}
                        type="text"
                        value={r.judul}
                        disabled={!hasilAktif}
                        maxLength={150}
                        onChange={(e) => ubahRencana(i, "judul", e.target.value)}
                        placeholder="Judul rencana, contoh: Menyusun jadwal mingguan"
                        aria-label={`Judul rencana ${i + 1}`}
                        className={"dashboard-input " + bd("rencana")}
                      />
                      <textarea
                        rows={2}
                        value={r.isi}
                        disabled={!hasilAktif}
                        onChange={(e) => ubahRencana(i, "isi", e.target.value)}
                        placeholder="Isi rencana: apa yang harus dilakukan siswa"
                        aria-label={`Isi rencana ${i + 1}`}
                        className={"dashboard-input " + bd("rencana")}
                      />
                      {hasilAktif && (
                        <button
                          type="button"
                          onClick={() => hapusRencana(i)}
                          aria-label={`Hapus rencana ${i + 1}`}
                          className="gd-cancel flex items-center gap-1 self-end"
                        >
                          <Trash2 className="gd-icon" />
                          Hapus
                        </button>
                      )}
                    </div>
                  ))}

                  <Galat pesan={errors.rencana} />

                  {hasilAktif && form.rencana.length < MAKS_RENCANA && (
                    <button
                      type="button"
                      onClick={tambahRencana}
                      className="gd-cancel flex items-center gap-1 self-start"
                    >
                      <Plus className="gd-icon" />
                      Tambah Rencana
                    </button>
                  )}
                </div>
              </div>

              <div className="gd-result-foot">
                <Label htmlFor="penyelesaian">Status Penyelesaian</Label>
                <select
                  id="penyelesaian"
                  value={form.penyelesaian}
                  disabled={!hasilAktif}
                  onChange={(e) =>
                    ubah("penyelesaian", e.target.value as FormState["penyelesaian"])
                  }
                  className="dashboard-input gd-select-narrow"
                >
                  <option value="selesai">Selesai (Case Closed)</option>
                  <option value="lanjutan">Perlu Pertemuan Lanjutan</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      </div>

      {tersimpan && (
        <p role="status" className="gd-saved">
          <CircleCheck className="gd-icon" />
          Perubahan tersimpan.
        </p>
      )}

      {galat && (
        <p role="alert" className="frm-error">
          {galat}
        </p>
      )}

      {/* Aksi */}
      <div className="gd-actions">
        <p className="gd-actions-note">
          <ShieldCheck className="gd-icon" />
          Perubahan disimpan ke database saat kamu menekan Simpan Perubahan.
        </p>
        <div className="gd-actions-btns">
          <button
            type="button"
            onClick={() => void navigate("/guru/permohonan")}
            className="gd-cancel"
          >
            Kembali
          </button>
          <button
            type="submit"
            disabled={loading || !adaYangDisimpan}
            className="btn-primary-bk btn-wide"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function GuruDetailPermohonan() {
  const { id } = useParams();
  const { data, error, loading } = useApi<Konseling[]>("/konseling");
  const [ubahan, setUbahan] = useState<Konseling | null>(null);

  if (loading) {
    return (
      <div className="soon-box">
        <h1 className="soon-title">Memuat permohonan...</h1>
      </div>
    );
  }

  const daftar = data ?? [];
  const dasar = daftar.find((p) => String(p.id) === id);

  if (!dasar) {
    return (
      <div className="soon-box">
        <h1 className="soon-title">Permohonan tidak ditemukan</h1>
        <p className="soon-text">
          {error || "Data permohonan yang kamu cari tidak ada."}
        </p>
        <Link to="/guru/permohonan" className="soon-link">
          Kembali ke Permohonan
        </Link>
      </div>
    );
  }

  const item = ubahan && ubahan.id === dasar.id ? ubahan : dasar;
  const totalSesi = daftar.filter(
    (k) => k.nis === item.nis && punyaHasil(k.status),
  ).length;

  // key memastikan form dibuat ulang saat pindah ke permohonan lain
  return <Formulir key={item.id} item={item} totalSesi={totalSesi} onUbah={setUbahan} />;
}