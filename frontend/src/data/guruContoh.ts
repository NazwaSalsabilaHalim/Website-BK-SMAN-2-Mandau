import { HASIL_CONTOH, type Kategori } from "./riwayatContoh";

/* -----------------------------------------------------------
   DATA CONTOH untuk halaman guru BK.
   Nanti diganti data dari API (tabel konseling, siswa).
   ----------------------------------------------------------- */

export type StatusPermohonan =
  | "menunggu"
  | "disetujui"
  | "ditolak"
  | "selesai"
  | "lanjutan"; // perlu pertemuan lanjutan

export type Permohonan = {
  id: number;
  nama: string;
  kelas: string;
  jenis: Kategori;
  topik: string;
  /** Jadwal sesi, format yyyy-mm-dd */
  tanggal: string;
  /** Format hh:mm */
  jam: string;
  status: StatusPermohonan;
  /** Waktu siswa mengajukan: yyyy-mm-ddThh:mm */
  diajukan: string;
  deskripsi?: string;
  catatan?: string;
  nisn?: string;
  totalSesi?: number;
};

export const AKTIF: StatusPermohonan[] = ["menunggu", "disetujui", "lanjutan"];

// Urutan array = urutan tampil. Aktif: 7, riwayat (selesai/ditolak): 9. Total 16.
export const PERMOHONAN: Permohonan[] = [
  { id: 1, nama: "Andi Saputra", kelas: "XII IPA 1", jenis: "Akademik", topik: "Konsultasi Jurusan", tanggal: "2023-10-12", jam: "09:00", status: "menunggu", diajukan: "2023-10-10T15:20" },
  { id: 2, nama: "Rina Marlina", kelas: "XI IPS 2", jenis: "Sosial", topik: "Masalah Pertemanan", tanggal: "2023-10-11", jam: "14:30", status: "menunggu", diajukan: "2023-10-09T10:05" },
  { id: 3, nama: "Deni Kurniawan", kelas: "X-4", jenis: "Karier", topik: "Tes Bakat Minat", tanggal: "2023-10-10", jam: "08:30", status: "disetujui", diajukan: "2023-10-08T13:40" },
  {
    id: 4,
    nama: "Andi Pratama",
    kelas: "XI MIPA 4",
    jenis: "Akademik",
    topik: "Kesulitan Belajar Terpusat",
    tanggal: "2023-10-26",
    jam: "10:00",
    status: "disetujui",
    diajukan: "2023-10-24T08:45",
    nisn: "0045612890",
    totalSesi: 3,
    deskripsi:
      "Saya merasa sangat kesulitan mengikuti materi Matematika Peminatan akhir-akhir ini. Saya merasa cemas setiap kali ada kuis dan tidak bisa konsentrasi saat belajar mandiri.",
    catatan:
      "Siswa menunjukkan peningkatan motivasi belajar namun masih terkendala manajemen waktu di rumah.",
  },
  { id: 5, nama: "Siska Putri", kelas: "XI IPS 4", jenis: "Pribadi", topik: "Sulit tidur sebelum ujian", tanggal: "2023-10-27", jam: "13:00", status: "menunggu", diajukan: "2023-10-25T19:10" },
  { id: 6, nama: "Budi Permana", kelas: "XII IPS 2", jenis: "Karier", topik: "Rencana kuliah luar kota", tanggal: "2023-10-22", jam: "10:15", status: "lanjutan", diajukan: "2023-10-19T09:30" },
  { id: 7, nama: "Endah Sari", kelas: "XI MIPA 4", jenis: "Pribadi", topik: "Rasa tidak percaya diri", tanggal: "2023-10-15", jam: "09:30", status: "lanjutan", diajukan: "2023-10-12T11:00" },
  { id: 8, nama: "Ahmad Subarjo", kelas: "XI MIPA 4", jenis: "Akademik", topik: "Strategi belajar efektif", tanggal: "2023-10-24", jam: "08:30", status: "selesai", diajukan: "2023-10-21T16:45" },
  { id: 9, nama: "Citra Nuraini", kelas: "XI MIPA 4", jenis: "Sosial", topik: "Hubungan dengan teman sekelas", tanggal: "2023-10-20", jam: "11:00", status: "selesai", diajukan: "2023-10-17T14:15" },
  { id: 10, nama: "Dedi Ramadhan", kelas: "XII IPS 2", jenis: "Akademik", topik: "Motivasi belajar menurun", tanggal: "2023-10-18", jam: "13:30", status: "selesai", diajukan: "2023-10-16T08:50" },
  { id: 11, nama: "Fajar Nugroho", kelas: "X-2", jenis: "Akademik", topik: "Adaptasi pelajaran SMA", tanggal: "2023-10-10", jam: "10:00", status: "selesai", diajukan: "2023-10-07T12:30" },
  { id: 12, nama: "Gita Permata", kelas: "XI IPS 1", jenis: "Pribadi", topik: "Mengelola rasa cemas", tanggal: "2023-10-05", jam: "09:00", status: "selesai", diajukan: "2023-10-03T10:10" },
  { id: 13, nama: "Hendra Wijaya", kelas: "XII IPA 2", jenis: "Karier", topik: "Informasi beasiswa kuliah", tanggal: "2023-10-02", jam: "14:00", status: "selesai", diajukan: "2023-09-29T15:00" },
  { id: 14, nama: "Intan Lestari", kelas: "X-1", jenis: "Sosial", topik: "Kesulitan bergaul", tanggal: "2023-09-28", jam: "08:00", status: "selesai", diajukan: "2023-09-26T09:25" },
  { id: 15, nama: "Joko Santoso", kelas: "X-3", jenis: "Akademik", topik: "Ingin pindah kelas", tanggal: "2023-09-20", jam: "10:30", status: "ditolak", diajukan: "2023-09-18T13:05" },
  { id: 16, nama: "Lia Amelia", kelas: "XI IPA 3", jenis: "Pribadi", topik: "Masalah keluarga", tanggal: "2023-09-14", jam: "15:00", status: "ditolak", diajukan: "2023-09-12T17:40" },
];

