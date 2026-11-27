import { useEffect, useState } from "react";
import { Link } from "react-router";
import BkNavbar from "../components/bk/BkNavbar";
import BkFooter from "../components/bk/BkFooter";
import SafeImage from "../components/bk/SafeImage";
import {
  IconArrowRight,
  IconCheckCircle,
  IconClose,
  IconEye,
  IconMail,
  IconPin,
  IconShield,
  IconUsers,
} from "../components/bk/Icons";
import { API_URL } from "@/lib/bkAuth";
import DOMPurify from "dompurify";
import { daftarBeritaTayang, gambarBerita, type Berita } from "@/lib/beritaApi";
import { GURU_BK_SEKOLAH, MISI_BK, VISI_BK } from "@/data/profilBk";
import { inisial } from "@/data/guruContoh";

type BeritaCard = {
  id: number;
  judul: string;
  kategori: "BK" | "PIK-R";
  tanggal: string;
  ringkasan: string;
  isi: string;
  gambar?: string;
  warna: [string, string];
};

const BERITA_DEFAULT: BeritaCard[] = [
  {
    id: 1,
    kategori: "BK",
    tanggal: "23 Nov 2026",
    judul: "Visi, Misi, dan Tujuan Pelayanan Bimbingan dan Konseling SMAN 2 Mandau",
    ringkasan:
      "Pelayanan bimbingan dan konseling SMAN 2 Mandau mewujudkan siswa yang normatif, dinamis, konstruktif, berdaya, dan mandiri.",
    isi: "<p>Layanan bimbingan dan konseling SMAN 2 Mandau berorientasi pada kemandirian dan optimalisasi potensi peserta didik.</p>",
    gambar: "",
    warna: ["#dbeafe", "#93c5fd"],
  },
  {
    id: 2,
    kategori: "BK",
    tanggal: "23 Nov 2026",
    judul: "Mengenal 4 Bidang Layanan Bimbingan dan Konseling di Sekolah",
    ringkasan:
      "Bimbingan dan konseling mencakup empat bidang layanan: Pribadi, Sosial, Belajar, dan Karier sesuai Permendikbud No. 111 Tahun 2014.",
    isi: "<p>Empat bidang layanan memfasilitasi kebutuhan pribadi, sosial, belajar, dan pilihan masa depan karier peserta didik.</p>",
    gambar: "",
    warna: ["#d1fae5", "#6ee7b7"],
  },
  {
    id: 3,
    kategori: "PIK-R",
    tanggal: "23 Nov 2026",
    judul: "Pusat Informasi dan Konseling Remaja (PIK-R) SMAN 2 Mandau",
    ringkasan:
      "Program PIK-R menjadi wadah konseling sebaya dan edukasi kesehatan mental serta perencanaan masa depan remaja.",
    isi: "<p>PIK-R dikelola dari, oleh, dan untuk remaja guna mendukung generasi yang sehat dan berkarakter.</p>",
    gambar: "",
    warna: ["#fef3c7", "#fcd34d"],
  },
];

function formatTgl(str?: string) {
  if (!str) return "";
  try {
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return str;
  }
}

