import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowDown, ArrowUpRight, ShieldCheck, Network, Terminal, Award, GraduationCap, MapPin, Mail, Menu, X, BriefcaseBusiness, Download } from 'lucide-react';
import { usePortfolioTable, safeUrl, asList } from '../data/usePortfolioTable';
import { Section, DataState, ExternalLink, Tags } from '../components/PortfolioUI';

import AboutSection from '../components/AboutSection';
import ProjectFolderCard from '../components/ProjectFolderCard';
import WelcomeScreen from '../components/WelcomeScreen';
import ScrollReveal from '../components/ScrollReveal';
import ContactCard from '../components/ContactCard';
import rakServerVideo from '../assets/video/rak-server.mp4';
import siteLogo from '../assets/img/logo.png';
import Lenis from 'lenis';

const navigation = [['About', 'About'], ['Skills', 'Skills'], ['Portofolio', 'Projects'], ['Experience', 'Experience'], ['Certifications', 'Credentials'], ['Contact', 'Contact']];

function Navigation() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = event => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    setOpen(false);
    const targetElement = document.getElementById(id);
    const headerOffset = 80;
    if (targetElement) {
      if (window.lenis) {
        window.lenis.scrollTo(targetElement, {
          offset: -headerOffset + 2,
          duration: 1.2
        });
      } else {
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset + 2;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      }
      window.history.pushState(null, '', `#${id}`);
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    setOpen(false);
    if (window.lenis) {
      window.lenis.scrollTo(0, {
        duration: 1.2
      });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
    window.history.pushState(null, '', window.location.pathname);
  };

  return <header className="site-header"><nav className="site-nav" aria-label="Navigasi utama">
    <a href="#Home" className="site-logo-link" onClick={handleLogoClick} aria-label="Rusdi Aulia Romadhon">
      <img src={siteLogo} alt="Rusdi Aulia Romadhon Logo" className="site-logo-img" />
    </a>
    <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="primary-menu" aria-label={open ? 'Tutup navigasi' : 'Buka navigasi'}>{open ? <X /> : <Menu />}</button>
    <div id="primary-menu" className={`nav-links ${open ? 'is-open' : ''}`}>
      {navigation.map(([id, label]) => <a key={id} href={`#${id}`} onClick={(e) => handleNavClick(e, id)}>{label}</a>)}
      <a className="nav-cta" href="#Contact" onClick={(e) => handleNavClick(e, 'Contact')}>Get In Touch <ArrowUpRight size={15} /></a>
    </div>
  </nav></header>;
}

function Skills() {
  const state = usePortfolioTable('skills');
  const groups = [...new Set(state.data.map(skill => skill.category))];
  return <Section id="Skills" title="Technic & Skills" description="Keahlian teknis untuk memahami sistem, menemukan masalah, dan membangun solusi.">
    <DataState state={state} />
    <div className="skills-grid">{groups.map((group, index) => {
      const Icon = [ShieldCheck, Terminal, Network, BriefcaseBusiness, Terminal, Network][index % 6];
      return <ScrollReveal key={group} as="article" className="panel skill-card" delay={(index % 3) * 90}>
        <Icon aria-hidden="true" />
        <h3>{group}</h3>
        <Tags items={state.data.filter(skill => skill.category === group).map(skill => skill.name)} />
      </ScrollReveal>;
    })}</div>
  </Section>;
}

function Projects() {
  const state = usePortfolioTable('projects');
  const [filter, setFilter] = useState('Web Development');
  const [showAll, setShowAll] = useState(false);
  const categories = ['CyberSecurity', 'Web Development'];

  const projects = state.data.filter(project => {
    const cat = (project.category || '').toLowerCase().replace(/[\s-_]/g, '');
    if (filter === 'CyberSecurity') {
      return cat.includes('cyber') || cat.includes('sec');
    }

    if (filter === 'Web Development') {
      return cat.includes('web') || cat.includes('dev') || (!cat.includes('cyber') && !cat.includes('sec'));
    }
    return true;
  }).sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

  return <Section id="Portofolio" title="Projects & Activities" description="Dari pengujian keamanan hingga otomasi pekerjaan sehari-hari. Setiap proyek punya cerita dan prosesnya sendiri.">
    <DataState state={state} />
    {!!state.data.length && <div className="filters" role="group" aria-label="Filter kategori proyek">
      {categories.map(category => (
        <button
          key={category}
          aria-pressed={filter === category}
          onClick={() => { setFilter(category); setShowAll(false); }}
        >
          {category}
        </button>
      ))}
    </div>}
    <div className="project-grid">{(showAll ? projects : projects.slice(0, 6)).map((project, index) => (
      <ScrollReveal key={project.id} delay={(index % 3) * 90}>
        <ProjectFolderCard project={project} />
      </ScrollReveal>
    ))}</div>
    {projects.length > 6 && <button className="button secondary show-more" onClick={() => setShowAll(!showAll)} aria-expanded={showAll}>{showAll ? 'Tampilkan lebih sedikit' : 'Lihat semua proyek'}</button>}
  </Section>;
}

