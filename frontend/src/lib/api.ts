/**
 * src/lib/api.ts
 * Helper fetch terpusat — semua request ke backend Laravel.
 * Otomatis sisipkan token Sanctum dari session, tangani 401 (logout otomatis),
 * dan parsing error validasi (422) ke Record<string, string>.
 */

import { API_URL, clearSession, getSession } from "./bkAuth";

// ─── Tipe umum ───────────────────────────────────────────────────────────────

export type ApiError = {
  status: number;
  message: string;
  /** Validasi Laravel: { field: "pesan error" } */
  errors?: Record<string, string>;
};

// ─── Core fetch ──────────────────────────────────────────────────────────────

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const session = getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (session?.token) headers["Authorization"] = `Bearer ${session.token}`;

  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    // Token kadaluarsa — paksa logout
    clearSession();
    window.location.href = "/";
    throw { status: 401, message: "Sesi habis, silakan login kembali." } satisfies ApiError;
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Ubah errors validasi Laravel {field: ["msg1"]} → {field: "msg1"}
    const rawErrors = json.errors as Record<string, string[]> | undefined;
    const errors = rawErrors
      ? Object.fromEntries(
          Object.entries(rawErrors).map(([k, v]) => [k, v[0] ?? ""]),
        )
      : undefined;
    throw {
      status: res.status,
      message: json.message ?? "Terjadi kesalahan.",
      errors,
    } satisfies ApiError;
  }

  return json as T;
}

export const api = {
  get:    <T>(path: string)                     => req<T>("GET",    path),
  post:   <T>(path: string, body: unknown)      => req<T>("POST",   path, body),
  put:    <T>(path: string, body: unknown)      => req<T>("PUT",    path, body),
  patch:  <T>(path: string, body: unknown)      => req<T>("PATCH",  path, body),
  delete: <T>(path: string)                     => req<T>("DELETE", path),
};

// ─── Tipe domain ─────────────────────────────────────────────────────────────

export type GuruBkItem = {
  id: number;
  nip: string;
  nama: string;
  username: string;
  penugasan: string;
  no_hp: string;
  aktif: boolean;
  jumlahSiswa: number;
};

export type SiswaItem = {
  id: number;
  nis: string;
  nama: string;
  username: string;
  kelas: string;
  no_hp: string;
  wali: string;       // nama guru BK pembimbing
  guru_bk_id: number | null;
};

export type BeritaItem = {
  id: number;
  judul: string;
  slug: string;
  kategori: "BK" | "PIK-R";
  ringkasan: string;
  isi: string;
  gambar: string;
  status: "published" | "draft";
  tanggal: string;   // yyyy-mm-dd atau ""
  tayangan: number;
};

export type KonselingItem = {
  id: number;
  siswa: string;
  kelas: string;
  guru: string;
  jenis_layanan: string;
  topik: string;
  deskripsi: string;
  tanggal: string;
  waktu: string;
  status: "menunggu" | "disetujui" | "ditolak" | "selesai";
  alasan_penolakan: string;
  hasil_konseling: string;
  dibuat: string;
};

// ─── Endpoint helpers ────────────────────────────────────────────────────────

// Guru BK
export const guruBkApi = {
  list:   ()                            => api.get<GuruBkItem[]>("/guru-bk"),
  create: (body: Record<string, unknown>) => api.post<GuruBkItem>("/guru-bk", body),
  update: (id: number, body: Record<string, unknown>) =>
    api.put<GuruBkItem>(`/guru-bk/${id}`, body),
  remove: (id: number)                  => api.delete<{ message: string }>(`/guru-bk/${id}`),
};

// Siswa
export const siswaApi = {
  list:   ()                            => api.get<SiswaItem[]>("/siswa"),
  create: (body: Record<string, unknown>) => api.post<SiswaItem>("/siswa", body),
  update: (id: number, body: Record<string, unknown>) =>
    api.put<SiswaItem>(`/siswa/${id}`, body),
  remove: (id: number)                  => api.delete<{ message: string }>(`/siswa/${id}`),
};

// Berita
export const beritaApi = {
  list:   ()                            => api.get<BeritaItem[]>("/berita"),
  create: (body: Record<string, unknown>) => api.post<BeritaItem>("/berita", body),
  update: (id: number, body: Record<string, unknown>) =>
    api.put<BeritaItem>(`/berita/${id}`, body),
  remove: (id: number)                  => api.delete<{ message: string }>(`/berita/${id}`),
};

// Konseling
export const konselingApi = {
  list:         ()                            => api.get<KonselingItem[]>("/konseling"),
  create:       (body: Record<string, unknown>) => api.post<KonselingItem>("/konseling", body),
  updateStatus: (id: number, body: Record<string, unknown>) =>
    api.patch<KonselingItem>(`/konseling/${id}/status`, body),
};