export default function Landing() {
  const [beritaList, setBeritaList] = useState<BeritaCard[]>(BERITA_DEFAULT);
  const [selectedBerita, setSelectedBerita] = useState<BeritaCard | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/berita`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data berita");
        return res.json();
      })
      .then((data: Berita[]) => {
        const tayang = daftarBeritaTayang(data);
        if (tayang.length > 0) {
          const list: BeritaCard[] = tayang.map((b) => {
            const kategori: "BK" | "PIK-R" = b.kategori === "PIK-R" ? "PIK-R" : "BK";
            return {
              id: b.id,
              judul: b.judul,
              kategori,
              tanggal: formatTgl(b.tanggal ?? undefined),
              ringkasan: b.ringkasan,
              isi: b.isi,
              gambar: gambarBerita(b, ""),
              warna:
                kategori === "PIK-R"
                  ? ["#fef3c7", "#fcd34d"]
                  : ["#dbeafe", "#93c5fd"],
            };
          });
          setBeritaList(list);
        }
      })
      .catch(() => {
        // Jika server backend belum hidup, tetap pakai BERITA_DEFAULT
      });
  }, []);

  return (
    <div className="ln-page">
      <BkNavbar active="Beranda" />

      <main>
        {/* Hero */}
        <section className="ln-hero">
          <div className="ln-hero-inner">
            <div>
              <span className="ln-badge">
                <IconShield width={14} height={14} />
                Partner Pendamping Siswa Terpercaya
              </span>

              <h1 className="ln-hero-title">
                Bimbingan dan Konseling
                <span className="ln-hero-accent">SMAN 2 Mandau</span>
              </h1>

              <p className="ln-hero-text">
                Kami hadir untuk mendampingi setiap langkah perjalanan akademik
                dan kesehatan mental siswa. Bersama mewujudkan generasi yang
                cerdas, tangguh, dan berkarakter.
              </p>

              <div className="ln-hero-actions">
                <Link to="/layanan" className="ln-btn-primary">
                  Mulai Konsultasi
                  <IconArrowRight width={16} height={16} />
                </Link>
                <a href="#visi-misi" className="ln-btn-secondary">
                  Jelajahi Program
                </a>
              </div>

              <p className="ln-hero-note">
                <IconUsers width={16} height={16} className="ln-icon-accent" />
                {GURU_BK_SEKOLAH.length} Guru BK siap membantu Anda kapan saja.
              </p>
            </div>

            <div className="ln-hero-media">
              <SafeImage
                src="/images/bk/hero.jpg"
                alt="Guru BK mendampingi siswa berdiskusi"
                className="ln-hero-img"
              />
              <div className="ln-float">
                <span className="ln-float-icon">
                  <IconShield width={18} height={18} />
                </span>
                <div>
                  <p className="ln-float-title">Pelayanan Ramah</p>
                  <p className="ln-float-text">
                    Kenyamanan siswa adalah prioritas kami.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visi & Misi */}
        <section id="visi-misi" className="ln-vm">
          <div className="ln-container">
            <h2 className="ln-vm-title">Visi & Misi Kami</h2>
            <div className="ln-divider" />

            <div className="mt-8 space-y-6">
              <article className="ln-card">
                <div className="ln-card-head">
                  <span className="ln-card-icon">
                    <IconEye width={18} height={18} />
                  </span>
                  <h3 className="ln-card-title">Visi BK SMAN 2 Mandau</h3>
                </div>
                <p className="ln-card-text">{VISI_BK}</p>
              </article>

              <div>
                <h3 className="mb-4 text-center text-lg font-semibold text-gray-900">
                  Misi Pelayanan BK
                </h3>
                <div className="grid gap-5 md:grid-cols-3">
                  {MISI_BK.map((m) => (
                    <article key={m.judul} className="ln-card flex flex-col">
                      <div className="ln-card-head">
                        <span className="ln-card-icon">
                          <IconCheckCircle width={18} height={18} />
                        </span>
                        <h4 className="ln-card-title text-base">{m.judul}</h4>
                      </div>
                      <p className="ln-card-text flex-1">{m.isi}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guru BK */}
        <section id="guru" className="scroll-mt-20 bg-white py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">Guru Bimbingan & Konseling</h2>
              <div className="ln-divider" />
              <p className="mt-2 text-xs text-gray-500">
                Pendidik profesional yang siap mendampingi perkembangan pribadi, sosial, belajar, dan karier Anda.
              </p>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {GURU_BK_SEKOLAH.map((g) => (
                <article
                  key={g.nama}
                  className="line-all flex flex-col items-center rounded-xl bg-soft p-6 text-center shadow-xs"
                >
                  <div className="size-24 overflow-hidden rounded-full border-2 border-brand-200">
                    <SafeImage
                      src={g.foto}
                      alt={g.nama}
                      fallbackText={inisial(g.nama)}
                      fallbackFrom="#dbeafe"
                      fallbackTo="#bfdbfe"
                      className="size-full object-cover"
                    />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-gray-900">{g.nama}</h3>
                  <p className="mt-1 text-xs font-medium text-brand-700">{g.pendidikan}</p>
                  <div className="mt-3 w-full border-t border-gray-200/60 pt-3">
                    <p className="text-xs italic text-gray-600">"{g.motto}"</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Informasi Terbaru (CMS Berita dari Database) */}
        <section id="informasi" className="ln-info">
          <div className="ln-container">
            <div className="ln-info-head">
              <div>
                <h2 className="ln-info-title">Informasi & Artikel Terbaru</h2>
                <p className="ln-info-sub">
                  Update terkini kegiatan, layanan, dan edukasi dari tim BK SMAN 2 Mandau.
                </p>
              </div>
            </div>

            <div className="ln-news-grid">
              {beritaList.slice(0, 3).map((b) => (
                <article key={b.id || b.judul} className="ln-news-card">
                  <div className="ln-news-media">
                    <SafeImage
                      src={b.gambar || ""}
                      alt={b.judul}
                      fallbackFrom={b.warna[0]}
                      fallbackTo={b.warna[1]}
                      className="ln-news-img"
                    />
                    <span
                      className={
                        "ln-news-tag " +
                        (b.kategori === "PIK-R"
                          ? "ln-news-tag-pikr"
                          : "ln-news-tag-bk")
                      }
                    >
                      {b.kategori}
                    </span>
                  </div>
                  <div className="ln-news-body">
                    <p className="ln-news-date">{b.tanggal}</p>
                    <h3 className="ln-news-title">{b.judul}</h3>
                    <p className="ln-news-sum">{b.ringkasan}</p>
                    <button
                      type="button"
                      onClick={() => setSelectedBerita(b)}
                      className="ln-news-more"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      Baca Selengkapnya
                      <IconArrowRight width={14} height={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Modal Baca Artikel Lengkap */}
        {selectedBerita && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
            onClick={() => setSelectedBerita(null)}
          >
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                maxWidth: "680px",
                width: "100%",
                maxHeight: "85vh",
                overflowY: "auto",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                padding: "24px",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    className={
                      "ln-news-tag " +
                      (selectedBerita.kategori === "PIK-R"
                        ? "ln-news-tag-pikr"
                        : "ln-news-tag-bk")
                    }
                  >
                    {selectedBerita.kategori}
                  </span>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>{selectedBerita.tanggal}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBerita(null)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "6px",
                  }}
                  title="Tutup"
                >
                  <IconClose width={20} height={20} />
                </button>
              </div>

              <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#111827", marginBottom: "16px", lineHeight: "1.4" }}>
                {selectedBerita.judul}
              </h2>

              {selectedBerita.gambar && (
                <img
                  src={selectedBerita.gambar}
                  alt={selectedBerita.judul}
                  style={{ width: "100%", maxHeight: "280px", objectFit: "cover", borderRadius: "8px", marginBottom: "16px" }}
                />
              )}

              <div
                style={{
                  fontSize: "14px",
                  lineHeight: "1.7",
                  color: "#374151",
                }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedBerita.isi) }}
              />

              <div style={{ marginTop: "24px", textAlign: "right" }}>
                <button
                  type="button"
                  onClick={() => setSelectedBerita(null)}
                  className="ln-btn-primary"
                  style={{ padding: "8px 18px", fontSize: "14px" }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Butuh Teman Cerita */}
        <section className="ln-cta">
          <div className="ln-cta-inner">
            <div>
              <h2 className="ln-cta-title">Butuh Teman Cerita?</h2>
              <p className="ln-cta-text">
                Jangan simpan masalahmu sendiri. Tim BK SMAN 2 Mandau siap
                mendengarkan tanpa menghakimi. Ruang kami selalu terbuka untuk
                kenyamananmu.
              </p>
              <ul className="ln-cta-list">
                <li className="ln-cta-item">
                  <span className="ln-cta-icon">
                    <IconPin width={16} height={16} />
                  </span>
                  <span>
                    <span className="ln-cta-label">Lokasi Ruang BK</span>
                    <span className="ln-cta-value">
                      Gedung Utama, Lantai 1, SMAN 2 Mandau
                    </span>
                  </span>
                </li>
                <li className="ln-cta-item">
                  <span className="ln-cta-icon">
                    <IconMail width={16} height={16} />
                  </span>
                  <span>
                    <span className="ln-cta-label">Email Layanan</span>
                    <span className="ln-cta-value">bk@sman2mandau.sch.id</span>
                  </span>
                </li>
              </ul>
            </div>

            <div className="ln-map">
              <p className="ln-map-caption">Peta Lokasi SMAN 2 Mandau</p>
              <iframe
                title="Peta lokasi SMAN 2 Mandau"
                src="https://www.google.com/maps?q=SMA+Negeri+2+Mandau&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="ln-map-frame"
              />
            </div>
          </div>
        </section>
      </main>

      <BkFooter />
    </div>
  );
}
