import { CircleCheck, History, Info, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  PERMOHONAN,
  STATUS_PERMOHONAN,
  formatDiajukan,
  hasilAwal,
  inisial,
  profilSiswa,
  type Permohonan,
} from "../../data/guruContoh";
import { KATEGORI_STYLE } from "../../data/riwayatContoh";

type StatusForm = "menunggu" | "disetujui" | "ditolak";

type FormState = {
  status: StatusForm;
  alasan: string;
  tanggal: string;
  waktu: string;
  pertemuan: string;
  deskripsi: string;
  hasil: string;
  evaluasi: string;
  penyelesaian: "selesai" | "lanjutan";
};

type Errors = Partial<Record<keyof FormState, string>>;

function awalDari(p: Permohonan): FormState {
  const sudah = p.status === "selesai" || p.status === "lanjutan";
  const hasil = hasilAwal(p);
  const profil = profilSiswa(p);
  return {
    status:
      p.status === "menunggu" || p.status === "ditolak" ? p.status : "disetujui",
    alasan: "",
    tanggal: p.tanggal,
    waktu: p.jam,
    pertemuan: String(sudah ? profil.totalSesi : profil.totalSesi + 1),
    ...hasil,
    penyelesaian: p.status === "lanjutan" ? "lanjutan" : "selesai",
  };
}

function bacaDraf(key: string, awal: FormState): FormState {
  try {
    const mentah = localStorage.getItem(key);
    if (!mentah) return awal;
    const obj = JSON.parse(mentah) as Partial<FormState>;
    return { ...awal, ...obj };
  } catch {
    return awal;
  }
}

function Kotak({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <section className="gd-box">
      <h2 className="gd-box-title">{judul}</h2>
      <div className="gd-box-body">{children}</div>
    </section>
  );
}

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
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

