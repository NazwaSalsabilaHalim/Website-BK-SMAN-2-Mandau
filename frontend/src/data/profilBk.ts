/**
 * DATA RESMI BK SMAN 2 MANDAU
 * Sumber: dokumen "Data Bimbingan dan Konseling SMAN 2 Mandau" dari guru BK,
 * dengan rujukan Permendikbud No. 111 Tahun 2014.
 *
 * Catatan penyuntingan: salah ketik dari dokumen sumber sudah dibetulkan
 * ("kerahasian", "tahum", "Khasim", "masalah- masalah"), dan "karir" ditulis "karier"
 * agar sama dengan istilah di aplikasi. Isi dan maknanya tidak diubah.
 */

export const PROFIL_BK = {
  nama: "Bimbingan dan Konseling SMAN 2 Mandau",
  deskripsi: [
    "Bimbingan dan Konseling adalah layanan yang diberikan oleh guru bimbingan dan konseling dalam membantu peserta didik mengembangkan kemampuan dan keterampilannya, mengentaskan permasalahan yang dihadapinya, dan mencapai kemandirian dalam kehidupannya pada bidang pribadi, sosial, belajar, dan karier.",
    "Layanan bimbingan dan konseling diberikan kepada seluruh peserta didik SMAN 2 Mandau dengan mengedepankan asas kerahasiaan, kesukarelaan, dan keterbukaan. Layanan ini diberikan oleh para pendidik profesional pada bidangnya yang memahami perkembangan peserta didik dengan baik.",
    "Guru bimbingan dan konseling hadir untuk membantu peserta didik menelusuri dan mengembangkan potensi yang dimilikinya, merencanakan masa depan dengan baik, dan menemukan solusi dari permasalahan yang dihadapinya secara mandiri.",
  ],
} as const;

export const VISI_BK =
  "Terwujudnya kehidupan sehari-hari siswa sebagai pelajar dan remaja yang normatif, dinamis, dan konstruktif melalui tersedianya pelayanan bantuan dalam perkembangannya dan pengentasan masalah-masalah, agar siswa tumbuh, berdaya, unggul, mandiri, dan optimal dalam perkembangan sesuai minat dan potensi keterbakatan serta spektrum kecerdasan yang dimilikinya.";

export const MISI_BK = [
  {
    judul: "Misi Pendidikan",
    isi: "Layanan bimbingan dan konseling berupaya mendukung pengembangan diri siswa melalui pembentukan perilaku efektif, normatif, dan cerdas dalam kehidupan sehari-hari dan masa depan.",
  },
  {
    judul: "Misi Pengembangan",
    isi: "Layanan bimbingan dan konseling berupaya mendukung pengembangan potensi dan kompetensi siswa di dalam lingkungan sekolah, keluarga, dan masyarakat.",
  },
  {
    judul: "Misi Pengentasan Masalah",
    isi: "Layanan bimbingan dan konseling berupaya memfasilitasi pengentasan masalah-masalah siswa dengan mengacu pada prinsip hidup yang berbahagia, efektif, normatif, dan cerdas.",
  },
] as const;

export const TUJUAN_BK = [
  "Membantu peserta didik memahami, menerima, mengarahkan, dan mengembangkan potensi minat, bakat, kreativitas dan kemampuannya, serta kompetensi belajarnya seoptimal mungkin.",
  "Membantu peserta didik menyesuaikan diri dengan keadaan dan kebiasaan dalam kehidupan di lingkungan asrama, sekolah, dan masyarakat serta kemampuan sosial dalam kehidupan keagamaan.",
  "Membantu peserta didik memiliki wawasan terhadap arah studi dan perencanaan karier serta mandiri dalam merencanakan kehidupan masa depannya yang sesuai dengan tuntutan pada saat ini maupun di masa yang akan datang.",
] as const;

/** Tiga asas utama yang disebut dalam profil layanan. */
export const ASAS_UTAMA = [
  {
    nama: "Kerahasiaan",
    isi: "Konselor atau guru BK merahasiakan segenap data dan keterangan tentang peserta didik, sesuai kode etik bimbingan dan konseling.",
  },
  {
    nama: "Kesukarelaan",
    isi: "Peserta didik mengikuti layanan atas dasar kesukaan dan kerelaan terhadap layanan yang diperlukannya.",
  },
  {
    nama: "Keterbukaan",
    isi: "Layanan bersifat terbuka dan tidak berpura-pura dalam memberikan dan menerima informasi.",
  },
] as const;

