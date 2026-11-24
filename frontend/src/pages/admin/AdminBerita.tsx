import { PageMeta } from "@/components/shared/page-meta";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  ImagePlus,
  MailOpen,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { beritaApi, type ApiError, type BeritaItem } from "@/lib/api";

/* ------------------------------------------------------------------ */
const KATEGORI = ["BK", "PIK-R"] as const;
type Kategori = (typeof KATEGORI)[number];
type StatusBerita = "published" | "draft";

const PER_HALAMAN = 5;
const MAKS_RINGKASAN = 300;
const MAKS_GAMBAR_MB = 2;

const KATEGORI_STYLE: Record<Kategori, string> = {
  "BK":    "tint-blue-800",
  "PIK-R": "tint-yellow-800",
};

const angka = (n: number) => new Intl.NumberFormat("id-ID").format(n);

function formatTanggal(iso: string) {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

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

function Thumb({ b }: { b: BeritaItem }) {
  return b.gambar ? (
    <img src={b.gambar} alt="" className="thumb-img" />
  ) : (
    <span className="thumb-empty"><Newspaper className="size-5" /></span>
  );
}

function InfoCard({ label, nilai, ikon, keterangan }: {
  label: string; nilai: string; ikon: ReactNode; keterangan?: string;
}) {
  return (
    <section className="kpi">
      <span className="kpi-icon kpi-icon-neutral">{ikon}</span>
      <div>
        <p className="kpi-label">{label}</p>
        <p className="kpi-value-sm">{nilai}</p>
        {keterangan && <p className="note">{keterangan}</p>}
      </div>
    </section>
  );
}

type FormBerita = Omit<BeritaItem, "id" | "tayangan" | "slug">;
type Errors = Partial<Record<keyof FormBerita, string>>;

const FORM_KOSONG: FormBerita = {
  judul: "", kategori: "BK", tanggal: "",
  status: "draft", ringkasan: "", isi: "", gambar: "",
};

/* ------------------------------------------------------------------ */
export default function AdminBeritaPage() {
  const [data, setData] = useState<BeritaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"semua" | Kategori>("semua");
  const [cari, setCari] = useState("");
  const [halaman, setHalaman] = useState(1);
  const [notif, setNotif] = useState("");
  const [notifVariant, setNotifVariant] = useState<"success" | "error">("success");
  const [dialog, setDialog] = useState<{ id: number | null; nilai: FormBerita } | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [hapus, setHapus] = useState<BeritaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Muat ── */
  async function muat() {
    setLoading(true);
    try {
      setData(await beritaApi.list());
    } catch (e) {
      setNotif((e as ApiError).message ?? "Gagal memuat berita.");
      setNotifVariant("error");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void muat(); }, []);

  /* ── Filter ── */
  const hasil = data
    .filter((b) => {
      const q = cari.trim().toLowerCase();
      return (tab === "semua" || b.kategori === tab) && (!q || b.judul.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      const ta = a.tanggal || "9999-12-31";
      const tb = b.tanggal || "9999-12-31";
      return ta < tb ? 1 : ta > tb ? -1 : b.id - a.id;
    });

  const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN));
  const aktif        = Math.min(halaman, totalHalaman);
  const mulai        = (aktif - 1) * PER_HALAMAN;
  const tampil       = hasil.slice(mulai, mulai + PER_HALAMAN);

  const totalTayangan = data.reduce((n, b) => n + b.tayangan, 0);
  const jumlahDraft   = data.filter((b) => b.status === "draft").length;
  const terbaru       = data.map((b) => b.tanggal).filter(Boolean).sort().at(-1) ?? "";

  /* ── Dialog ── */
  function bukaTambah() { setDialog({ id: null, nilai: { ...FORM_KOSONG } }); setErrors({}); }
  function bukaUbah(b: BeritaItem) {
    const { id, tayangan, slug, ...nilai } = b; void id; void tayangan; void slug;
    setDialog({ id: b.id, nilai });
    setErrors({});
  }
  function tutupDialog() { setDialog(null); }

  function ubahField<K extends keyof FormBerita>(key: K, nilai: FormBerita[K]) {
    setDialog((d) => (d ? { ...d, nilai: { ...d.nilai, [key]: nilai } } : d));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function pilihGambar(ev: ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErrors((e) => ({ ...e, gambar: "File harus berupa gambar." })); return; }
    if (file.size > MAKS_GAMBAR_MB * 1024 * 1024) { setErrors((e) => ({ ...e, gambar: `Ukuran gambar maksimal ${MAKS_GAMBAR_MB} MB.` })); return; }
    // TODO: upload ke backend, pakai URL sementara untuk preview
    ubahField("gambar", URL.createObjectURL(file));
  }

  /* ── Simpan ── */
  async function simpan(ev: FormEvent) {
    ev.preventDefault();
    if (!dialog) return;
    const v = dialog.nilai;
    const e: Errors = {};
    if (v.judul.trim().length < 5) e.judul = "Judul minimal 5 karakter.";
    if (!v.ringkasan.trim()) e.ringkasan = "Ringkasan wajib diisi.";
    else if (v.ringkasan.length > MAKS_RINGKASAN) e.ringkasan = `Ringkasan maksimal ${MAKS_RINGKASAN} karakter.`;
    if (v.isi.trim().length < 20) e.isi = "Isi artikel minimal 20 karakter.";
    if (v.status === "published" && !v.tanggal) e.tanggal = "Isi tanggal publikasi untuk berita yang diterbitkan.";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      const payload = { judul: v.judul.trim(), kategori: v.kategori, ringkasan: v.ringkasan.trim(), isi: v.isi, status: v.status, tanggal: v.tanggal || null, gambar: v.gambar || null };
      if (dialog.id === null) {
        const baru = await beritaApi.create(payload);
        setData((l) => [baru, ...l]);
        setHalaman(1);
        setNotif(`Berita "${baru.judul}" berhasil ditambahkan.`); setNotifVariant("success");
      } else {
        const updated = await beritaApi.update(dialog.id, payload);
        setData((l) => l.map((b) => (b.id === dialog.id ? updated : b)));
        setNotif(`Berita "${updated.judul}" berhasil diperbarui.`); setNotifVariant("success");
      }
      setDialog(null);
    } catch (err) {
      const ae = err as ApiError;
      if (ae.errors) setErrors({ judul: ae.errors.judul, ringkasan: ae.errors.ringkasan, isi: ae.errors.isi, tanggal: ae.errors.tanggal });
      else { setNotif(ae.message ?? "Gagal menyimpan."); setNotifVariant("error"); }
    } finally {
      setSaving(false);
    }
  }

  /* ── Hapus ── */
  async function konfirmasiHapus() {
    if (!hapus) return;
    setDeleting(true);
    try {
      await beritaApi.remove(hapus.id);
      setData((l) => l.filter((b) => b.id !== hapus.id));
      setNotif(`Berita "${hapus.judul}" dihapus.`); setNotifVariant("success");
      setHapus(null);
    } catch (e) {
      setNotif((e as ApiError).message ?? "Gagal menghapus."); setNotifVariant("error");
    } finally {
      setDeleting(false);
    }
  }

  function tekan(e: KeyboardEvent) { if (e.key === "Escape") { setDialog(null); setHapus(null); } }
  const bd = (k: keyof FormBerita) => (errors[k] ? "field-error" : "field-ok");

  /* ── Render ── */
  return (
    <>
      <PageMeta title="Kelola Berita & Artikel | BK SMAN 2 Mandau" description="Kelola berita dan artikel yang tampil di website BK SMAN 2 Mandau" />

      <div className="dash-page">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Kelola Berita &amp; Artikel</h1>
            <p className="dash-subtitle">Manajemen konten edukasi, artikel bimbingan, dan informasi PIK-R.</p>
          </div>
          <button type="button" onClick={bukaTambah} className="dash-btn-primary">
            <Plus className="size-4" /> Tambah Berita
          </button>
        </div>

        {notif && (
          <p role="status" className={`ui-notif ${notifVariant === "error" ? "ui-notif-error" : "ui-notif-success"}`}>
            {notif}
            <button type="button" onClick={() => setNotif("")} aria-label="Tutup" className="ui-notif-close"><X className="size-4" /></button>
          </p>
        )}

        <div className="kpi-grid-3">
          <InfoCard label="Total Tayangan" nilai={angka(totalTayangan)} ikon={<Eye className="size-5" />} keterangan="Dari semua berita terbit" />
          <InfoCard label="Draft Berita"   nilai={angka(jumlahDraft)}   ikon={<MailOpen className="size-5" />} />
          <InfoCard label="Pembaruan Terakhir" nilai={formatTanggal(terbaru)} ikon={<CalendarDays className="size-5" />} />
        </div>

        {/* Tab & cari */}
        <div className="tabs-bar">
          <div className="tabs-list" role="tablist" aria-label="Kategori berita">
            {(["semua", ...KATEGORI] as const).map((k) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k}
                onClick={() => { setTab(k); setHalaman(1); }}
                className={"tab-btn " + (tab === k ? "tab-btn-on" : "tab-btn-off")}>
                {k === "semua" ? "Semua" : k}
              </button>
            ))}
          </div>
          <label className="search-berita">
            <Search className="search-icon" />
            <input type="search" value={cari} onChange={(e) => { setCari(e.target.value); setHalaman(1); }} placeholder="Cari judul berita..." aria-label="Cari judul berita" className="search-input" />
          </label>
        </div>

        {/* Tabel */}
        <section className="panel panel-clip">
          <div className="ui-table-wrap">
            <table className="tbl-44">
              <thead className="tbl-head">
                <tr>
                  <th className="ui-th">JUDUL BERITA</th>
                  <th className="th-mid">KATEGORI</th>
                  <th className="th-mid">TANGGAL PUBLIKASI</th>
                  <th className="th-mid">STATUS</th>
                  <th className="ui-th ui-th-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="rows">
                {loading ? (
                  <tr><td colSpan={5} className="tbl-empty">Memuat data…</td></tr>
                ) : tampil.length === 0 ? (
                  <tr><td colSpan={5} className="tbl-empty">Tidak ada berita yang cocok.</td></tr>
                ) : (
                  tampil.map((b) => (
                    <tr key={b.id} className="tbl-row">
                      <td className="cell-edge">
                        <div className="media"><Thumb b={b} /><span className="dash-person-name">{b.judul}</span></div>
                      </td>
                      <td className="cell">
                        <span className={"badge-sq " + KATEGORI_STYLE[b.kategori]}>{b.kategori}</span>
                      </td>
                      <td className="cell cell-muted">{formatTanggal(b.tanggal)}</td>
                      <td className="cell">
                        <span className={"badge-pill-dot " + (b.status === "published" ? "tint-green-700" : "tint-gray-200")}>
                          <span className={"dot " + (b.status === "published" ? "dot-green-600" : "dot-gray-500")} />
                          {b.status === "published" ? "Diterbitkan" : "Draf"}
                        </span>
                      </td>
                      <td className="cell-edge">
                        <div className="act-group">
                          <button type="button" onClick={() => bukaUbah(b)} aria-label={`Ubah ${b.judul}`} title="Ubah" className="act-ghost"><Pencil className="size-4" /></button>
                          <button type="button" onClick={() => setHapus(b)} aria-label={`Hapus ${b.judul}`} title="Hapus" className="act-ghost-danger"><Trash2 className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pg-bar">
            <p className="pg-info">{hasil.length === 0 ? "Menampilkan 0 berita" : `Menampilkan ${mulai + 1}–${mulai + tampil.length} dari ${angka(hasil.length)} berita`}</p>
            <div className="ui-page-list">
              <button type="button" onClick={() => setHalaman(Math.max(1, aktif - 1))} disabled={aktif === 1} aria-label="Halaman sebelumnya" className="pg-btn"><ChevronLeft className="size-4" /></button>
              {nomorHalaman(aktif, totalHalaman).map((n, i) =>
                n === "…" ? <span key={`t${i}`} className="ui-page-gap">…</span> : (
                  <button key={n} type="button" onClick={() => setHalaman(n)} aria-current={n === aktif ? "page" : undefined} className={"pg-num " + (n === aktif ? "pg-num-on" : "pg-num-off")}>{n}</button>
                )
              )}
              <button type="button" onClick={() => setHalaman(Math.min(totalHalaman, aktif + 1))} disabled={aktif === totalHalaman} aria-label="Halaman berikutnya" className="pg-btn"><ChevronRight className="size-4" /></button>
            </div>
          </div>
        </section>
      </div>

      {/* Dialog tambah/ubah */}
      {dialog && (
        <div className="dlg-overlay" onKeyDown={tekan}>
          <form role="dialog" aria-modal="true" aria-labelledby="judul-form-berita" onSubmit={simpan} noValidate className="dlg-wide">
            <h2 id="judul-form-berita" className="dlg-title">{dialog.id === null ? "Tambah Berita" : "Ubah Berita"}</h2>
            <div className="dlg-grid">
              <div className="dlg-span2">
                <label htmlFor="b-judul" className="frm-label">Judul</label>
                <input id="b-judul" autoFocus value={dialog.nilai.judul} onChange={(e) => ubahField("judul", e.target.value)} placeholder="Judul berita atau artikel" className={`field-input ${bd("judul")}`} />
                {errors.judul && <p role="alert" className="frm-error">{errors.judul}</p>}
              </div>
              <div>
                <label htmlFor="b-kategori" className="frm-label">Kategori</label>
                <select id="b-kategori" value={dialog.nilai.kategori} onChange={(e) => ubahField("kategori", e.target.value as Kategori)} className="field-input field-ok">
                  {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="b-status" className="frm-label">Status</label>
                <select id="b-status" value={dialog.nilai.status} onChange={(e) => ubahField("status", e.target.value as StatusBerita)} className="field-input field-ok">
                  <option value="draft">Draf</option>
                  <option value="published">Diterbitkan</option>
                </select>
              </div>
              <div>
                <label htmlFor="b-tanggal" className="frm-label">Tanggal Publikasi</label>
                <input id="b-tanggal" type="date" value={dialog.nilai.tanggal} onChange={(e) => ubahField("tanggal", e.target.value)} onClick={(e) => e.currentTarget.showPicker?.()} className={`field-input ${bd("tanggal")}`} />
                {errors.tanggal && <p role="alert" className="frm-error">{errors.tanggal}</p>}
              </div>
              <div>
                <span className="frm-label">Gambar Sampul</span>
                <div className="media">
                  {dialog.nilai.gambar ? <img src={dialog.nilai.gambar} alt="Pratinjau sampul" className="thumb-img" /> : <span className="thumb-empty"><ImagePlus className="size-5" /></span>}
                  <label className="btn-file">Pilih gambar<input id="b-gambar" type="file" accept="image/*" onChange={pilihGambar} className="sr-only" /></label>
                  {dialog.nilai.gambar && <button type="button" onClick={() => ubahField("gambar", "")} className="link-danger">Hapus</button>}
                </div>
                {errors.gambar && <p role="alert" className="frm-error">{errors.gambar}</p>}
              </div>
              <div className="dlg-span2">
                <label htmlFor="b-ringkasan" className="frm-label">Ringkasan <span className="frm-hint">({dialog.nilai.ringkasan.length}/{MAKS_RINGKASAN})</span></label>
                <textarea id="b-ringkasan" rows={2} value={dialog.nilai.ringkasan} onChange={(e) => ubahField("ringkasan", e.target.value)} placeholder="Ringkasan singkat yang tampil di kartu berita" className={`field-input ${bd("ringkasan")}`} />
                {errors.ringkasan && <p role="alert" className="frm-error">{errors.ringkasan}</p>}
              </div>
              <div className="dlg-span2">
                <label htmlFor="b-isi" className="frm-label">Isi Artikel</label>
                <textarea id="b-isi" rows={6} value={dialog.nilai.isi} onChange={(e) => ubahField("isi", e.target.value)} placeholder="Tulis isi artikel di sini..." className={`field-input ${bd("isi")}`} />
                {errors.isi && <p role="alert" className="frm-error">{errors.isi}</p>}
              </div>
            </div>
            <div className="dlg-actions">
              <button type="button" onClick={tutupDialog} className="btn-cancel" disabled={saving}>Batal</button>
              <button type="submit" className="btn-save" disabled={saving}>{saving ? "Menyimpan…" : "Simpan"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Dialog hapus */}
      {hapus && (
        <div className="dlg-overlay-mid" onKeyDown={tekan}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="judul-hapus-berita" className="dlg-narrow">
            <h2 id="judul-hapus-berita" className="dlg-title">Hapus berita?</h2>
            <p className="copy-sub-2">Berita <span className="semibold">{hapus.judul}</span> akan dihapus dan tidak lagi tampil di website. Tindakan ini tidak dapat dibatalkan.</p>
            <div className="dlg-actions-tight">
              <button type="button" autoFocus onClick={() => setHapus(null)} className="btn-cancel" disabled={deleting}>Batal</button>
              <button type="button" onClick={konfirmasiHapus} className="btn-danger" disabled={deleting}>{deleting ? "Menghapus…" : "Hapus"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
