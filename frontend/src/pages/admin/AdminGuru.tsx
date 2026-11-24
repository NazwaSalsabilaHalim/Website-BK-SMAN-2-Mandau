import { PageMeta } from "@/components/shared/page-meta";
import {
  CircleCheck,
  CircleEllipsis,
  Info,
  Pencil,
  Plus,
  Trash2,
  User,
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
  Card,
  CardHeader,
} from "@/components/bk/ui";
import { guruBkApi, type ApiError, type GuruBkItem } from "@/lib/api";

/* ------------------------------------------------------------------ */
const PENUGASAN = [
  "Koordinator BK",
  "Guru BK",
  "Guru BK - Kelas X",
  "Guru BK - Kelas XI",
  "Guru BK - Kelas XII",
  "Guru BK - Psikolog",
];

const PER_HALAMAN = 5;

const AVATAR = ["avatar-col-1", "avatar-col-0", "avatar-col-2", "avatar-col-3"];

const angka = (n: number) => new Intl.NumberFormat("id-ID").format(n);

function inisial(nama: string) {
  return nama
    .replace(/^(Dra?\.|Drs\.|Hj\.|H\.)\s*/gi, "")
    .split(/[\s,]+/)
    .filter((k) => k && !k.endsWith("."))
    .slice(0, 2)
    .map((k) => k.charAt(0).toUpperCase())
    .join("");
}

type FormGuru = {
  nama: string;
  nip: string;
  username: string;
  penugasan: string;
  no_hp: string;
  aktif: boolean;
  password: string;
};
type Errors = Partial<Record<keyof FormGuru, string>>;

const FORM_KOSONG: FormGuru = {
  nama: "",
  nip: "",
  username: "",
  penugasan: PENUGASAN[1],
  no_hp: "",
  aktif: true,
  password: "",
};

