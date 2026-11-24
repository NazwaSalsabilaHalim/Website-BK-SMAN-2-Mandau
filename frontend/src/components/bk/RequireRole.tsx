import type { ReactNode } from "react";
import { Navigate } from "react-router";
import {
  getSession,
  HOME_BY_ROLE,
  LOGIN_BY_ROLE,
  type DbRole,
} from "../../lib/bkAuth";

type Props = {
  role: DbRole;
  children: ReactNode;
};

/**
 * Bungkus halaman yang hanya boleh dibuka peran tertentu.
 * - Belum login: diarahkan ke halaman login peran itu.
 * - Salah peran: diarahkan ke dashboard miliknya sendiri.
 */
export default function RequireRole({ role, children }: Props) {
  const session = getSession();

  if (!session) {
    return <Navigate to={LOGIN_BY_ROLE[role]} replace />;
  }
  if (session.role !== role) {
    return <Navigate to={HOME_BY_ROLE[session.role]} replace />;
  }
  return <>{children}</>;
}