/* -----------------------------------------------------------
   Gaya
   ----------------------------------------------------------- */
export const STATUS_PERMOHONAN: Record<
  StatusPermohonan,
  { label: string; teks: string; dot: string; badge: string }
> = {
  menunggu: { label: "Menunggu", teks: "text-amber-800", dot: "bg-amber-700", badge: "bg-amber-100 text-amber-800" },
  disetujui: { label: "Disetujui", teks: "text-blue-700", dot: "bg-blue-700", badge: "bg-blue-100 text-blue-800" },
  ditolak: { label: "Ditolak", teks: "text-red-700", dot: "bg-red-600", badge: "bg-red-100 text-red-700" },
  selesai: { label: "Selesai", teks: "text-green-700", dot: "bg-green-600", badge: "bg-green-100 text-green-700" },
  lanjutan: { label: "Perlu Pertemuan Lanjutan", teks: "text-amber-800", dot: "bg-amber-600", badge: "bg-amber-100 text-amber-800" },
};

export const AVATAR_STYLE = [
  "bg-blue-100 text-blue-800",
  "bg-orange-100 text-orange-700",
  "bg-indigo-100 text-indigo-700",
  "bg-red-100 text-red-700",
  "bg-green-100 text-green-700",
];

/* -----------------------------------------------------------
   Helper
   ----------------------------------------------------------- */
export function inisial(nama: string) {
  return nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k.charAt(0).toUpperCase())
    .join("");
}

const keTanggal = (iso: string) => new Date(`${iso}T00:00:00`);

/** 2023-10-12 + 09:00 -> "12 Okt 2023, 09:00" */
export function formatJadwal(tanggal: string, jam: string) {
  const t = keTanggal(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${t}, ${jam}`;
}

/** 2023-10-12 -> "12 Okt 2023" */
export function formatTanggalPendek(iso: string) {
  return keTanggal(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** 2023-10-24T08:45 -> "24 Oktober 2023 — 08:45 WIB" */
export function formatDiajukan(iso: string) {
  const [tgl, jam] = iso.split("T");
  const t = keTanggal(tgl).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${t} — ${jam} WIB`;
}

/** Semester dari tanggal: Juli-Desember = Ganjil, Januari-Juni = Genap. */
export function semesterDari(iso: string) {
  const thn = Number(iso.slice(0, 4));
  const bln = Number(iso.slice(5, 7));
  return bln >= 7
    ? `Semester Ganjil ${thn}/${thn + 1}`
    : `Semester Genap ${thn - 1}/${thn}`;
}

// Data pelengkap detail siswa. Nanti dari tabel siswa. Dipilih tetap (bukan acak) dari nama kelas.
const WALI_KELAS = [
  "Drs. Bambang Hartono",
  "Dra. Siti Aminah",
  "Lilis Suryani, S.Pd.",
  "Rahmat Hidayat, S.Pd.",
];

export function profilSiswa(p: Permohonan) {
  return {
    nisn: p.nisn ?? `00456${String(p.id).padStart(5, "0")}`,
    waliKelas: WALI_KELAS[p.kelas.length % WALI_KELAS.length],
    totalSesi: p.totalSesi ?? 1 + (p.id % 4),
    deskripsi:
      p.deskripsi ??
      `Saya ingin berkonsultasi mengenai ${p.topik.toLowerCase()}. Mohon bantuan Bapak/Ibu guru BK.`,
    catatan: p.catatan ?? "Belum ada catatan.",
  };
}

/** Isi awal form hasil untuk sesi yang sudah dilakukan (contoh). */
export function hasilAwal(p: Permohonan) {
  const sudah = p.status === "selesai" || p.status === "lanjutan";
  return {
    deskripsi: sudah ? HASIL_CONTOH.deskripsi.join("\n\n") : "",
    hasil: sudah ? HASIL_CONTOH.hasil.map((h, i) => `${i + 1}. ${h}`).join("\n") : "",
    evaluasi: sudah ? HASIL_CONTOH.rencana.map((r) => `${r.judul}: ${r.isi}`).join("\n") : "",
  };
}

/** Isi CSV (dengan BOM agar terbaca benar di Excel) untuk unduh laporan. */
export function buatCsv(rows: Permohonan[]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = ["Nama Siswa", "Kelas", "Jenis Layanan", "Tanggal", "Status"];
  const baris = rows.map((r) =>
    [r.nama, r.kelas, r.jenis, formatTanggalPendek(r.tanggal), STATUS_PERMOHONAN[r.status].label]
      .map(esc)
      .join(","),
  );
  return "\uFEFF" + [header.map(esc).join(","), ...baris].join("\r\n");
}
