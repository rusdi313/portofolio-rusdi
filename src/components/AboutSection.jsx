import PropTypes from 'prop-types';
import { ArrowUpRight, Award, BriefcaseBusiness, Code, FileText, Quote, UserRound } from 'lucide-react';
import { usePortfolioTable, safeUrl } from '../data/usePortfolioTable';
import { Section, ExternalLink } from './PortfolioUI';

export default function AboutSection({ profile }) {
  const projects = usePortfolioTable('projects');
  const certificates = usePortfolioTable('certificates');
  const experiences = usePortfolioTable('experiences');
  const statistics = [
    { state: projects, count: projects.data.length, label: 'Total Projects', description: 'Proyek dan aktivitas yang dipublikasikan', href: '#Portofolio', icon: Code },
    { state: certificates, count: certificates.data.length, label: 'Certificates', description: 'Sertifikat dalam perjalanan belajar saya', href: '#Certifications', icon: Award },
    { state: experiences, count: experiences.data.filter(row => row.type !== 'Organization').length, label: 'Pengalaman Kerja', description: 'Kontribusi di lingkungan profesional', href: '#Experience', icon: BriefcaseBusiness },
  ];
  return <Section id="About"  title="About Me" description="Memahami sistem. Menyelesaikan masalah.">
    {profile && <div className="about-introduction">
      <div className="about-narrative">
        <h3 className="about-greeting"><span>Hello, I’m</span>{profile.name}</h3>
        <p className="about-biography">{profile.about}</p>
        {profile.approach && <blockquote className="about-quote"><Quote size={22} aria-hidden="true" /><p>{profile.approach}</p></blockquote>}
        <div className="about-actions"><ExternalLink className="button primary" href={profile.cv_url}><FileText size={17} aria-hidden="true" />Lihat CV</ExternalLink><a className="button secondary" href="#Portofolio"><Code size={17} aria-hidden="true" />Lihat Proyek</a></div>
      </div>
      <div className="about-portrait-area"><div className="about-portrait">{safeUrl(profile.photo_url) ? <img src={safeUrl(profile.photo_url)} alt={profile.name} loading="lazy" /> : <UserRound size={100} aria-label="Foto profil belum tersedia" />}</div></div>
    </div>}
    <div className="about-statistics">{statistics.map(({ state, count, label, description, href, icon: Icon }) => <a className="panel about-stat" href={href} key={label}>
      <div className="about-stat-top"><span className="about-stat-icon"><Icon size={26} aria-hidden="true" /></span><strong aria-label={state.loading ? 'Memuat jumlah' : state.error ? 'Jumlah belum tersedia' : undefined}>{state.loading || state.error ? '—' : count}</strong></div>
      <h3>{label}</h3><div className="about-stat-description"><p>{description}</p><ArrowUpRight size={16} aria-hidden="true" /></div>
    </a>)}</div>
  </Section>;
}
AboutSection.propTypes = { profile: PropTypes.object };
