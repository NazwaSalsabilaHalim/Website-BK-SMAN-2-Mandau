import {
  ChartColumn,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Newspaper,
  Settings,
  Users,
} from "lucide-react";
import type { NavItem } from "./types";

/**
 * Menu sidebar admin BK.
 * Label diambil dari messages/en.json -> sidebar.items.<key>
 */
export const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="size-[18px]" />,
    key: "dashboard",
    path: "/admin",
  },
  {
    icon: <ClipboardList className="size-[18px]" />,
    key: "bkPermohonan",
    path: "/admin/permohonan",
  },
  {
    icon: <Users className="size-[18px]" />,
    key: "bkSiswa",
    path: "/admin/siswa",
  },
  {
    icon: <GraduationCap className="size-[18px]" />,
    key: "bkGuru",
    path: "/admin/guru",
  },
  {
    icon: <Newspaper className="size-[18px]" />,
    key: "bkBerita",
    path: "/admin/berita",
  },
  {
    icon: <ChartColumn className="size-[18px]" />,
    key: "bkLaporan",
    path: "/admin/laporan",
  },
];

export const othersItems: NavItem[] = [
  {
    icon: <Settings className="size-[18px]" />,
    key: "bkPengaturan",
    path: "/admin/pengaturan",
  },
];

export const supportItems: NavItem[] = [];