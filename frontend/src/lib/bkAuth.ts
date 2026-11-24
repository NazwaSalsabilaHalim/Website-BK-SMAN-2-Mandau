export const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

/** Nilai role di database (enum tabel users). */
export type DbRole = "admin" | "guru_bk" | "siswa";

/** Tujuan setelah login berhasil. */
export const HOME_BY_ROLE: Record<DbRole, string> = {
  admin: "/admin",
  guru_bk: "/guru",
  siswa: "/siswa",
};

/** Halaman login tiap peran (dipakai kalau belum login). */
export const LOGIN_BY_ROLE: Record<DbRole, string> = {
  admin: "/admin/login",
  guru_bk: "/login/guru",
  siswa: "/login/siswa",
};

export type Session = {
  token: string;
  role: DbRole;
  name: string;
};

const isDbRole = (v: string | null): v is DbRole =>
  v === "admin" || v === "guru_bk" || v === "siswa";

/** Baca sesi dari localStorage ("Ingat saya") atau sessionStorage. */
export function getSession(): Session | null {
  for (const store of [localStorage, sessionStorage]) {
    try {
      const token = store.getItem("token");
      const role = store.getItem("role");
      if (token && isDbRole(role)) {
        return { token, role, name: store.getItem("name") ?? "" };
      }
    } catch {
      // storage diblokir browser: anggap belum login
    }
  }
  return null;
}

export function clearSession() {
  for (const store of [localStorage, sessionStorage]) {
    try {
      store.removeItem("token");
      store.removeItem("role");
      store.removeItem("name");
    } catch {
      // abaikan
    }
  }
}

export function saveSession(session: Session, remember: boolean) {
  clearSession();
  const store = remember ? localStorage : sessionStorage;
  store.setItem("token", session.token);
  store.setItem("role", session.role);
  store.setItem("name", session.name);
}
