import { API_URL } from "@/lib/bkAuth";

/** Bentuk data dari GET /api/berita */
export type Berita = {
  id: number;
  judul: string;
  slug: string;
  kategori: string;
  ringkasan: string;
  /** HTML. Kalau nanti ditampilkan utuh, bersihkan dulu (mis. DOMPurify). */
  isi: string;
  gambar: string | null;
  status: string;
  /** yyyy-mm-dd, draft boleh kosong */
  tanggal: string | null;
  tayangan: number;
};

/** Hanya yang berstatus published, terbaru di atas. */
export function daftarBeritaTayang(data: Berita[] | { data: Berita[] } | null): Berita[] {
  const list = Array.isArray(data) ? data : (data?.data ?? []);
  return list
    .filter((b) => b.status === "published")
    .sort(
      (a, b) =>
        (b.tanggal ?? "").localeCompare(a.tanggal ?? "") || b.id - a.id,
    );
}

/**
 * URL gambar yang bisa dipakai. Alamat blob: hanya berlaku di tab browser
 * yang membuatnya, jadi dianggap tidak ada dan diganti gambar cadangan.
 */
export function gambarBerita(b: Berita, cadangan: string) {
  const g = b.gambar ?? "";
  if (g.startsWith("/storage/")) return `${API_URL}${g}`;
  if (/^https?:\/\//.test(g) || g.startsWith("/")) return g;
  return cadangan;
}

const LABEL_KATEGORI: Record<string, string> = {
  BK: "BK SMAN 2 Mandau",
  "PIK-R": "PIK-R Mandau",
};

export const labelKategori = (k: string) => LABEL_KATEGORI[k] ?? k;