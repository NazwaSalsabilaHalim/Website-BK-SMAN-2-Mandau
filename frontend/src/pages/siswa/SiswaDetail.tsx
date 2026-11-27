import {
  BadgeCheck,
  CalendarDays,
  Clock,
  FileText,
  Info,
  Lock,
  MapPin,
  SquareCheckBig,
  Target,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import Breadcrumb from "@/components/bk/Breadcrumb";
import SafeImage from "@/components/bk/SafeImage";
import { SESI_CONTOH, formatTanggalPanjang } from "@/data/riwayatContoh";
import {
  gayaStatus,
  idDokumen,
  nomorPertemuan,
  pecahBaris,
  punyaHasil,
  useApi,
  type Konseling,
} from "@/lib/konselingApi";

function Info2({
  ikon,
  label,
  nilai,
}: {
  ikon: ReactNode;
  label: string;
  nilai: string;
}) {
  return (
    <div className="sdt-info">
      <span className="sdt-info-icon">{ikon}</span>
      <div>
        <p className="sdt-info-label">{label}</p>
        <p className="sdt-info-value">{nilai}</p>
      </div>
    </div>
  );
}

function JudulKartu({ ikon, teks }: { ikon: ReactNode; teks: string }) {
  return (
    <h2 className="sdt-card-title">
      <span className="sdt-card-title-icon">{ikon}</span>
      {teks}
    </h2>
  );
}

export default function SiswaDetail() {
  const { id } = useParams();
  const { data, error, loading } = useApi<Konseling[]>("/konseling");

  if (loading) {
    return (
      <div className="soon-box">
        <h1 className="soon-title">Memuat detail...</h1>
      </div>
    );
  }

  const daftar = data ?? [];
  const item = daftar.find((r) => String(r.id) === id);

  if (!item) {
    return (
      <div className="soon-box">
        <h1 className="soon-title">Riwayat tidak ditemukan</h1>
        <p className="soon-text">
          {error || "Data konseling yang kamu cari tidak ada."}
        </p>
        <Link to="/siswa/riwayat" className="soon-link">
          Kembali ke Riwayat
        </Link>
      </div>
    );
  }

  const st = gayaStatus(item.status);
  const adaHasil = punyaHasil(item.status);

  const deskripsi = pecahBaris(item.deskripsi_kegiatan);
  const hasil = pecahBaris(item.hasil_konseling);

  return (
    <div className="sdt-page">
      <Breadcrumb
        items={[
          { label: "Dashboard", to: "/siswa" },
          { label: "Riwayat Konseling", to: "/siswa/riwayat" },
          { label: "Detail" },
        ]}
      />

      {/* Header sesi */}
      <section className="sdt-card">
        <div className="sdt-head">
          <div className="sdt-head-main">
            <div className="sdt-meta">
              <span className={"badge-sq-tight " + st.badge}>{st.label}</span>
              {adaHasil && <span>• PERTEMUAN KE-{nomorPertemuan(item, daftar)}</span>}
            </div>
            <h1 className="sdt-topic">{item.topik}</h1>

            <div className="sdt-info-grid">
              <Info2
                ikon={<User className="sdt-icon" />}
                label="Guru Pembimbing"
                nilai={item.guru}
              />
              <Info2
                ikon={<CalendarDays className="sdt-icon" />}
                label="Hari / Tanggal"
                nilai={formatTanggalPanjang(item.tanggal)}
              />
              <Info2
                ikon={<Clock className="sdt-icon" />}
                label="Waktu Sesi"
                nilai={`${item.waktu} WIB`}
              />
              <Info2
                ikon={<MapPin className="sdt-icon" />}
                label="Tempat"
                nilai={SESI_CONTOH.tempat}
              />
            </div>
          </div>

          <SafeImage
            src="/images/bk/ruang-konseling.jpg"
            alt="Ruang konseling"
            fallbackFrom="#dbeafe"
            fallbackTo="#93c5fd"
            className="sdt-photo"
          />
        </div>
      </section>

      {/* Isi sesuai status */}
      {adaHasil ? (
        <>
          <div className="sdt-pair">
            <section className="sdt-card">
              <JudulKartu
                ikon={<FileText className="sdt-icon-md" />}
                teks="Deskripsi Kegiatan"
              />
              <div className="sdt-text">
                {deskripsi.length === 0 ? (
                  <p>Deskripsi kegiatan belum diisi.</p>
                ) : (
                  deskripsi.map((p) => <p key={p}>{p}</p>)
                )}
              </div>
            </section>

            <section className="sdt-card">
              <JudulKartu
                ikon={<SquareCheckBig className="sdt-icon-md" />}
                teks="Hasil Kegiatan"
              />
              {hasil.length === 0 ? (
                <div className="sdt-text">
                  <p>Hasil kegiatan belum diisi.</p>
                </div>
              ) : (
                <ol className="sdt-steps">
                  {hasil.map((h, i) => (
                    <li key={h} className="sdt-step">
                      <span className="sdt-step-num">{i + 1}</span>
                      {h}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          <section className="sdt-card">
            <JudulKartu
              ikon={<Target className="sdt-icon-md" />}
              teks="Evaluasi dan Tindak Lanjut"
            />
            <div className="sdt-eval-grid">
              <div>
                <p className="sdt-eval-label">RENCANA TINDAKAN</p>
                <div className="sdt-plan-list">
                  {item.rencana_tindak_lanjut.length === 0 ? (
                    <p className="sdt-plan-text">Tidak ada rencana tindak lanjut.</p>
                  ) : (
                    item.rencana_tindak_lanjut.map((r) => (
                      <div key={r.judul} className="sdt-plan">
                        <p className="sdt-plan-title">{r.judul}</p>
                        <p className="sdt-plan-text">{r.isi}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="sdt-eval-label">KESIMPULAN COUNSELOR</p>
                <div className="sdt-conclusion">
                  <p className="sdt-conclusion-text">
                    “{item.evaluasi || "Evaluasi belum diisi."}”
                  </p>
                  <div className="sdt-sign">
                    <span>Tanda Tangan Digital Tersimpan</span>
                    <BadgeCheck className="sdt-sign-icon" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="sdt-status">
          <div className="sdt-status-row">
            <Info className="sdt-status-icon" />
            <div className="sdt-status-body">
              {item.status === "menunggu" && (
                <>
                  <h2 className="sdt-status-title">
                    Menunggu konfirmasi Guru BK
                  </h2>
                  <p className="sdt-status-text">
                    Pengajuanmu sudah diterima. Guru BK akan meninjau dan
                    memberi jawaban melalui sistem.
                  </p>
                </>
              )}
              {item.status === "disetujui" && (
                <>
                  <h2 className="sdt-status-title">Pengajuan disetujui</h2>
                  <p className="sdt-status-text">
                    Datang tepat waktu ke {SESI_CONTOH.tempat}. Hasil konseling
                    akan tersedia di halaman ini setelah sesi selesai.
                  </p>
                </>
              )}
              {item.status === "ditolak" && (
                <>
                  <h2 className="sdt-status-title">Pengajuan ditolak</h2>
                  <p className="sdt-status-text">
                    Alasan Guru BK: {item.alasan_penolakan || "-"}
                  </p>
                  <Link to="/siswa/ajukan" className="sdt-status-cta">
                    Ajukan Ulang
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer dokumen */}
      <div className="sdt-foot">
        <span>ID Dokumen: {idDokumen(item)}</span>
        <span className="sdt-foot-note">
          <Lock className="sdt-foot-icon" />
          Data dilindungi oleh kebijakan privasi bimbingan konseling SMAN 2
          Mandau
        </span>
      </div>
    </div>
  );
}