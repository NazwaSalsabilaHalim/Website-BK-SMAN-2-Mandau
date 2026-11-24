import { PageMeta } from "@/components/shared/page-meta";
import {
  DoorOpen,
  Download,
  ListFilter,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  CARD_CLS,
  INPUT_CLS,
  SELECT_CLS,
  BTN_PRIMARY,
  StatCard,
  PageHeader,
  NotifBar,
  Pagination,
} from "@/components/bk/ui";
import { siswaApi, guruBkApi, type ApiError, type SiswaItem, type GuruBkItem } from "@/lib/api";

/* ------------------------------------------------------------------ */
type FormSiswa = {
  nis: string;
  nama: string;
  username: string;
  password: string;
  kelas: string;
  no_hp: string;
  guru_bk_id: number | null;
};
type Errors = Partial<Record<keyof FormSiswa, string>>;

const FORM_KOSONG: FormSiswa = {
  nis: "", nama: "", username: "", password: "",
  kelas: "", no_hp: "", guru_bk_id: null,
};

const AVATAR_COL = ["avatar-col-0", "avatar-col-1", "avatar-col-2", "avatar-col-3", "avatar-col-4"];
const angka = (n: number) => new Intl.NumberFormat("id-ID").format(n);
const tanggalHariIni = () => new Date().toLocaleDateString("en-CA");
const URUT_KELAS = (a: string, b: string) => a.localeCompare(b, "id", { numeric: true });

