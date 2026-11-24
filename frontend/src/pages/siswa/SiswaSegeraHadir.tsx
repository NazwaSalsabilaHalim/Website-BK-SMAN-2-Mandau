import { Link } from "react-router";

export default function SiswaSegeraHadir() {
  return (
    <div className="soon-box">
      <h2 className="soon-title">Segera hadir</h2>
      <p className="soon-text">Halaman ini sedang dikerjakan.</p>
      <Link to="/siswa" className="soon-link">
        Kembali ke Dashboard
      </Link>
    </div>
  );
}