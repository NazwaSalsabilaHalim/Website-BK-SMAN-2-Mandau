import { PageMeta } from "@/components/shared/page-meta";
import { Link } from "react-router";

export default function AdminSegeraHadir() {
  return (
    <>
      <PageMeta
        title="Segera hadir | BK SMAN 2 Mandau"
        description="Halaman ini sedang dikerjakan"
      />
      <div className="soon-box">
        <h2 className="soon-title">Segera hadir</h2>
        <p className="copy-sub-2">Halaman ini sedang dikerjakan.</p>
        <Link to="/admin" className="soon-link">
          Kembali ke Dashboard
        </Link>
      </div>
    </>
  );
}