/** Sepuluh fungsi BK menurut Permendikbud No. 111 Tahun 2014. */
export const FUNGSI_BK = [
  { nama: "Pemahaman", isi: "Membantu konseli memiliki pemahaman yang lebih baik terhadap dirinya dan lingkungannya (pendidikan, pekerjaan, budaya, dan norma agama)." },
  { nama: "Fasilitasi", isi: "Memberikan kemudahan kepada konseli dalam mencapai pertumbuhan dan perkembangan yang optimal, serasi, selaras, dan seimbang pada seluruh aspek pribadinya." },
  { nama: "Penyesuaian", isi: "Membantu konseli menyesuaikan diri dengan diri sendiri dan lingkungannya secara dinamis dan konstruktif." },
  { nama: "Penyaluran", isi: "Membantu konseli merencanakan pendidikan, pekerjaan, dan karier masa depan, termasuk memilih program peminatan yang sesuai dengan kemampuan, minat, bakat, keahlian, dan kepribadiannya." },
  { nama: "Adaptasi", isi: "Membantu pelaksana pendidikan (kepala sekolah, staf administrasi, dan guru) menyesuaikan program dan aktivitas pendidikan dengan latar belakang, minat, kemampuan, dan kebutuhan peserta didik." },
  { nama: "Pencegahan", isi: "Membantu peserta didik mengantisipasi kemungkinan timbulnya masalah dan berupaya mencegahnya." },
  { nama: "Perbaikan dan Penyembuhan", isi: "Membantu peserta didik yang bermasalah memperbaiki kekeliruan berpikir, berperasaan, berkehendak, dan bertindak." },
  { nama: "Pemeliharaan", isi: "Membantu peserta didik menjaga kondisi pribadi yang sehat-normal dan mempertahankan situasi kondusif yang telah tercipta dalam dirinya." },
  { nama: "Pengembangan", isi: "Menciptakan lingkungan belajar yang kondusif yang memfasilitasi perkembangan peserta didik melalui jejaring yang kolaboratif." },
  { nama: "Advokasi", isi: "Membantu peserta didik berupa pembelaan terhadap hak-haknya yang mengalami perlakuan diskriminatif." },
] as const;

/**
 * Empat bidang layanan BK.
 * `kategoriAplikasi` = nama kategori yang dipakai di aplikasi saat ini.
 * Istilah resmi untuk bidang ketiga adalah "Belajar", sedangkan aplikasi memakai "Akademik".
 */
export const BIDANG_LAYANAN = [
  {
    nama: "Pribadi",
    kategoriAplikasi: "Pribadi",
    isi: "Bantuan agar siswa mampu memahami, menerima, mengarahkan, mengambil keputusan, dan merealisasikan keputusannya secara bertanggung jawab tentang perkembangan aspek pribadinya, sehingga mencapai perkembangan pribadi yang optimal.",
  },
  {
    nama: "Sosial",
    kategoriAplikasi: "Sosial",
    isi: "Bantuan agar siswa memahami lingkungannya, berinteraksi sosial secara positif dan terampil, mengatasi masalah sosial yang dialami, serta menyesuaikan diri dengan lingkungan sosialnya.",
  },
  {
    nama: "Belajar",
    kategoriAplikasi: "Akademik",
    isi: "Bantuan agar siswa mengenali potensi belajarnya, memiliki sikap dan keterampilan belajar, terampil merencanakan pendidikan, siap menghadapi ujian, dan memiliki kebiasaan belajar yang teratur.",
  },
  {
    nama: "Karier",
    kategoriAplikasi: "Karier",
    isi: "Bantuan agar siswa bertumbuh, mengeksplorasi, dan mengambil keputusan karier secara rasional dan realistis berdasarkan potensi diri serta kesempatan yang tersedia di lingkungannya.",
  },
] as const;

/**
 * Guru BK SMAN 2 Mandau.
 * Tempat dan tanggal lahir dari dokumen sumber SENGAJA tidak dimasukkan,
 * karena tidak perlu ditampilkan di website publik.
 * `foto` = taruh file di public/images/bk/ (kalau belum ada, tampil inisial).
 */
export const GURU_BK_SEKOLAH = [
  {
    nama: "Ade Irma Syafnita, S.Psi",
    pendidikan:
      "S1 Psikologi, UIN Sultan Syarif Kasim Riau (UIN SUSKA RIAU), lulus 2007.",
    motto:
      "Anda tidak harus hebat untuk memulai, tapi Anda harus memulai untuk menjadi orang hebat.",
    foto: "/images/bk/guru-ade-irma.jpg",
  },
  {
    nama: "Lisa Khairiani, S.Pd., Gr.",
    pendidikan:
      "S1 Bimbingan dan Konseling, Universitas Riau (2018-2022); PPG Prajabatan 2022, Universitas Ahmad Dahlan.",
    motto: "Ubah mindsetmu untuk merubah duniamu.",
    foto: "/images/bk/guru-lisa.jpg",
  },
  {
    nama: "Rhifani Benawati, S.Sos.",
    pendidikan:
      "S1 Bimbingan dan Konseling Islam, UIN Sultan Syarif Kasim Riau, lulus 2023.",
    motto: "Jalani, nikmati, dan syukuri.",
    foto: "/images/bk/guru-rhifani.jpg",
  },
] as const;
