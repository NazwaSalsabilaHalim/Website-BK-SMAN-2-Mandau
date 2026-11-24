import AppLayout from "@/components/layout/app-layout";
import CalendarPage from "@/pages/main/calendar";
import AdminDashboard from "@/pages/main/dashboard/ecommerce";
import FormElementsPage from "@/pages/main/forms/form-elements";
import { BlankPage, Error404Page } from "@/pages/main/pages";
import ProfilePage from "@/pages/main/profile";
import BasicTablesPage from "@/pages/main/tables/basic-tables";
import { AuthLayout, SignInPage, SignUpPage } from "@/pages/others/auth";
import BarChartPage from "@/pages/others/charts/bar-chart";
import LineChartPage from "@/pages/others/charts/line-chart";
import Alerts from "@/pages/others/ui-elements/alerts";
import Avatars from "@/pages/others/ui-elements/avatars";
import Badges from "@/pages/others/ui-elements/badges";
import Buttons from "@/pages/others/ui-elements/buttons";
import Images from "@/pages/others/ui-elements/images";
import Videos from "@/pages/others/ui-elements/videos";
import "flatpickr/dist/flatpickr.css";
import { Route, Routes } from "react-router";

// Halaman website BK (publik, login, dashboard)
import Landing from "@/pages/Landing";
import Layanan from "@/pages/Layanan";
import { LoginAdmin, LoginGuru, LoginSiswa } from "@/pages/BkLogin";
import DashboardGuru from "@/pages/guru/DashboardGuru";
import GuruSegeraHadir from "@/pages/guru/GuruSegeraHadir";
import GuruPermohonan from "@/pages/guru/GuruPermohonan";
import GuruDetailPermohonan from "@/pages/guru/GuruDetailPermohonan";
import GuruLaporan from "@/pages/guru/GuruLaporan";
import GuruLayout from "@/components/bk/GuruLayout";
import DashboardSiswa from "@/pages/siswa/DashboardSiswa";
import SiswaSegeraHadir from "@/pages/siswa/SiswaSegeraHadir";
import SiswaAjukan from "@/pages/siswa/SiswaAjukan";
import SiswaRiwayat from "@/pages/siswa/SiswaRiwayat";
import SiswaDetail from "@/pages/siswa/SiswaDetail";
import SiswaLayout from "@/components/bk/SiswaLayout";
import RequireRole from "@/components/bk/RequireRole";
import AdminSegeraHadir from "@/pages/admin/AdminSegeraHadir";
import AdminSiswa from "@/pages/admin/AdminSiswa";
import AdminGuru from "@/pages/admin/AdminGuru";
import AdminBerita from "@/pages/admin/AdminBerita";
import AdminPermohonan from "@/pages/admin/AdminPermohonan";

export default function App() {
  return (
    <Routes>
      {/* Website BK: publik, tanpa sidebar */}
      <Route path="/" element={<Landing />} />
      <Route path="/layanan" element={<Layanan />} />
      <Route path="/login/siswa" element={<LoginSiswa />} />
      <Route path="/login/guru" element={<LoginGuru />} />
      <Route path="/admin/login" element={<LoginAdmin />} />

      {/* Dashboard guru BK dan siswa */}
      <Route
        path="/guru"
        element={
          <RequireRole role="guru_bk">
            <GuruLayout />
          </RequireRole>
        }
      >
        <Route index element={<DashboardGuru />} />
        <Route path="permohonan" element={<GuruPermohonan />} />
        <Route path="permohonan/:id" element={<GuruDetailPermohonan />} />
        <Route path="laporan" element={<GuruLaporan />} />
        {/* Menu lain (pengaturan, sesi baru, jadwal) menyusul */}
        <Route path="*" element={<GuruSegeraHadir />} />
      </Route>
      <Route
        path="/siswa"
        element={
          <RequireRole role="siswa">
            <SiswaLayout />
          </RequireRole>
        }
      >
        <Route index element={<DashboardSiswa />} />
        <Route path="ajukan" element={<SiswaAjukan />} />
        <Route path="riwayat" element={<SiswaRiwayat />} />
        <Route path="riwayat/:id" element={<SiswaDetail />} />
        {/* Menu lain (berita, pengaturan) menyusul */}
        <Route path="*" element={<SiswaSegeraHadir />} />
      </Route>

      {/* Dashboard Layout (template TailAdmin) khusus admin */}
      <Route
        element={
          <RequireRole role="admin">
            <AppLayout />
          </RequireRole>
        }
      >
        {/* Dashboard admin (halaman Ecommerce bawaan sudah diganti isinya) */}
        <Route path="/admin" element={<AdminDashboard />} />
        {/* Menu admin lain (permohonan, guru, berita, laporan) menyusul */}
        <Route path="/admin/siswa" element={<AdminSiswa />} />
        <Route path="/admin/guru" element={<AdminGuru />} />
        <Route path="/admin/berita" element={<AdminBerita />} />
        <Route path="/admin/permohonan" element={<AdminPermohonan />} />

        <Route path="/admin/*" element={<AdminSegeraHadir />} />

        {/* Others Page */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/blank" element={<BlankPage />} />

        {/* Forms */}
        <Route path="/form-elements" element={<FormElementsPage />} />

        {/* Tables */}
        <Route path="/basic-tables" element={<BasicTablesPage />} />

        {/* Ui Elements */}
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/avatars" element={<Avatars />} />
        <Route path="/badge" element={<Badges />} />
        <Route path="/buttons" element={<Buttons />} />
        <Route path="/images" element={<Images />} />
        <Route path="/videos" element={<Videos />} />

        {/* Charts */}
        <Route path="/line-chart" element={<LineChartPage />} />
        <Route path="/bar-chart" element={<BarChartPage />} />
      </Route>

      {/* Auth Layout (bawaan TailAdmin) */}
      <Route element={<AuthLayout />}>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Route>

      {/* Full-width / Error / Status Pages */}
      <Route path="/error-404" element={<Error404Page />} />

      {/* Fallback Route */}
      <Route path="*" element={<Error404Page />} />
    </Routes>
  );
}