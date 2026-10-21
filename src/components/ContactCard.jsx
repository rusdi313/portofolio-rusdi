import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Mail, ArrowUpRight, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import siteLogo from '../assets/img/logo-web.png';
import { safeUrl } from '../data/usePortfolioTable';
import { Link } from 'react-router-dom';

// Default project images fallback
const defaultProjectImages = ['/project1.png', '/project2.png', '/project3.png', '/Meta.png'];

export default function ContactCard({ profile, projects = [] }) {
  const [copied, setCopied] = useState(false);
  const email = profile?.email || 'rusdiaulia313@gmail.com';

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;

  const handleCopyEmail = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Prepare projects for dual column infinite vertical scroll
  const displayProjects = useMemo(() => {
    const list = projects && projects.length > 0 ? projects : [
      { id: 1, Title: 'Web Security Assessment', category: 'Cybersecurity', Img: '/project1.png' },
      { id: 2, Title: 'CTF Cyber Breaker', category: 'Security Tools', Img: '/project2.png' },
      { id: 3, Title: 'Otomasi Dokumen SPK', category: 'Automation', Img: '/project3.png' },
      { id: 4, Title: 'Network & Infrastructure', category: 'Networking', Img: '/Meta.png' },
    ];

    // Assign fallback images if Img is empty
    const resolved = list.map((item, idx) => ({
      ...item,
      displayImg: safeUrl(item.Img) || defaultProjectImages[idx % defaultProjectImages.length]
    }));

    // Split into left and right columns
    const colLeft = [];
    const colRight = [];

    resolved.forEach((item, index) => {
      if (index % 2 === 0) {
        colLeft.push(item);
      } else {
        colRight.push(item);
      }
    });

    // Ensure at least 3 items per column for seamless loop
    while (colLeft.length < 3) colLeft.push(...resolved);
    while (colRight.length < 3) colRight.push(...resolved);

    // Duplicate arrays for continuous infinite marquee
    return {
      left: [...colLeft, ...colLeft],
      right: [...colRight, ...colRight],
    };
  }, [projects]);

  return (
    <div className="contact-get-in-touch-wrapper relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#070c14] shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_50px_rgba(255,51,65,0.08)]">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#ff3341]/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 p-6 sm:p-10 lg:p-12 items-center">
        {/* ================= LEFT COLUMN: CONTACT ACTION ================= */}
        <div className="lg:col-span-6 flex flex-col justify-center max-w-xl mx-auto lg:mx-0 w-full">
          {/* Logo Brand / Icon */}
          <div className="mb-6 flex items-center">
            <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
              <img src={siteLogo} alt="Logo" className="h-9 w-auto object-contain" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-['Space_Grotesk'] leading-[1.15] mb-4">
            Get In Touch
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-8">
            {profile?.contact_description ||
              'Tertarik berdiskusi tentang cybersecurity, jaringan, IT infrastructure, atau peluang kolaborasi? Hubungi saya langsung melalui email atau media sosial.'}
          </p>

          {/* EMAIL INPUT / DIRECT GMAIL CLICK BOX */}
          <div className="mb-5">
            <div
              onClick={() => window.open(gmailComposeUrl, '_blank', 'noopener,noreferrer')}
              className="group relative flex items-center justify-between w-full px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl bg-[#0c1420] border-2 border-blue-500/80 hover:border-blue-400 focus-within:border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.25)] transition-all duration-300 cursor-pointer"
              title="Klik untuk membuka pesan baru di Gmail"
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Mail size={16} />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400/90 font-medium">
                    Email Address (Klik untuk kirim via Gmail)
                  </span>
                  <span className="text-sm sm:text-base font-medium text-slate-100 font-mono tracking-tight truncate">
                    {email}
                  </span>
                </div>
              </div>

              {/* Action buttons on the right side of the input box */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Salin email"
                  aria-label="Salin alamat email"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </div>
            {copied && (
              <p className="text-xs text-emerald-400 mt-1.5 ml-1 font-mono flex items-center gap-1">
                <Check size={12} /> Alamat email berhasil disalin ke clipboard!
              </p>
            )}
          </div>

          {/* SOCIAL BUTTONS (LINKEDIN & GITHUB) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
            {/* LinkedIn Button */}
            <a
              href={safeUrl(profile?.linkedin_url) || 'https://www.linkedin.com/in/rusdi-aulia-romadhon/'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-[#0f1724] hover:bg-[#162234] border border-white/10 hover:border-white/20 text-slate-200 hover:text-white text-xs sm:text-sm font-medium transition-all duration-200 shadow-md group active:scale-98"
            >
              <svg className="w-4 h-4 text-[#0a66c2] fill-current flex-shrink-0" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span>LinkedIn</span>
            </a>

            {/* GitHub Button */}
            <a
              href={safeUrl(profile?.github_url) || 'https://github.com/rusdi313'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-[#0f1724] hover:bg-[#162234] border border-white/10 hover:border-white/20 text-slate-200 hover:text-white text-xs sm:text-sm font-medium transition-all duration-200 shadow-md group active:scale-98"
            >
              <svg className="w-4 h-4 text-white fill-current flex-shrink-0" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-2 border-t border-white/5">
            <span>{profile?.location || 'Depok, Indonesia'}</span>
            {profile?.cv_url && (
              <a
                href={safeUrl(profile.cv_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors"
              >
                <span>Curriculum Vitae</span>
                <ArrowUpRight size={13} />
              </a>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: DUAL ANIMATED PROJECT COLUMNS ================= */}
        <div className="lg:col-span-6 w-full">
          <div className="project-marquee-showcase relative h-[420px] sm:h-[480px] rounded-2xl overflow-hidden border border-white/10 bg-[#04080e]/80 backdrop-blur-md">
            {/* Top and bottom gradient masks for smooth fade edges */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#04080e] to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#04080e] to-transparent z-20 pointer-events-none" />

            <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 h-full overflow-hidden">
              {/* Left Column - Animates UP */}
              <div className="marquee-col-up flex flex-col gap-3 sm:gap-4">
                {displayProjects.left.map((item, index) => (
                  <Link
                    to={`/project/${item.id}`}
                    key={`up-${item.id}-${index}`}
                    className="group relative flex flex-col rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50 bg-[#0d1522] transition-all duration-300 hover:scale-[1.02] shadow-lg flex-shrink-0"
                  >
                    <div className="w-full aspect-[16/10] overflow-hidden bg-slate-900 relative">
                      <img
                        src={item.displayImg}
                        alt={item.Title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1522] via-transparent to-transparent opacity-80" />
                    </div>
                    <div className="p-2.5 sm:p-3">
                      <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-0.5">
                        {item.category || 'Project'}
                      </p>
                      <h4 className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white truncate">
                        {item.Title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Right Column - Animates DOWN */}
              <div className="marquee-col-down flex flex-col gap-3 sm:gap-4">
                {displayProjects.right.map((item, index) => (
                  <Link
                    to={`/project/${item.id}`}
                    key={`down-${item.id}-${index}`}
                    className="group relative flex flex-col rounded-xl overflow-hidden border border-white/10 hover:border-cyan-500/50 bg-[#0d1522] transition-all duration-300 hover:scale-[1.02] shadow-lg flex-shrink-0"
                  >
                    <div className="w-full aspect-[16/10] overflow-hidden bg-slate-900 relative">
                      <img
                        src={item.displayImg}
                        alt={item.Title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1522] via-transparent to-transparent opacity-80" />
                    </div>
                    <div className="p-2.5 sm:p-3">
                      <p className="text-[10px] font-mono text-blue-400 uppercase tracking-wider mb-0.5">
                        {item.category || 'Project'}
                      </p>
                      <h4 className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white truncate">
                        {item.Title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ContactCard.propTypes = {
  profile: PropTypes.object,
  projects: PropTypes.array,
};
