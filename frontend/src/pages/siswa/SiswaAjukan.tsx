import {
  CircleCheck,
  Info,
  NotebookPen,
  Send,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import Breadcrumb from "../../components/bk/Breadcrumb";
import { getSession } from "../../lib/bkAuth";
import {
  GURU_BK,
  KATEGORI,
  RIWAYAT,
  STATUS_STYLE,
  hitungRingkasan,
} from "../../data/riwayatContoh";

/* Data profil contoh. Nanti dari API (/api/me atau tabel siswa). */
const PROFIL = { nisn: "0092348512", kelas: "Kelas XII - MIPA 1" };

const LANGKAH = [
  "Isi formulir pengajuan dengan data yang akurat dan deskripsi jelas.",
  "Guru BK akan mereview jadwal dan memberikan konfirmasi melalui sistem.",
  "Pastikan Anda hadir tepat waktu di ruang BK SMAN 2 Mandau.",
];

type FormState = {
  jenis: string;
  guru: string;
  topik: string;
  deskripsi: string;
  tanggal: string;
  waktu: string;
};

const KOSONG: FormState = {
  jenis: "",
  guru: "",
  topik: "",
  deskripsi: "",
  tanggal: "",
  waktu: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

function Field({
  label,
  htmlFor,
  error,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="sa-label">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="frm-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default function SiswaAjukan() {
  const navigate = useNavigate();
  const session = getSession();
  const nama = session?.name || "Siswa";

  // Tanggal hari ini (yyyy-mm-dd) sebagai batas minimal pilihan tanggal
  const [hariIni] = useState(() => new Date().toLocaleDateString("en-CA"));

  const [form, setForm] = useState<FormState>(KOSONG);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [terkirim, setTerkirim] = useState(false);

  const ringkasan = hitungRingkasan(RIWAYAT);
  const statusTerakhir = STATUS_STYLE[RIWAYAT[0].status];

  function ubah<K extends keyof FormState>(key: K, nilai: FormState[K]) {
    setForm((f) => ({ ...f, [key]: nilai }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validasi(): Errors {
    const e: Errors = {};
    if (!form.jenis) e.jenis = "Pilih jenis layanan.";
    if (!form.guru) e.guru = "Pilih Guru BK tujuan.";
    if (!form.topik.trim()) e.topik = "Topik permasalahan wajib diisi.";
    if (!form.deskripsi.trim()) {
      e.deskripsi = "Deskripsi permasalahan wajib diisi.";
    } else if (form.deskripsi.trim().length < 20) {
      e.deskripsi = "Ceritakan sedikit lebih jelas (minimal 20 karakter).";
    }
    if (!form.tanggal) e.tanggal = "Pilih tanggal yang diinginkan.";
    else if (form.tanggal < hariIni) e.tanggal = "Tanggal tidak boleh sebelum hari ini.";
    if (!form.waktu) e.waktu = "Pilih waktu yang diinginkan.";
    return e;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    const e = validasi();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    // TODO: kirim ke backend -> POST /api/konseling (header Authorization: Bearer token).
    // Sementara ini hanya simulasi supaya alur tampilan bisa dicoba.
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setTerkirim(true);
  }

  function ajukanLagi() {
    setForm(KOSONG);
    setErrors({});
    setTerkirim(false);
  }

  const bukaPicker = (el: HTMLInputElement) => {
    // Ikon bawaan input tanggal/waktu disembunyikan template, jadi picker dibuka manual.
    try {
      el.showPicker?.();
    } catch {
      // browser tanpa showPicker: input tetap bisa diketik
    }
  };

  // Nama class untuk border error; kondisi normal sudah diurus dashboard-input
  const border = (key: keyof FormState) => (errors[key] ? "sa-invalid" : "");

  return (
    <div className="sa-page">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", to: "/siswa" },
            { label: "Ajukan Konseling" },
          ]}
        />
        <h1 className="sa-title">Form Pengajuan Konseling</h1>
        <p className="sa-desc">
          Silakan isi formulir di bawah ini untuk mengajukan sesi konseling baru
          dengan guru pembimbing.
        </p>
      </div>

      <div className="sa-layout">
        {/* Form */}
        <div className="sa-main">
          {terkirim ? (
            <section className="sa-done">
              <span className="sa-done-icon">
                <CircleCheck className="sa-icon-lg" />
              </span>
              <h2 className="sa-done-title">Pengajuan berhasil dikirim</h2>
              <p className="sa-done-text">
                Guru BK akan meninjau pengajuanmu. Pantau statusnya di halaman
                Riwayat Konseling.
              </p>
              <div className="sa-done-actions">
                <Link to="/siswa/riwayat" className="btn-primary-bk">
                  Lihat Riwayat
                </Link>
                <button type="button" onClick={ajukanLagi} className="sa-cancel">
                  Ajukan Lagi
                </button>
              </div>
            </section>
          ) : (
            <section className="sa-card">
              <div className="sa-card-head">
                <NotebookPen className="sa-card-icon" />
                <h2 className="sa-card-title">Formulir Pengajuan</h2>
              </div>

              <form onSubmit={handleSubmit} noValidate className="sa-form">
                <div className="sa-grid">
                  <Field label="Jenis Layanan" htmlFor="jenis" error={errors.jenis}>
                    <select
                      id="jenis"
                      value={form.jenis}
                      onChange={(e) => ubah("jenis", e.target.value)}
                      className={"dashboard-input " + border("jenis")}
                    >
                      <option value="">Pilih Layanan</option>
                      {KATEGORI.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label="Pilih Guru BK / Konselor Tujuan"
                    htmlFor="guru"
                    error={errors.guru}
                  >
                    <select
                      id="guru"
                      value={form.guru}
                      onChange={(e) => ubah("guru", e.target.value)}
                      className={"dashboard-input " + border("guru")}
                    >
                      <option value="">Pilih Guru BK</option>
                      {GURU_BK.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label="Topik / Judul Permasalahan"
                    htmlFor="topik"
                    error={errors.topik}
                    className="dlg-span2"
                  >
                    <input
                      id="topik"
                      type="text"
                      value={form.topik}
                      onChange={(e) => ubah("topik", e.target.value)}
                      placeholder="Contoh: Kesulitan mengatur waktu belajar"
                      className={"dashboard-input " + border("topik")}
                    />
                  </Field>

                  <Field
                    label="Deskripsi Permasalahan"
                    htmlFor="deskripsi"
                    error={errors.deskripsi}
                    className="dlg-span2"
                  >
                    <textarea
                      id="deskripsi"
                      rows={5}
                      value={form.deskripsi}
                      onChange={(e) => ubah("deskripsi", e.target.value)}
                      placeholder="Ceritakan detail permasalahan Anda di sini agar kami dapat membantu lebih baik..."
                      className={"dashboard-input sa-resize " + border("deskripsi")}
                    />
                  </Field>

                  <Field
                    label="Tanggal yang diinginkan"
                    htmlFor="tanggal"
                    error={errors.tanggal}
                  >
                    <input
                      id="tanggal"
                      type="date"
                      min={hariIni}
                      value={form.tanggal}
                      onChange={(e) => ubah("tanggal", e.target.value)}
                      onClick={(e) => bukaPicker(e.currentTarget)}
                      className={"dashboard-input " + border("tanggal")}
                    />
                  </Field>

                  <Field
                    label="Waktu yang diinginkan"
                    htmlFor="waktu"
                    error={errors.waktu}
                  >
                    <input
                      id="waktu"
                      type="time"
                      value={form.waktu}
                      onChange={(e) => ubah("waktu", e.target.value)}
                      onClick={(e) => bukaPicker(e.currentTarget)}
                      className={"dashboard-input " + border("waktu")}
                    />
                  </Field>
                </div>

                <div className="sa-foot">
                  <button
                    type="button"
                    onClick={() => void navigate("/siswa")}
                    className="sa-cancel"
                  >
                    Batal
                  </button>
                  <button type="submit" disabled={loading} className="sa-submit">
                    <Send className="sa-icon" />
                    {loading ? "Mengirim..." : "Kirim Pengajuan"}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>

        {/* Panel kanan */}
        <div className="sa-side">
          <section className="sa-flow">
            <h2 className="sa-flow-title">Alur Konseling</h2>
            <ol className="sa-flow-list">
              {LANGKAH.map((l, i) => (
                <li key={l} className="sa-flow-item">
                  <span className="sa-flow-num">{i + 1}</span>
                  {l}
                </li>
              ))}
            </ol>
          </section>

          <section className="sa-profile">
            <div className="sa-profile-row">
              <span className="sa-profile-avatar">
                {nama.charAt(0).toUpperCase()}
              </span>
              <div className="sa-profile-info">
                <p className="sa-profile-name">{nama}</p>
                <p className="sa-profile-nisn">NISN: {PROFIL.nisn}</p>
                <p className="sa-profile-kelas">{PROFIL.kelas}</p>
              </div>
            </div>
            <dl className="sa-facts">
              <div className="sa-fact">
                <dt className="sa-fact-label">Total Konseling</dt>
                <dd className="sa-fact-value">{ringkasan.selesai} Kali</dd>
              </div>
              <div className="sa-fact sa-fact-border">
                <dt className="sa-fact-label">Status Terakhir</dt>
                <dd className={"badge-sq-tight " + statusTerakhir.badge}>
                  {statusTerakhir.label}
                </dd>
              </div>
            </dl>
          </section>

          <section className="sa-privacy">
            <Info className="sa-privacy-icon" />
            Data yang Anda masukkan terjamin kerahasiaannya sesuai dengan Kode
            Etik Bimbingan dan Konseling Nasional.
          </section>
        </div>
      </div>
    </div>
  );
}