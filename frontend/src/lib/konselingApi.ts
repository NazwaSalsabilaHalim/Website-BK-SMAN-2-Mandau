import { useEffect, useState } from "react";
import { API_URL, LOGIN_BY_ROLE, clearSession, getSession } from "@/lib/bkAuth";
import type { Kategori } from "@/data/riwayatContoh";

export type KonselingStatus =
  | "menunggu"
  | "disetujui"
  | "ditolak"
  | "selesai"
  | "perlu_pertemuan_lanjutan";

export type RencanaTindak = { judul: string; isi: string };

/** Bentuk data dari GET /api/konseling */
export type Konseling = {
  id: number;
  siswa: string;
  nis: string;
  kelas: string;
  guru_bk_id: number;
  guru: string;
  kategori: Kategori;
  jenis_layanan: string;
  topik: string;
  deskripsi: string;
  /** yyyy-mm-dd */
  tanggal: string;
  /** HH:MM */
  waktu: string;
  status: KonselingStatus;
  alasan_penolakan: string;
  deskripsi_kegiatan: string;
  hasil_konseling: string;
  evaluasi: string;
  rencana_tindak_lanjut: RencanaTindak[];
  dibuat: string;
  diperbarui: string;
};

export type GuruPilihan = { id: number; nama: string; penugasan: string };

export type Me = {
  user: { id: number; name: string; username: string; role: string; nis?: string; kelas?: string };
};

/* ---------------------------------------------------------- */
/* Request                                                     */
/* ---------------------------------------------------------- */
export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function apiFetch<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const session = getSession();
  const adaBody = init.body !== undefined;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method: init.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(adaBody ? { "Content-Type": "application/json" } : {}),
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      body: adaBody ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Tidak bisa terhubung ke server. Pastikan backend berjalan.");
  }

  if (res.status === 401) {
    const role = session?.role;
    clearSession();
    window.location.assign(role ? LOGIN_BY_ROLE[role] : "/login/siswa");
    throw new ApiError(401, "Sesi berakhir, silakan login lagi.");
  }

  const raw: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const err = (raw ?? {}) as { message?: string; errors?: Record<string, string[]> };
    throw new ApiError(res.status, err.message ?? "Terjadi kesalahan.", err.errors ?? {});
  }

  return raw as T;
}

/** Ambil data GET saat halaman dibuka. */
export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let batal = false;
    apiFetch<T>(path)
      .then((d) => {
        if (!batal) {
          setData(d);
          setError("");
        }
      })
      .catch((e: unknown) => {
        if (!batal) setError(e instanceof Error ? e.message : "Gagal memuat data.");
      })
      .finally(() => {
        if (!batal) setLoading(false);
      });
    return () => {
      batal = true;
    };
  }, [path]);

  return { data, error, loading };
}

/* ---------------------------------------------------------- */
/* Gaya status + helper                                        */
/* ---------------------------------------------------------- */
type GayaStatus = { label: string; badge: string; dot: string };

const STATUS_API_STYLE: Record<KonselingStatus, GayaStatus> = {
  menunggu: { label: "Menunggu", badge: "bg-amber-100 text-amber-800", dot: "bg-amber-600" },
  disetujui: { label: "Disetujui", badge: "bg-green-100 text-green-700", dot: "bg-green-600" },
  ditolak: { label: "Ditolak", badge: "bg-red-100 text-red-700", dot: "bg-red-600" },
  selesai: { label: "Selesai", badge: "bg-blue-100 text-blue-800", dot: "bg-blue-700" },
  perlu_pertemuan_lanjutan: {
    label: "Perlu Pertemuan Lanjutan",
    badge: "bg-orange-100 text-orange-700",
    dot: "bg-orange-600",
  },
};

export function gayaStatus(status: string): GayaStatus {
  return (
    STATUS_API_STYLE[status as KonselingStatus] ?? {
      label: status,
      badge: "bg-gray-100 text-gray-700",
      dot: "bg-gray-500",
    }
  );
}

/** Sesi yang hasilnya sudah diisi guru. */
export const punyaHasil = (s: KonselingStatus) =>
  s === "selesai" || s === "perlu_pertemuan_lanjutan";

export function hitungRingkasan(list: Konseling[]) {
  const hitung = (s: KonselingStatus) => list.filter((r) => r.status === s).length;
  return {
    total: list.length,
    menunggu: hitung("menunggu"),
    disetujui: hitung("disetujui"),
    ditolak: hitung("ditolak"),
    selesai: hitung("selesai"),
  };
}

/** Pertemuan ke-berapa (dari sesi yang hasilnya sudah diisi). */
export function nomorPertemuan(item: Konseling, list: Konseling[]) {
  return list.filter((r) => punyaHasil(r.status) && r.tanggal <= item.tanggal).length;
}

/** ID dokumen: CNSL-2026-1124-001 */
export function idDokumen(item: Konseling) {
  const [thn, bln, tgl] = item.tanggal.split("-");
  return `CNSL-${thn}-${bln}${tgl}-${String(item.id).padStart(3, "0")}`;
}

/** Pecah teks panjang jadi paragraf per baris. */
export function pecahBaris(teks: string) {
  return teks
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}