function Formulir({ item }: { item: Permohonan }) {
  const navigate = useNavigate();
  const profil = profilSiswa(item);
  const kunciDraf = `bk-draf-permohonan-${item.id}`;

  const [awal] = useState(() => awalDari(item));
  const [form, setForm] = useState<FormState>(() => bacaDraf(kunciDraf, awal));
  const [errors, setErrors] = useState<Errors>({});
  const [tersimpan, setTersimpan] = useState(false);
  const [hariIni] = useState(() => new Date().toLocaleDateString("en-CA"));

  // Draf tersimpan otomatis di browser ini selama form berbeda dari kondisi awal.
  useEffect(() => {
    try {
      if (JSON.stringify(form) === JSON.stringify(awal)) {
        localStorage.removeItem(kunciDraf);
      } else {
        localStorage.setItem(kunciDraf, JSON.stringify(form));
      }
    } catch {
      // storage diblokir: draf tidak tersimpan, form tetap bisa dipakai
    }
  }, [form, awal, kunciDraf]);

  function ubah<K extends keyof FormState>(key: K, nilai: FormState[K]) {
    setForm((f) => ({ ...f, [key]: nilai }));
    setTersimpan(false);
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  const hasilAktif = form.status === "disetujui";

  function validasi(): Errors {
    const e: Errors = {};
    if (form.status === "ditolak" && form.alasan.trim().length < 10) {
      e.alasan = "Tulis alasan penolakan (minimal 10 karakter).";
    }
    if (form.status === "disetujui") {
      if (!form.tanggal) e.tanggal = "Pilih tanggal pertemuan.";
      if (!form.waktu) e.waktu = "Pilih waktu pertemuan.";
      const adaIsi = [form.deskripsi, form.hasil, form.evaluasi].some((v) =>
        v.trim(),
      );
      if (adaIsi) {
        // Hasil konseling disimpan utuh: semua bagian wajib diisi.
        if (!form.deskripsi.trim()) e.deskripsi = "Deskripsi kegiatan wajib diisi.";
        if (!form.hasil.trim()) e.hasil = "Hasil kegiatan wajib diisi.";
        if (!form.evaluasi.trim()) e.evaluasi = "Evaluasi dan tindak lanjut wajib diisi.";
        if (!(Number(form.pertemuan) >= 1)) e.pertemuan = "Isi pertemuan ke berapa.";
      }
    }
    return e;
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    const e = validasi();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    // TODO: kirim ke backend -> PUT /api/konseling/{id}
    // (status, alasan_penolakan, jadwal, dan hasil_konseling). Sementara hanya simulasi.
    try {
      localStorage.removeItem(kunciDraf);
    } catch {
      // abaikan
    }
    setTersimpan(true);
  }

  // Nama class untuk border error; kondisi normal sudah diurus dashboard-input
  const bd = (k: keyof FormState) => (errors[k] ? "gd-invalid" : "");

  const st = STATUS_PERMOHONAN[item.status];

  return (
    <form onSubmit={handleSubmit} noValidate className="gd-form">
      <div className="gd-grid">
        {/* Kolom kiri: profil siswa */}
        <div className="gd-side">
          <section className="gd-profile">
            <span className="gd-profile-avatar">{inisial(item.nama)}</span>
            <h1 className="gd-profile-name">{item.nama}</h1>
            <p className="gd-profile-nisn">NISN: {profil.nisn}</p>

            <dl className="gd-facts">
              <div className="gd-fact">
                <dt className="gd-fact-label">KELAS</dt>
                <dd className="gd-fact-value">{item.kelas}</dd>
              </div>
              <div className="gd-fact">
                <dt className="gd-fact-label">WALI KELAS</dt>
                <dd className="gd-fact-value">{profil.waliKelas}</dd>
              </div>
              <div className="gd-fact gd-fact-row">
                <div>
                  <dt className="gd-fact-label gd-fact-label-accent">TOTAL SESI</dt>
                  <dd className="gd-fact-value gd-fact-value-accent">
                    {profil.totalSesi} Kali
                  </dd>
                </div>
                <History className="gd-fact-icon" />
              </div>
            </dl>
          </section>

          <section className="gd-note">
            <h2 className="gd-note-title">
              <Info className="gd-icon gd-icon-muted" />
              Catatan Singkat Guru BK
            </h2>
            <p className="gd-note-text">“{profil.catatan}”</p>
          </section>
        </div>

        {/* Kolom kanan */}
        <div className="gd-main">
          <Kotak judul="Detail Permohonan">
            <div className="gd-detail-grid">
              <div>
                <p className="gd-meta-label">Kategori Masalah</p>
                <div className="gd-cat-row">
                  <span className={"badge-sq-tight " + KATEGORI_STYLE[item.jenis]}>
                    {item.jenis}
                  </span>
                  <span className="gd-value">{item.topik}</span>
                </div>
              </div>
              <div>
                <p className="gd-meta-label">Tanggal Pengajuan</p>
                <p className="gd-value gd-value-mt">
                  {formatDiajukan(item.diajukan)}
                </p>
              </div>
            </div>
            <p className="gd-meta-label gd-meta-label-top">
              Deskripsi Masalah (Siswa)
            </p>
            <blockquote className="gd-quote">“{profil.deskripsi}”</blockquote>
          </Kotak>

          <div className="gd-pair">
            <Kotak judul="Status Permohonan">
              <Label htmlFor="status">Update Status</Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => ubah("status", e.target.value as StatusForm)}
                className="dashboard-input"
              >
                <option value="menunggu">Menunggu</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
              </select>
              <p className="gd-status-hint">
                Status saat ini:{" "}
                <span className={"semibold " + st.teks}>{st.label}</span>
              </p>

              {form.status === "ditolak" && (
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
                  disabled={form.status === "ditolak"}
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
                  disabled={form.status === "ditolak"}
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
                  Form ini aktif setelah permohonan berstatus Disetujui.
                </p>
              )}

              <div>
                <Label htmlFor="pertemuan">Pertemuan ke-</Label>
                <input
                  id="pertemuan"
                  type="number"
                  min={1}
                  value={form.pertemuan}
                  disabled={!hasilAktif}
                  onChange={(e) => ubah("pertemuan", e.target.value)}
                  className={"dashboard-input gd-input-sm " + bd("pertemuan")}
                />
                <Galat pesan={errors.pertemuan} />
              </div>

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
                  placeholder="Apa saja solusi atau perubahan mindset yang dicapai?"
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
                  placeholder="Langkah konkrit yang harus dilakukan siswa selanjutnya..."
                  className={"dashboard-input " + bd("evaluasi")}
                />
                <Galat pesan={errors.evaluasi} />
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

      {/* Aksi */}
      <div className="gd-actions">
        <p className="gd-actions-note">
          <ShieldCheck className="gd-icon" />
          Data disimpan otomatis sebagai draf di browser ini.
        </p>
        <div className="gd-actions-btns">
          <button
            type="button"
            onClick={() => void navigate("/guru/permohonan")}
            className="gd-cancel"
          >
            Batal
          </button>
          <button type="submit" className="btn-primary-bk btn-wide">
            Simpan Perubahan
          </button>
        </div>
      </div>
    </form>
  );
}

export default function GuruDetailPermohonan() {
  const { id } = useParams();
  const item = PERMOHONAN.find((p) => String(p.id) === id);

  if (!item) {
    return (
      <div className="soon-box">
        <h1 className="soon-title">Permohonan tidak ditemukan</h1>
        <p className="soon-text">Data permohonan yang kamu cari tidak ada.</p>
        <Link to="/guru/permohonan" className="soon-link">
          Kembali ke Permohonan
        </Link>
      </div>
    );
  }

  // key memastikan form dibuat ulang saat pindah ke permohonan lain
  return <Formulir key={item.id} item={item} />;
}