/* ------------------------------------------------------------------ */
export default function AdminGuruPage() {
  const [data, setData] = useState<GuruBkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"semua" | "aktif" | "nonaktif">("semua");
  const [cari, setCari] = useState("");
  const [penugasan, setPenugasan] = useState("semua");
  const [halaman, setHalaman] = useState(1);
  const [notif, setNotif] = useState("");
  const [notifVariant, setNotifVariant] = useState<"success" | "error">("success");
  const [dialog, setDialog] = useState<{ id: number | null; nilai: FormGuru } | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [hapus, setHapus] = useState<GuruBkItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Muat data ── */
  async function muat() {
    setLoading(true);
    try {
      const list = await guruBkApi.list();
      setData(list);
    } catch (e) {
      tampilError(e as ApiError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void muat(); }, []);

  function tampilNotif(msg: string, v: "success" | "error" = "success") {
    setNotif(msg);
    setNotifVariant(v);
  }
  function tampilError(e: ApiError) {
    tampilNotif(e.message ?? "Terjadi kesalahan.", "error");
  }

  /* ── Filter ── */
  const total      = data.length;
  const aktifCount = data.filter((g) => g.aktif).length;
  const tercover   = data.filter((g) => g.aktif).reduce((n, g) => n + g.jumlahSiswa, 0);
  const rasio      = aktifCount === 0 ? 0 : Math.round(tercover / aktifCount);

  const hasil = data.filter((g) => {
    const q = cari.trim().toLowerCase();
    const cocokCari =
      !q ||
      g.nama.toLowerCase().includes(q) ||
      g.nip.includes(q) ||
      g.username.toLowerCase().includes(q);
    const cocokStatus =
      filterStatus === "semua" || (filterStatus === "aktif" ? g.aktif : !g.aktif);
    return cocokCari && cocokStatus && (penugasan === "semua" || g.penugasan === penugasan);
  });

  const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN));
  const aktifHal     = Math.min(halaman, totalHalaman);
  const mulai        = (aktifHal - 1) * PER_HALAMAN;
  const tampil       = hasil.slice(mulai, mulai + PER_HALAMAN);

  /* ── Dialog tambah / ubah ── */
  function bukaTambah() {
    setDialog({ id: null, nilai: { ...FORM_KOSONG } });
    setErrors({});
  }
  function bukaUbah(g: GuruBkItem) {
    setDialog({
      id: g.id,
      nilai: {
        nama: g.nama, nip: g.nip, username: g.username,
        penugasan: g.penugasan, no_hp: g.no_hp,
        aktif: g.aktif, password: "",
      },
    });
    setErrors({});
  }
  function ubahField<K extends keyof FormGuru>(key: K, nilai: FormGuru[K]) {
    setDialog((d) => (d ? { ...d, nilai: { ...d.nilai, [key]: nilai } } : d));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  /* ── Simpan ── */
  async function simpan(ev: FormEvent) {
    ev.preventDefault();
    if (!dialog) return;
    const v = dialog.nilai;
    const tambah = dialog.id === null;

    // Validasi sisi klien
    const e: Errors = {};
    if (!v.nama.trim()) e.nama = "Nama guru wajib diisi.";
    if (v.nip && !/^\d{18}$/.test(v.nip)) e.nip = "NIP harus 18 digit angka.";
    const uname = v.username.trim().toLowerCase();
    if (!/^[a-z0-9._]{4,30}$/.test(uname))
      e.username = "Username 4–30 karakter: huruf kecil, angka, titik, atau garis bawah.";
    if (tambah && v.password.length < 8) e.password = "Password awal minimal 8 karakter.";

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        nama: v.nama.trim(), nip: v.nip || null,
        username: uname, penugasan: v.penugasan,
        no_hp: v.no_hp || null, aktif: v.aktif,
        ...(v.password ? { password: v.password } : {}),
      };

      if (tambah) {
        const baru = await guruBkApi.create(payload);
        setData((l) => [baru, ...l]);
        setHalaman(1);
        tampilNotif(`Guru BK ${baru.nama} berhasil ditambahkan.`);
      } else {
        const updated = await guruBkApi.update(dialog.id!, payload);
        setData((l) => l.map((g) => (g.id === dialog.id ? updated : g)));
        tampilNotif(`Data ${updated.nama} berhasil diperbarui.`);
      }
      setDialog(null);
    } catch (err) {
      const ae = err as ApiError;
      if (ae.errors) {
        // Map validasi backend ke field errors
        setErrors({
          nama: ae.errors.nama,
          nip: ae.errors.nip,
          username: ae.errors.username,
          password: ae.errors.password,
        });
      } else {
        tampilError(ae);
      }
    } finally {
      setSaving(false);
    }
  }

  /* ── Hapus ── */
  async function konfirmasiHapus() {
    if (!hapus) return;
    setDeleting(true);
    try {
      await guruBkApi.remove(hapus.id);
      setData((l) => l.filter((g) => g.id !== hapus.id));
      tampilNotif(`Guru BK ${hapus.nama} dihapus.`);
      setHapus(null);
    } catch (e) {
      tampilError(e as ApiError);
    } finally {
      setDeleting(false);
    }
  }

  function tekan(e: KeyboardEvent) {
    if (e.key === "Escape") { setDialog(null); setHapus(null); }
  }
  function resetFilter() {
    setFilterStatus("semua"); setCari(""); setPenugasan("semua"); setHalaman(1);
  }
  const bd = (k: keyof FormGuru) => (errors[k] ? "field-error" : "field-ok");
  const hasFilter = filterStatus !== "semua" || cari !== "" || penugasan !== "semua";

  /* ── Render ── */
  return (
    <>
      <PageMeta title="Data Guru BK | BK SMAN 2 Mandau" description="Kelola data guru BK SMAN 2 Mandau" />

      <div className="dash-page">
        <PageHeader
          breadcrumb={[{ label: "Dashboard", to: "/admin" }, { label: "Data Guru BK" }]}
          title="Data Guru BK"
          description="Kelola informasi akun dan penugasan Guru BK SMAN 2 Mandau."
          action={
            <button type="button" onClick={bukaTambah} className={BTN_PRIMARY}>
              <Plus className="size-4" /> Tambah Guru BK
            </button>
          }
        />

        {notif && (
          <NotifBar message={notif} onClose={() => setNotif("")} variant={notifVariant} />
        )}

        {/* Stat Cards */}
        <div className="dash-stat-grid">
          <StatCard label="Total Guru BK"   value={angka(total)}       icon={<User className="size-5" />}          iconCls="tint-indigo-700" />
          <StatCard label="Siswa Tercover"  value={angka(tercover)}    icon={<Users className="size-5" />}         iconCls="tint-blue-700" />
          <StatCard label="Guru Aktif"      value={angka(aktifCount)}  icon={<CircleCheck className="size-5" />}   iconCls="tint-green-700" />
          <StatCard label="Rasio Guru:Siswa" value={`1:${angka(rasio)}`} icon={<CircleEllipsis className="size-5" />} iconCls="tint-orange-700" />
        </div>

        {/* Tabel */}
        <section className={CARD_CLS + " panel-clip"}>
          <div className="toolbar">
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as typeof filterStatus); setHalaman(1); }} aria-label="Filter status" className={SELECT_CLS}>
              <option value="semua">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>

            <select value={penugasan} onChange={(e) => { setPenugasan(e.target.value); setHalaman(1); }} aria-label="Filter penugasan" className={SELECT_CLS}>
              <option value="semua">Semua Penugasan</option>
              {PENUGASAN.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <label className="search-guru">
              <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input type="search" value={cari} onChange={(e) => { setCari(e.target.value); setHalaman(1); }} placeholder="Cari nama, NIP, username..." className="app-search-input" />
            </label>

            {hasFilter && (
              <button type="button" onClick={resetFilter} className="link-action-icon">
                <X className="size-3.5" /> Reset
              </button>
            )}

            <p className="toolbar-count">
              {loading ? "Memuat…" : hasil.length === 0 ? "0 guru" : `${mulai + 1}–${mulai + tampil.length} dari ${angka(hasil.length)}`}
            </p>
          </div>

          <div className="ui-table-wrap">
            <table className="tbl-46">
              <thead className="ui-thead">
                <tr>
                  <th className="ui-th">Guru BK</th>
                  <th className="th-mid">NIP</th>
                  <th className="th-mid">Username</th>
                  <th className="th-mid">Jml. Siswa</th>
                  <th className="th-mid">Status</th>
                  <th className="ui-th ui-th-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="rows-soft">
                {loading ? (
                  <tr><td colSpan={6} className="tbl-empty-lg">Memuat data…</td></tr>
                ) : tampil.length === 0 ? (
                  <tr><td colSpan={6} className="tbl-empty-lg">Tidak ada guru BK yang cocok.</td></tr>
                ) : (
                  tampil.map((g, i) => (
                    <tr key={g.id} className="tbl-row-fade">
                      <td className="cell-edge">
                        <div className="media">
                          <span className={"avatar-lg " + AVATAR[(mulai + i) % AVATAR.length]}>
                            {inisial(g.nama)}
                          </span>
                          <div>
                            <p className="dash-person-name">{g.nama}</p>
                            <p className="dash-person-sub">{g.penugasan}</p>
                          </div>
                        </div>
                      </td>
                      <td className="cell cell-mono">{g.nip || "—"}</td>
                      <td className="cell cell-mono-link">{g.username}</td>
                      <td className="cell">
                        <span className="cell-bold">{angka(g.jumlahSiswa)}</span>{" "}
                        <span className="pill-mini tint-blue-800">Siswa</span>
                      </td>
                      <td className="cell">
                        <span className={"ui-badge " + (g.aktif ? "badge-status-aktif" : "badge-status-nonaktif")}>
                          {g.aktif ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="cell-edge">
                        <div className="act-group">
                          <button type="button" onClick={() => bukaUbah(g)} aria-label={`Ubah data ${g.nama}`} title="Ubah" className="act-edit">
                            <Pencil className="size-4" />
                          </button>
                          <button type="button" onClick={() => setHapus(g)} aria-label={`Hapus ${g.nama}`} title="Hapus" className="act-del">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination current={aktifHal} total={totalHalaman} onChange={setHalaman} />
        </section>

        <div className="two-col">
          <section className="info-box">
            <h2 className="info-title"><Info className="size-5" /> Informasi Penugasan</h2>
            <p className="info-text">
              Sistem secara otomatis menghitung rasio guru-siswa berdasarkan kelas yang diampu.
              Pastikan data NIP valid untuk keperluan sinkronisasi pelaporan DAPODIK.
            </p>
          </section>
          <Card className="card-pad">
            <CardHeader title="Akun Login Guru BK" />
            <p className="info-text">
              Password default baru: <code className="font-mono text-xs">bk_sman2_2025</code>. Minta guru BK untuk segera mengganti password setelah login pertama.
            </p>
          </Card>
        </div>
      </div>

      {/* Dialog tambah / ubah */}
      {dialog && (
        <div className="dlg-overlay-blur" onKeyDown={tekan}>
          <form role="dialog" aria-modal="true" aria-labelledby="judul-form-guru" onSubmit={simpan} noValidate className="dlg-form">
            <h2 id="judul-form-guru" className="dlg-title">
              {dialog.id === null ? "Tambah Guru BK Baru" : "Ubah Data Guru BK"}
            </h2>
            <p className="dlg-sub">{dialog.id === null ? "Isi data lengkap guru BK baru." : "Perbarui data guru yang dipilih."}</p>

            <div className="dlg-grid">
              <div className="dlg-span2">
                <label htmlFor="g-nama" className="frm-label">Nama (beserta gelar)</label>
                <input id="g-nama" autoFocus value={dialog.nilai.nama} onChange={(e) => ubahField("nama", e.target.value)} placeholder="Contoh: Budi Santoso, S.Psi." className={`${INPUT_CLS} ${bd("nama")}`} />
                {errors.nama && <p role="alert" className="frm-error">{errors.nama}</p>}
              </div>

              <div>
                <label htmlFor="g-nip" className="frm-label">NIP <span className="frm-hint">(opsional)</span></label>
                <input id="g-nip" inputMode="numeric" maxLength={18} value={dialog.nilai.nip} onChange={(e) => ubahField("nip", e.target.value.replace(/\D/g, ""))} placeholder="18 digit" className={`${INPUT_CLS} ${bd("nip")}`} />
                {errors.nip && <p role="alert" className="frm-error">{errors.nip}</p>}
              </div>

              <div>
                <label htmlFor="g-nohp" className="frm-label">No. HP <span className="frm-hint">(opsional)</span></label>
                <input id="g-nohp" inputMode="tel" value={dialog.nilai.no_hp} onChange={(e) => ubahField("no_hp", e.target.value)} placeholder="08xxxxxxxxxx" className={`${INPUT_CLS} field-ok`} />
              </div>

              <div>
                <label htmlFor="g-username" className="frm-label">Username</label>
                <input id="g-username" autoCapitalize="none" value={dialog.nilai.username} onChange={(e) => ubahField("username", e.target.value)} placeholder="nama.panggilan" className={`${INPUT_CLS} ${bd("username")}`} />
                {errors.username && <p role="alert" className="frm-error">{errors.username}</p>}
              </div>

              <div>
                <label htmlFor="g-penugasan" className="frm-label">Penugasan</label>
                <select id="g-penugasan" value={dialog.nilai.penugasan} onChange={(e) => ubahField("penugasan", e.target.value)} className={`${INPUT_CLS} field-ok`}>
                  {PENUGASAN.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="g-status" className="frm-label">Status</label>
                <select id="g-status" value={dialog.nilai.aktif ? "aktif" : "nonaktif"} onChange={(e) => ubahField("aktif", e.target.value === "aktif")} className={`${INPUT_CLS} field-ok`}>
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="dlg-span2">
                <label htmlFor="g-password" className="frm-label">
                  {dialog.id === null ? "Password awal" : "Password baru"}{" "}
                  {dialog.id !== null && <span className="frm-hint">(kosongkan jika tidak diganti)</span>}
                </label>
                <input id="g-password" type="password" autoComplete="new-password" value={dialog.nilai.password} onChange={(e) => ubahField("password", e.target.value)} placeholder="Minimal 8 karakter" className={`${INPUT_CLS} ${bd("password")}`} />
                {errors.password && <p role="alert" className="frm-error">{errors.password}</p>}
              </div>
            </div>

            <div className="dlg-actions">
              <button type="button" onClick={() => setDialog(null)} className="btn-cancel-round" disabled={saving}>Batal</button>
              <button type="submit" className={BTN_PRIMARY + " btn-wide"} disabled={saving}>
                {saving ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dialog hapus */}
      {hapus && (
        <div className="dlg-overlay-blur" onKeyDown={tekan}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="judul-hapus-guru" className="dlg-confirm">
            <div className="dlg-del-row">
              <span className="dlg-icon-danger"><Trash2 className="size-5" /></span>
              <div>
                <h2 id="judul-hapus-guru" className="dlg-title">Hapus guru BK?</h2>
                <p className="copy-sub-1">
                  Akun <span className="semibold">{hapus.nama}</span> ({hapus.username}) akan dihapus dan tidak bisa login lagi. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="dlg-actions-tight">
              <button type="button" autoFocus onClick={() => setHapus(null)} className="btn-cancel-round" disabled={deleting}>Batal</button>
              <button type="button" onClick={konfirmasiHapus} className="btn-danger-round" disabled={deleting}>
                {deleting ? "Menghapus…" : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