/* ------------------------------------------------------------------ */
export default function AdminSiswaPage() {
  const [data, setData]       = useState<SiswaItem[]>([]);
  const [daftarGuru, setDaftarGuru] = useState<GuruBkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cari, setCari]       = useState("");
  const [kelas, setKelas]     = useState("semua");
  const [ukuran, setUkuran]   = useState(10);
  const [halaman, setHalaman] = useState(1);
  const [notif, setNotif]     = useState("");
  const [notifVariant, setNotifVariant] = useState<"success" | "error">("success");

  const [dialog, setDialog] = useState<{ id: number | null; nilai: FormSiswa } | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [hapus, setHapus]   = useState<SiswaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Muat ── */
  async function muat() {
    setLoading(true);
    try {
      const [siswas, guru] = await Promise.all([siswaApi.list(), guruBkApi.list()]);
      setData(siswas);
      setDaftarGuru(guru.filter((g) => g.aktif));
    } catch (e) {
      setNotif((e as ApiError).message ?? "Gagal memuat data.");
      setNotifVariant("error");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void muat(); }, []);

  /* ── Filter ── */
  const daftarKelas = [...new Set(data.map((s) => s.kelas))].sort(URUT_KELAS);

  const hasil = data.filter((s) => {
    const q = cari.trim().toLowerCase();
    const cocokCari = !q || s.nis.includes(q) || s.nama.toLowerCase().includes(q);
    return cocokCari && (kelas === "semua" || s.kelas === kelas);
  });

  const totalHalaman = Math.max(1, Math.ceil(hasil.length / ukuran));
  const aktif        = Math.min(halaman, totalHalaman);
  const mulai        = (aktif - 1) * ukuran;
  const tampil       = hasil.slice(mulai, mulai + ukuran);

  /* ── Dialog ── */
  function bukaTambah() { setDialog({ id: null, nilai: { ...FORM_KOSONG } }); setErrors({}); }
  function bukaUbah(s: SiswaItem) {
    setDialog({ id: s.id, nilai: { nis: s.nis, nama: s.nama, username: s.username, password: "", kelas: s.kelas, no_hp: s.no_hp, guru_bk_id: s.guru_bk_id } });
    setErrors({});
  }
  function ubahField<K extends keyof FormSiswa>(key: K, nilai: FormSiswa[K]) {
    setDialog((d) => (d ? { ...d, nilai: { ...d.nilai, [key]: nilai } } : d));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  /* ── Simpan ── */
  async function simpan(ev: FormEvent) {
    ev.preventDefault();
    if (!dialog) return;
    const v = dialog.nilai;
    const tambah = dialog.id === null;
    const e: Errors = {};
    if (!v.nis.trim()) e.nis = "NIS wajib diisi.";
    if (!v.nama.trim()) e.nama = "Nama siswa wajib diisi.";
    if (!v.kelas.trim()) e.kelas = "Kelas wajib diisi.";
    if (!/^[a-z0-9._]{4,30}$/.test(v.username)) e.username = "Username 4–30 karakter (huruf kecil, angka, titik, garis bawah).";
    if (tambah && v.password.length < 8) e.password = "Password awal minimal 8 karakter.";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      const payload = { nis: v.nis.trim(), nama: v.nama.trim(), username: v.username, kelas: v.kelas.trim(), no_hp: v.no_hp || null, guru_bk_id: v.guru_bk_id, ...(v.password ? { password: v.password } : {}) };
      if (tambah) {
        const baru = await siswaApi.create(payload);
        setData((l) => [baru, ...l]);
        setHalaman(1);
        setNotif(`Siswa ${baru.nama} berhasil ditambahkan.`); setNotifVariant("success");
      } else {
        const updated = await siswaApi.update(dialog.id!, payload);
        setData((l) => l.map((s) => (s.id === dialog.id ? updated : s)));
        setNotif(`Data ${updated.nama} berhasil diperbarui.`); setNotifVariant("success");
      }
      setDialog(null);
    } catch (err) {
      const ae = err as ApiError;
      if (ae.errors) setErrors({ nis: ae.errors.nis, nama: ae.errors.nama, username: ae.errors.username, password: ae.errors.password, kelas: ae.errors.kelas });
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
      await siswaApi.remove(hapus.id);
      setData((l) => l.filter((s) => s.id !== hapus.id));
      setNotif(`Siswa ${hapus.nama} dihapus.`); setNotifVariant("success");
      setHapus(null);
    } catch (e) {
      setNotif((e as ApiError).message ?? "Gagal menghapus."); setNotifVariant("error");
    } finally {
      setDeleting(false);
    }
  }

  function ekspor() {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const baris = [
      ["NIS", "Nama Siswa", "Kelas", "Guru BK"],
      ...hasil.map((s) => [s.nis, s.nama, s.kelas, s.wali]),
    ].map((r) => r.map(esc).join(","));
    const blob = new Blob(["\uFEFF" + baris.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `data-siswa-${tanggalHariIni()}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function tekan(e: KeyboardEvent) { if (e.key === "Escape") { setDialog(null); setHapus(null); } }
  const bd = (k: keyof FormSiswa) => (errors[k] ? "field-error" : "field-ok");

  /* ── Render ── */
  return (
    <>
      <PageMeta title="Data Siswa | BK SMAN 2 Mandau" description="Kelola data siswa SMAN 2 Mandau" />

      <div className="dash-page">
        <PageHeader
          breadcrumb={[{ label: "Dashboard", to: "/admin" }, { label: "Data Siswa" }]}
          title="Data Siswa"
          description="Kelola informasi akademik dan data pribadi seluruh siswa SMAN 2 Mandau."
          action={
            <button type="button" onClick={bukaTambah} className={BTN_PRIMARY}>
              <Plus className="size-4" /> Tambah Siswa
            </button>
          }
        />

        {notif && <NotifBar message={notif} onClose={() => setNotif("")} variant={notifVariant} />}

        {/* Stat cards */}
        <div className="dash-stat-grid">
          <StatCard label="Total Siswa"  value={angka(data.length)}     icon={<Users className="size-5" />}    iconCls="tint-blue-700" />
          <StatCard label="Total Kelas"  value={angka(daftarKelas.length)} icon={<DoorOpen className="size-5" />} iconCls="tint-orange-700" />
          <StatCard label="Guru BK Aktif" value={angka(daftarGuru.length)} icon={<Users className="size-5" />}  iconCls="tint-green-700" />
        </div>

        {/* Tabel */}
        <section className={CARD_CLS + " panel-clip"}>
          <div className="toolbar">
            <label className="search-siswa">
              <Search className="search-icon" />
              <input type="search" value={cari} onChange={(e) => { setCari(e.target.value); setHalaman(1); }} placeholder="Cari NIS atau nama siswa..." aria-label="Cari NIS atau nama siswa" className="app-search-input" />
            </label>

            <label className="toolbar-label">
              Tampilkan:
              <select value={ukuran} onChange={(e) => { setUkuran(Number(e.target.value)); setHalaman(1); }} className={SELECT_CLS}>
                {[5, 10, 25].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>

            <label className="toolbar-label">
              <ListFilter className="size-4" />
              <select value={kelas} onChange={(e) => { setKelas(e.target.value); setHalaman(1); }} aria-label="Filter kelas" className={SELECT_CLS}>
                <option value="semua">Semua Kelas</option>
                {daftarKelas.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </label>

            <div className="toolbar-end">
              <button type="button" onClick={ekspor} disabled={hasil.length === 0} className="btn-outline-sm">
                <Download className="size-4" /> Export CSV
              </button>
              <button type="button" onClick={() => window.print()} aria-label="Cetak" title="Cetak" className="btn-icon-round">
                <Printer className="size-4" />
              </button>
            </div>
          </div>

          <div className="table-info">
            {loading ? "Memuat…" : hasil.length === 0 ? "Menampilkan 0 siswa" : `Menampilkan ${mulai + 1}–${mulai + tampil.length} dari ${angka(hasil.length)} siswa`}
          </div>

          <div className="ui-table-wrap">
            <table className="tbl-40">
              <thead className="ui-thead">
                <tr>
                  <th className="ui-th">Siswa</th>
                  <th className="th-mid">NIS</th>
                  <th className="th-mid">Kelas</th>
                  <th className="th-mid">Guru BK</th>
                  <th className="ui-th ui-th-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="rows-soft">
                {loading ? (
                  <tr><td colSpan={5} className="tbl-empty-lg">Memuat data…</td></tr>
                ) : tampil.length === 0 ? (
                  <tr><td colSpan={5} className="tbl-empty-lg">Tidak ada siswa yang cocok.</td></tr>
                ) : (
                  tampil.map((s, i) => (
                    <tr key={s.id} className="tbl-row-fade">
                      <td className="cell-edge">
                        <div className="media">
                          <span className={"avatar-md " + AVATAR_COL[(mulai + i) % AVATAR_COL.length]}>
                            {s.nama.split(" ").slice(0, 2).map((k) => k[0]).join("").toUpperCase()}
                          </span>
                          <div>
                            <p className="cell-strong">{s.nama}</p>
                            <p className="dash-person-sub">{s.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="cell cell-mono">{s.nis}</td>
                      <td className="cell"><span className="ui-badge tint-gray">{s.kelas}</span></td>
                      <td className="cell cell-muted">{s.wali || "—"}</td>
                      <td className="cell-edge">
                        <div className="act-group">
                          <button type="button" onClick={() => bukaUbah(s)} aria-label={`Ubah data ${s.nama}`} title="Ubah" className="act-edit"><Pencil className="size-4" /></button>
                          <button type="button" onClick={() => setHapus(s)} aria-label={`Hapus ${s.nama}`} title="Hapus" className="act-del"><Trash2 className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination current={aktif} total={totalHalaman} onChange={setHalaman} />
        </section>
      </div>

      {/* Dialog tambah/ubah */}
      {dialog && (
        <div className="dlg-overlay-blur" onKeyDown={tekan}>
          <form role="dialog" aria-modal="true" aria-labelledby="judul-form-siswa" onSubmit={simpan} noValidate className="dlg-form">
            <h2 id="judul-form-siswa" className="dlg-title">
              {dialog.id === null ? "Tambah Siswa Baru" : "Ubah Data Siswa"}
            </h2>
            <p className="dlg-sub">{dialog.id === null ? "Isi data lengkap siswa baru." : "Perbarui data siswa yang dipilih."}</p>

            <div className="dlg-grid">
              <div>
                <label htmlFor="f-nis" className="frm-label">NIS</label>
                <input id="f-nis" autoFocus value={dialog.nilai.nis} onChange={(e) => ubahField("nis", e.target.value)} placeholder="Nomor Induk Siswa" className={`${INPUT_CLS} ${bd("nis")}`} />
                {errors.nis && <p role="alert" className="frm-error">{errors.nis}</p>}
              </div>

              <div>
                <label htmlFor="f-username" className="frm-label">Username Login</label>
                <input id="f-username" autoCapitalize="none" value={dialog.nilai.username} onChange={(e) => ubahField("username", e.target.value)} placeholder="nama.panggilan" className={`${INPUT_CLS} ${bd("username")}`} />
                {errors.username && <p role="alert" className="frm-error">{errors.username}</p>}
              </div>

              <div className="dlg-span2">
                <label htmlFor="f-nama" className="frm-label">Nama Siswa</label>
                <input id="f-nama" value={dialog.nilai.nama} onChange={(e) => ubahField("nama", e.target.value)} placeholder="Nama lengkap" className={`${INPUT_CLS} ${bd("nama")}`} />
                {errors.nama && <p role="alert" className="frm-error">{errors.nama}</p>}
              </div>

              <div>
                <label htmlFor="f-kelas" className="frm-label">Kelas</label>
                <input id="f-kelas" list="daftar-kelas" value={dialog.nilai.kelas} onChange={(e) => ubahField("kelas", e.target.value)} placeholder="Contoh: XII IPA 1" className={`${INPUT_CLS} ${bd("kelas")}`} />
                <datalist id="daftar-kelas">{daftarKelas.map((k) => <option key={k} value={k} />)}</datalist>
                {errors.kelas && <p role="alert" className="frm-error">{errors.kelas}</p>}
              </div>

              <div>
                <label htmlFor="f-guru" className="frm-label">Guru BK Pembimbing <span className="frm-hint">(opsional)</span></label>
                <select id="f-guru" value={dialog.nilai.guru_bk_id ?? ""} onChange={(e) => ubahField("guru_bk_id", e.target.value ? Number(e.target.value) : null)} className={`${INPUT_CLS} field-ok`}>
                  <option value="">— Pilih guru BK —</option>
                  {daftarGuru.map((g) => <option key={g.id} value={g.id}>{g.nama}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="f-nohp" className="frm-label">No. HP <span className="frm-hint">(opsional)</span></label>
                <input id="f-nohp" inputMode="tel" value={dialog.nilai.no_hp} onChange={(e) => ubahField("no_hp", e.target.value)} placeholder="08xxxxxxxxxx" className={`${INPUT_CLS} field-ok`} />
              </div>

              <div>
                <label htmlFor="f-password" className="frm-label">
                  {dialog.id === null ? "Password awal" : "Password baru"}{" "}
                  {dialog.id !== null && <span className="frm-hint">(kosongkan jika tidak diganti)</span>}
                </label>
                <input id="f-password" type="password" autoComplete="new-password" value={dialog.nilai.password} onChange={(e) => ubahField("password", e.target.value)} placeholder="Minimal 8 karakter" className={`${INPUT_CLS} ${bd("password")}`} />
                {errors.password && <p role="alert" className="frm-error">{errors.password}</p>}
              </div>
            </div>

            <div className="dlg-actions">
              <button type="button" onClick={() => setDialog(null)} className="btn-cancel-round" disabled={saving}>Batal</button>
              <button type="submit" className={BTN_PRIMARY + " btn-wide"} disabled={saving}>{saving ? "Menyimpan…" : "Simpan"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Dialog hapus */}
      {hapus && (
        <div className="dlg-overlay-blur" onKeyDown={tekan}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="judul-hapus" className="dlg-confirm">
            <div className="dlg-del-row">
              <span className="dlg-icon-danger"><Trash2 className="size-5" /></span>
              <div>
                <h2 id="judul-hapus" className="dlg-title">Hapus siswa?</h2>
                <p className="copy-sub-1">Data <span className="semibold">{hapus.nama}</span> (NIS {hapus.nis}) dan akun loginnya akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <div className="dlg-actions-tight">
              <button type="button" autoFocus onClick={() => setHapus(null)} className="btn-cancel-round" disabled={deleting}>Batal</button>
              <button type="button" onClick={konfirmasiHapus} className="btn-danger-round" disabled={deleting}>{deleting ? "Menghapus…" : "Ya, Hapus"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Suppress unused import warning */}
      <span className="sr-only"><X className="size-0" /></span>
    </>
  );
}