function formatCertDate(dateStr) {
  if (!dateStr) return '';
  const match = String(dateStr).match(/^(\d{4})-(\d{1,2})/);
  if (match) {
    const year = match[1];
    const monthIdx = parseInt(match[2], 10) - 1;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${months[monthIdx]} ${year}`;
    }
    return year;
  }
  return dateStr;
}

function Experience() {
  const state = usePortfolioTable('experiences');
  const [filter, setFilter] = useState('Semua');
  const rows = state.data.filter(row => filter === 'Semua' || (filter === 'Organisasi' ? row.type === 'Organization' : row.type !== 'Organization'));
  return <Section id="Experience" title="Experience & Contributions" description="Pengalaman langsung di lingkungan kerja, infrastruktur pendidikan, dan organisasi mahasiswa.">
    <DataState state={state} />
    <div className="filters" role="group" aria-label="Jenis pengalaman">{['Semua', 'Kerja', 'Organisasi'].map(type => <button key={type} aria-pressed={filter === type} onClick={() => setFilter(type)}>{type}</button>)}</div>
    {!rows.length && !!state.data.length && <p className="data-state">Belum ada pengalaman dalam kategori ini.</p>}
    <div className="timeline">{rows.map((row, index) => <ScrollReveal as="article" className="experience-row" key={row.id} delay={(index % 2) * 100}>
      <div className="experience-date"><span className="timeline-dot" /><p>{row.period}</p><span className="badge">{row.type === 'Organization' ? 'Organisasi' : row.type}</span>{row.current && <span className="badge">Saat ini</span>}</div>
      <div className="panel experience-content"><h3>{row.role}</h3><p className="company">{row.company}</p>{row.location && <p className="location"><MapPin size={14} />{row.location}</p>}
        {row.summary && <p className="muted">{row.summary}</p>}
        {(asList(row.highlights).length > 0 || asList(row.technologies).length > 0) && <details><summary>Tanggung jawab & keterampilan</summary><ul className="bullet-list">{asList(row.highlights).map((item, index) => <li key={index}>{item}</li>)}</ul><Tags items={asList(row.technologies)} /></details>}
      </div>
    </ScrollReveal>)}</div>
  </Section>;
}

function Certifications() {
  const state = usePortfolioTable('certificates');
  const [showAll, setShowAll] = useState(false);
  const rows = [...state.data].sort((a, b) => {
    if (Boolean(b.featured) !== Boolean(a.featured)) {
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    }
    return Number(b.id) - Number(a.id);
  });
  return <Section id="Certifications" title="Professional Certificate" description="Fondasi pembelajaran di bidang cybersecurity, networking, dan teknologi informasi.">
    <DataState state={state} />
    <div className="certificate-grid">{(showAll ? rows : rows.slice(0, 6)).map((row, index) => {
      const title = row.name || row.Title || 'Sertifikat';
      const imageUrl = safeUrl(row.Img);
      const formattedDate = formatCertDate(row.issued_on);
      return <ScrollReveal key={row.id} as="article" className="certificate-card" delay={(index % 3) * 90}>
        {imageUrl ? (
          <a className="certificate-thumbnail" href={imageUrl} target="_blank" rel="noopener noreferrer" aria-label={`Lihat gambar ${title}`}>
            <img src={imageUrl} alt={title} loading="lazy" />
          </a>
        ) : (
          <div className="certificate-thumbnail certificate-placeholder" aria-label="Gambar sertifikat belum tersedia">
            <Award size={36} aria-hidden="true" />
          </div>
        )}
        <div className="certificate-info">
          <h3>{title}</h3>
          {row.issuer && <p className="cert-issuer">{row.issuer}</p>}
          {formattedDate && <p className="cert-date">{formattedDate}</p>}
          <div className="cert-actions">
            {row.credential_url && (
              <a
                className="cert-btn-verify"
                href={row.credential_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ArrowUpRight size={14} /> Verify
              </a>
            )}
            {imageUrl && (
              <a
                className="cert-btn-download"
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Download size={14} /> Download
              </a>
            )}
          </div>
        </div>
      </ScrollReveal>;
    })}</div>
    {rows.length > 6 && <button className="button secondary show-more" onClick={() => setShowAll(!showAll)} aria-expanded={showAll}>{showAll ? 'Tampilkan lebih sedikit' : 'Lihat semua sertifikasi'}</button>}
  </Section>;
}

function Education() {
  const state = usePortfolioTable('education');
  return <Section id="Education" title="Educations">
    <DataState state={state} /><div className="education-grid">{state.data.map((row, index) => <ScrollReveal key={row.id} as="article" className="panel education-card" delay={(index % 2) * 100}><GraduationCap aria-hidden="true" /><p className="eyebrow">{row.period}</p><h3>{row.institution}</h3><p className="company">{row.degree}</p>{row.gpa && <p className="gpa">IPK {row.gpa}</p>}<ul className="bullet-list">{asList(row.highlights).map((item, index) => <li key={index}>{item}</li>)}</ul></ScrollReveal>)}</div>
  </Section>;
}

export default function PortfolioSite() {
  const [showWelcome, setShowWelcome] = useState(true);
  const hasCompletedWelcome = useRef(false);

  // Inisialisasi Lenis Smooth Scroll
  useEffect(() => {
    let lenis = null;
    let rafId = null;

    if (typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.2,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false
      });

      window.lenis = lenis;

      // Hentikan scroll sementara jika welcome screen masih aktif
      if (showWelcome) {
        lenis.stop();
      }

      function raf(time) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) {
        lenis.destroy();
        window.lenis = null;
      }
    };
  }, []);

  const handleCompleteWelcome = () => {
    setShowWelcome(false);
    hasCompletedWelcome.current = true;
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    if (window.lenis) {
      window.lenis.start();
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Global listener untuk link anchor (#id) di seluruh halaman agar menggunakan Lenis
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href === '#' || anchor.classList.contains('site-logo-link') || anchor.closest('.site-nav')) return;

      const targetId = href.slice(1);
      const targetElement = document.getElementById(targetId);
      const headerOffset = 80;

      if (targetElement) {
        e.preventDefault();
        if (window.lenis) {
          window.lenis.scrollTo(targetElement, {
            offset: -headerOffset + 2,
            duration: 1.2
          });
        } else {
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset + 2;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
        }
        window.history.pushState(null, '', href);
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  const state = usePortfolioTable('profile');
  const profile = state.data[0];
  const projectsState = usePortfolioTable('projects');
  const location = useLocation();

  useEffect(() => {
    if (hasCompletedWelcome.current && location.hash) {
      const targetElement = document.getElementById(location.hash.slice(1));
      const headerOffset = 80;
      if (targetElement) {
        if (window.lenis) {
          window.lenis.scrollTo(targetElement, {
            offset: -headerOffset + 2,
            duration: 1.2
          });
        } else {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [location.hash]);
  const email = profile?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ? profile.email : null;

  // =========================================================================
  // KUSTOMISASI HERO SECTION:
  // - heroVideoOpacity  : Nilai transparansi video (0.0 = tak terlihat, 1.0 = jelas penuh).
  // - heroOverlayOpacity: Nilai kepekatan lapisan gelap (0.0 = terang, 1.0 = sangat gelap).
  // =========================================================================
  const heroVideoOpacity = 0.45;
  const heroOverlayOpacity = 0.60;

  return <div className="portfolio-site">
    {showWelcome && <WelcomeScreen onComplete={handleCompleteWelcome} />}
    <Helmet><title>{profile ? `${profile.name} | ${profile.headline}` : 'Rusdi Aulia Romadhon | Cybersecurity & Network Infrastructure'}</title>
      {profile && <meta name="description" content={profile.hero_description} />}
      <link rel="icon" type="image/png" href="/logo-web.png" />
      <link rel="shortcut icon" type="image/png" href="/logo-web.png" />
      <link rel="apple-touch-icon" href="/logo-web.png" />
      <meta property="og:image" content="https://portofolio-rusdi.vercel.app/logo-web.png" />
      <meta property="og:image:secure_url" content="https://portofolio-rusdi.vercel.app/logo-web.png" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1080" />
      <meta property="og:image:height" content="1080" />
      <meta name="twitter:image" content="https://portofolio-rusdi.vercel.app/logo-web.png" />
      {profile && <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: profile.name, description: profile.about, sameAs: [safeUrl(profile.linkedin_url), safeUrl(profile.github_url)].filter(Boolean) }).replace(/</g, '\\u003c')}</script>}
    </Helmet>
    <a href="#main-content" className="skip-link">Lewati navigasi</a><Navigation />
    <section id="Home" className="hero-wrapper" aria-labelledby="hero-heading">
      {/* Background video rak-server (autoplay & loop) - Full Screen 1920x1080 */}
      <div className="hero-video" aria-hidden="true">
        <video
          src={rakServerVideo}
          preload="auto"
          autoPlay
          loop
          muted
          playsInline
          style={{ opacity: heroVideoOpacity }}
        />
        <div className="hero-video-overlay" style={{ opacity: heroOverlayOpacity }} />
      </div>
      <div className="site-container hero">
        <div className="hero-copy">
          {/* Ubah ukuran px di style fontSize sesuai keinginan (contoh: '18px', '20px', '22px') */}
          <p className="hero-name" style={{ fontSize: '20px' }}>Halo, saya {profile?.name || 'Rusdi Aulia Romadhon'}</p>
          <h1 id="hero-heading">Membangun Sistem yang <span>Aman, Andal,</span> dan Bermakna.</h1>
          <DataState state={state} empty="Profil segera hadir." />
          {profile && <><p className="hero-description">{profile.hero_description}</p><div className="hero-actions"><a className="button primary" href="#Portofolio">Jelajahi proyek <ArrowUpRight size={18} /></a><ExternalLink className="button secondary" href={profile.cv_url}>Lihat CV</ExternalLink></div>
            <div className="hero-socials"><span><MapPin size={14} />{profile.location}</span><ExternalLink href={profile.github_url}>GitHub</ExternalLink><ExternalLink href={profile.linkedin_url}>LinkedIn</ExternalLink></div></>}
        </div>
        <div className="hero-visual" aria-label="Fokus keahlian: keamanan, jaringan, dan otomasi">
          <div className="terminal-window"><div className="terminal-top"><span className="terminal-dots"><i /><i /><i /></span><span>rusdi@portfolio: ~</span><span>⌘</span></div><div className="terminal-body"><p><span className="terminal-prompt">➜</span> <span className="terminal-path">~</span> whoami</p><p className="terminal-result">{profile?.name || 'Rusdi Aulia Romadhon'}</p><p><span className="terminal-prompt">➜</span> <span className="terminal-path">~</span> cat focus.txt</p><div className="terminal-focus"><span><ShieldCheck size={17} /> Cybersecurity</span><span><Network size={17} /> Network Infrastructure</span><span><Terminal size={17} /> Automation & Development</span></div><p><span className="terminal-prompt">➜</span> <span className="terminal-path">~</span> status --check</p><p className="terminal-success">● Ready to collaborate<span className="terminal-cursor">_</span></p></div></div>
          <div className="visual-floating"><ShieldCheck size={22} /><span>SECURITY MINDSET<small>Always learning. Always building.</small></span></div>
        </div>
        <a className="hero-scroll" href="#About"><ArrowDown size={15} /> Kenali saya lebih dekat</a>
      </div>
    </section>
    <main id="main-content" className="site-container">
      <AboutSection profile={profile} />
      <Skills /><Projects /><Experience /><Certifications /><Education />
      <section id="Contact" className="portfolio-section" style={{ scrollMarginTop: '85px', borderTop: 'none', paddingTop: '40px' }}>
        <ScrollReveal delay={80}>
          <ContactCard profile={profile} projects={projectsState.data} />
        </ScrollReveal>
      </section>
    </main><footer className="site-footer"><span>© {new Date().getFullYear()} {profile?.name || 'Rusdi Aulia Romadhon'}</span><a href="#Home">Kembali ke atas ↑</a></footer>
  </div>;
}
