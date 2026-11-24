import { IconGlobe, IconUsers } from "../bk/Icons";

export default function BkFooter() {
  return (
    <footer className="pub-footer">
      <div className="pub-footer-grid">
        <div>
          <p className="pub-footer-brand">SMAN 2 MANDAU</p>
          <p className="pub-footer-text">
            Sekolah unggulan berkarakter, membentuk masa depan gemilang melalui
            bimbingan yang tepat dan pelayanan yang tulus.
          </p>
        </div>

        <div>
          <p className="pub-footer-heading">Tautan Cepat</p>
          <ul className="pub-footer-links">
            <li><a href="#">Kebijakan Privasi</a></li>
            <li><a href="#">Kontak Kami</a></li>
            <li><a href="#">Lokasi Sekolah</a></li>
            <li><a href="#">Portal Siswa</a></li>
          </ul>
        </div>

        <div>
          <p className="pub-footer-heading">Hubungi Kami</p>
          <address className="pub-footer-address">
            Jl. Desa Harapan, Kec. Mandau
            <br />
            Kabupaten Bengkalis, Riau
            <br />
            Telp: (0765) 123456
          </address>
          <div className="pub-footer-social">
            <a href="#" aria-label="Website sekolah" className="pub-footer-social-link">
              <IconGlobe width={16} height={16} />
            </a>
            <a href="#" aria-label="Komunitas" className="pub-footer-social-link">
              <IconUsers width={16} height={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="pub-footer-bottom">
        <p className="pub-footer-copy">
          © 2026 SMAN 2 Mandau Counseling Department. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}