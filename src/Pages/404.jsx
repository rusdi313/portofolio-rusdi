import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return <div className="portfolio-site"><main className="site-container project-detail">
    <p className="eyebrow">404 / Page not found</p>
    <div className="detail-heading"><h1>Halaman tidak ditemukan.</h1><p className="hero-description">Halaman yang Anda cari tidak tersedia. Kembali ke portofolio untuk melihat proyek dan pengalaman saya.</p></div>
    <Link className="button primary" to="/"><ArrowLeft size={18} /> Kembali ke beranda</Link>
  </main></div>;
}
