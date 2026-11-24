import { useNavigate } from "react-router";
import LoginCard, {
  type LoginPayload,
  type LoginRole,
} from "../components/bk/LoginCard";
import {
  API_URL,
  HOME_BY_ROLE,
  saveSession,
  type DbRole,
} from "../lib/bkAuth";

// Nama role di database untuk tiap halaman login.
const DB_ROLE: Record<LoginRole, DbRole> = {
  admin: "admin",
  guru: "guru_bk",
  siswa: "siswa",
};

type LoginResponse = {
  token: string;
  user?: { name?: string; role?: string };
};

async function loginRequest({ username, password, role }: LoginPayload) {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw new Error("Tidak bisa terhubung ke server. Pastikan backend sudah jalan.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message ?? "Username atau password salah.");
  }

  // Cegah siswa login lewat halaman admin, dan sebaliknya.
  if (data?.user?.role && data.user.role !== DB_ROLE[role]) {
    throw new Error("Akun ini tidak terdaftar untuk halaman login ini.");
  }

  return data as LoginResponse;
}

function useLoginHandler(role: LoginRole) {
  const navigate = useNavigate();

  return async (payload: LoginPayload) => {
    const data = await loginRequest(payload);
    const dbRole = DB_ROLE[role];

    saveSession(
      {
        token: data.token,
        role: dbRole,
        name: data.user?.name ?? payload.username,
      },
      payload.remember
    );

    // Dashboard admin: /admin, guru BK: /guru, siswa: /siswa
    navigate(HOME_BY_ROLE[dbRole], { replace: true });
  };
}

function LoginShell({ role }: { role: LoginRole }) {
  const handle = useLoginHandler(role);

  return (
    <div className="bk-login-page">
      <LoginCard role={role} onSubmit={handle} />
    </div>
  );
}

export const LoginAdmin = () => <LoginShell role="admin" />;
export const LoginGuru = () => <LoginShell role="guru" />;
export const LoginSiswa = () => <LoginShell role="siswa" />;