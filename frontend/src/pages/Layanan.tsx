import { Link } from "react-router";
import BkNavbar from "../components/bk/BkNavbar";
import BkFooter from "../components/bk/BkFooter";
import {
  IconBolt,
  IconCalendar,
  IconCap,
  IconLogin,
  IconShield,
  IconUsers,
} from "../components/bk/Icons";

const KEUNGGULAN = [
  {
    icon: IconShield,
    judul: "Kerahasiaan Terjamin",
    isi: "Setiap sesi konsultasi dilindungi oleh standar kerahasiaan profesi guru BK.",
  },
  {
    icon: IconBolt,
    judul: "Respon Cepat",
    isi: "Permohonan konseling akan ditinjau dalam waktu kurang dari 24 jam kerja.",
  },
  {
    icon: IconCalendar,
    judul: "Penjadwalan Fleksibel",
    isi: "Pilih waktu yang paling sesuai dengan jadwal belajar atau istirahat sekolah.",
  },
];

export default function Layanan() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <BkNavbar active="Materi Layanan" />

      <main>
        <section className="bg-slate-50">
          <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-900 ring-1 ring-blue-100">
              <IconShield width={14} height={14} />
              Portal Layanan BK Digital
            </span>
            <h1 className="mt-5 text-3xl font-bold text-slate-900 sm:text-4xl">
              Layanan Konsultasi Bimbingan Konseling
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">
              Portal resmi bimbingan konseling SMAN 2 Mandau. Kami hadir untuk
              mendampingi perkembangan akademik dan psikososial siswa melalui
              platform pengajuan konsultasi online yang aman dan terintegrasi
              bagi seluruh warga sekolah.
            </p>

            {/* Pilih peran */}
            <div className="mt-10 grid gap-5 text-left md:grid-cols-2">
              <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-900">
                  <IconCap width={22} height={22} />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                  Saya seorang Siswa
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  Ajukan konseling, pantau status, dan lihat riwayat
                  konsultasimu secara pribadi untuk mendukung kesehatan mental
                  dan prestasi belajarmu.
                </p>
                <Link
                  to="/login/siswa"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
                >
                  Login sebagai Siswa
                  <IconLogin width={16} height={16} />
                </Link>
              </article>

              <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-900">
                  <IconUsers width={22} height={22} />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                  Saya seorang Guru BK
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  Kelola permohonan konseling dan catat hasil sesi konseling
                  dengan sistem administrasi yang terstruktur dan aman untuk
                  efektivitas layanan BK.
                </p>
                <Link
                  to="/login/guru"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-md border border-blue-900 bg-white px-4 py-2.5 text-sm font-semibold text-blue-900 transition-colors hover:bg-blue-50"
                >
                  Login sebagai Guru BK
                  <IconLogin width={16} height={16} />
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* Keunggulan */}
        <section>
          <div className="mx-auto grid max-w-5xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3">
            {KEUNGGULAN.map(({ icon: Icon, judul, isi }) => (
              <div key={judul} className="flex gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-900">
                  <Icon width={18} height={18} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {judul}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {isi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BkFooter />
    </div>
  );
}
