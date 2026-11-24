import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import {
  IconCap,
  IconEye,
  IconEyeOff,
  IconInfo,
  IconLock,
  IconLogin,
  IconUser,
} from "./Icons";

export type LoginRole = "siswa" | "guru" | "admin";

export type LoginPayload = {
  username: string;
  password: string;
  remember: boolean;
  role: LoginRole;
};

type Props = {
  role: LoginRole;
  /**
   * Dipanggil saat form dikirim. Lempar Error(message) kalau login gagal,
   * pesannya akan tampil di form. Sambungkan ke API Laravel di sini.
   */
  onSubmit: (data: LoginPayload) => Promise<void>;
};

export default function LoginCard({ role, onSubmit }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoFailed, setLogoFailed] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ username: username.trim(), password, remember, role });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login gagal. Periksa username dan password lalu coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bk-card">
      {/* Bagian atas: logo, judul, form */}
      <div className="bk-card-body">
        <div className="bk-head">
          <div className="bk-logo">
            {logoFailed ? (
              <IconCap width={26} height={26} className="bk-logo-fallback" />
            ) : (
              <img
                src="/images/bk/logo.png"
                alt="Logo SMAN 2 Mandau"
                onError={() => setLogoFailed(true)}
                className="bk-logo-img"
              />
            )}
          </div>
          <h1 className="bk-title">BK SMAN 2 Mandau</h1>
          <p className="bk-subtitle">SISTEM INFORMASI BIMBINGAN KONSELING</p>
        </div>

        <form onSubmit={handleSubmit} className="bk-form" noValidate>
          <div>
            <label htmlFor="username" className="bk-label">
              Username
            </label>
            <div className="bk-input-wrap">
              <IconUser width={18} height={18} className="bk-icon" />
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username anda"
                className="bk-input"
              />
            </div>
          </div>

          <div>
            <div className="bk-label-row">
              <label htmlFor="password" className="bk-label bk-label-inline">
                Password
              </label>
              <a href="#" className="bk-forgot">
                Lupa Password?
              </a>
            </div>
            <div className="bk-input-wrap">
              <IconLock width={18} height={18} className="bk-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password anda"
                className="bk-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                className="bk-eye"
              >
                {showPassword ? (
                  <IconEyeOff width={18} height={18} />
                ) : (
                  <IconEye width={18} height={18} />
                )}
              </button>
            </div>
          </div>

          <label className="bk-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="bk-checkbox"
            />
            Ingat saya di perangkat ini
          </label>

          {error && (
            <p role="alert" className="bk-error">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="bk-submit">
            {loading ? "Memproses..." : "Login Ke Sistem"}
            {!loading && <IconLogin width={16} height={16} />}
          </button>
        </form>
      </div>

      {/* Strip hak cipta */}
      <div className="bk-copyright">
        <p>© 2024 SMAN 2 Mandau. Hak Cipta Dilindungi.</p>
      </div>

      {/* Catatan halaman */}
      <div className="bk-note">
        <IconInfo width={18} height={18} className="bk-note-icon" />
        {role === "admin" ? (
          <p>
            Halaman ini khusus untuk Administrator Sistem. Siswa dan Guru BK
            silakan login melalui portal Layanan Konsultasi di website utama.
          </p>
        ) : (
          <p>
            Halaman ini khusus untuk {role === "guru" ? "Guru BK" : "Siswa"}.
            Bukan {role === "guru" ? "Guru BK" : "siswa"}?{" "}
            <Link to="/layanan" className="bk-note-link">
              Kembali ke Layanan Konsultasi
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}