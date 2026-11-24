/* -----------------------------------------------------------
   DATA CONTOH untuk halaman siswa.
   Nanti diganti data dari API (tabel konseling).
   ----------------------------------------------------------- */

export type Status = "menunggu" | "disetujui" | "ditolak" | "selesai";
export type Kategori = "Akademik" | "Pribadi" | "Karier" | "Sosial";

export type Riwayat = {
  id: number;
  /** Format yyyy-mm-dd */
  tanggal: string;
  kategori: Kategori;
  guru: string;
  status: Status;
  topik: string;
};

export const KATEGORI: Kategori[] = ["Akademik", "Pribadi", "Karier", "Sosial"];

export const GURU_BK = ["Ibu Ratna Sari, S.Pd.", "Bapak Ahmad Junaidi, M.Pd."];

const RATNA = GURU_BK[0];
const AHMAD = GURU_BK[1];

// Urut dari yang terbaru. Total 12: selesai 8, menunggu 2, disetujui 1, ditolak 1.
export const RIWAYAT: Riwayat[] = [
  { id: 1, tanggal: "2023-10-24", kategori: "Akademik", guru: RATNA, status: "selesai", topik: "Konseling Pengembangan Diri" },
  { id: 2, tanggal: "2023-10-15", kategori: "Pribadi", guru: AHMAD, status: "menunggu", topik: "Sulit berkonsentrasi di kelas" },
  { id: 3, tanggal: "2023-10-02", kategori: "Karier", guru: RATNA, status: "disetujui", topik: "Pilihan jurusan kuliah" },
  { id: 4, tanggal: "2023-09-20", kategori: "Akademik", guru: RATNA, status: "ditolak", topik: "Kesulitan belajar Matematika" },
  { id: 5, tanggal: "2023-09-12", kategori: "Akademik", guru: AHMAD, status: "selesai", topik: "Mengatur jadwal belajar" },
  { id: 6, tanggal: "2023-09-05", kategori: "Pribadi", guru: RATNA, status: "selesai", topik: "Mengelola rasa cemas saat ujian" },
  { id: 7, tanggal: "2023-08-28", kategori: "Sosial", guru: AHMAD, status: "selesai", topik: "Hubungan dengan teman sekelas" },
  { id: 8, tanggal: "2023-08-14", kategori: "Akademik", guru: RATNA, status: "selesai", topik: "Strategi belajar efektif" },
  { id: 9, tanggal: "2023-07-31", kategori: "Karier", guru: AHMAD, status: "menunggu", topik: "Informasi beasiswa kuliah" },
  { id: 10, tanggal: "2023-07-17", kategori: "Akademik", guru: RATNA, status: "selesai", topik: "Motivasi belajar menurun" },
  { id: 11, tanggal: "2023-07-03", kategori: "Pribadi", guru: AHMAD, status: "selesai", topik: "Mengenal minat dan bakat" },
  { id: 12, tanggal: "2023-06-19", kategori: "Sosial", guru: RATNA, status: "selesai", topik: "Adaptasi lingkungan sekolah" },
];

export const SESI_CONTOH = {
  waktu: "10:00 - 11:30 WIB",
  tempat: "Ruang Konseling Utama",
};

export const HASIL_CONTOH = {
  deskripsi: [
    "Siswa datang untuk berkonsultasi mengenai tantangan dalam mengatur waktu antara kegiatan organisasi OSIS dan persiapan ujian tengah semester yang akan datang. Siswa melaporkan adanya gejala stres ringan, sulit tidur, dan kecemasan terkait performa akademiknya yang dirasa menurun dalam sebulan terakhir.",
    "Fokus utama sesi adalah mengidentifikasi prioritas dan mencari cara untuk mengurangi beban kognitif siswa tanpa harus meninggalkan tanggung jawab organisasinya sepenuhnya.",
  ],
  hasil: [
    "Siswa memahami teknik Eisenhower Matrix untuk membedakan antara tugas yang mendesak dan penting.",
    "Ditemukan bahwa penyebab utama stres adalah kurangnya istirahat yang terjadwal di hari Sabtu-Minggu.",
    "Siswa berkomitmen untuk mencoba teknik Pomodoro selama masa belajar intensif ujian.",
  ],
  rencana: [
    {
      judul: "Menyusun Jadwal Mingguan Baru",
      isi: "Siswa akan mengumpulkan draf jadwal mingguan yang sudah memasukkan waktu istirahat 8 jam.",
    },
    {
      judul: "Delegasi Tugas OSIS",
      isi: "Mendelegasikan 2 tugas utama di OSIS kepada wakil koordinator untuk 2 minggu kedepan.",
    },
  ],
  kesimpulan:
    "Siswa menunjukkan perkembangan yang positif dalam mengenali batasan diri. Ia proaktif dalam mencari solusi dan jujur mengenai beban mental yang dihadapi. Disarankan untuk tetap dipantau melalui jurnal harian emosi.",
};

export const ALASAN_TOLAK_CONTOH =
  "Jadwal yang diajukan bertabrakan dengan kegiatan sekolah. Silakan ajukan ulang dengan tanggal atau waktu lain.";

/* -----------------------------------------------------------
   Gaya badge
   ----------------------------------------------------------- */
export const STATUS_STYLE: Record<
  Status,
  { label: string; badge: string; dot: string }
> = {
  menunggu: {
    label: "Menunggu",
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-600",
  },
  disetujui: {
    label: "Disetujui",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-600",
  },
  ditolak: {
    label: "Ditolak",
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-600",
  },
  selesai: {
    label: "Selesai",
    badge: "bg-blue-100 text-blue-800",
    dot: "bg-blue-700",
  },
};

export const KATEGORI_STYLE: Record<Kategori, string> = {
  Akademik: "bg-blue-100 text-blue-800",
  Pribadi: "bg-orange-100 text-orange-700",
  Karier: "bg-sky-100 text-sky-800",
  Sosial: "bg-purple-100 text-purple-700",
};

/* -----------------------------------------------------------
   Helper
   ----------------------------------------------------------- */
const keTanggal = (iso: string) => new Date(`${iso}T00:00:00`);

/** 2023-10-24 -> "24 Okt 2023" */
export function formatTanggal(iso: string) {
  return keTanggal(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** 2023-10-24 -> "Selasa, 24 Oktober 2023" */
export function formatTanggalPanjang(iso: string) {
  return keTanggal(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function hitungRingkasan(list: Riwayat[]) {
  const hitung = (s: Status) => list.filter((r) => r.status === s).length;
  return {
    total: list.length,
    menunggu: hitung("menunggu"),
    disetujui: hitung("disetujui"),
    ditolak: hitung("ditolak"),
    selesai: hitung("selesai"),
  };
}

/** Pertemuan ke-berapa (hanya dihitung dari sesi yang sudah selesai). */
export function nomorPertemuan(item: Riwayat) {
  return RIWAYAT.filter(
    (r) => r.status === "selesai" && r.tanggal <= item.tanggal,
  ).length;
}

/** ID dokumen: CNSL-2023-1024-001 */
export function idDokumen(item: Riwayat) {
  const [thn, bln, tgl] = item.tanggal.split("-");
  return `CNSL-${thn}-${bln}${tgl}-${String(item.id).padStart(3, "0")}`;
}
