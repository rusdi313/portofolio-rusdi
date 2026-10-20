import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { usePortfolioTable, asList, safeUrl } from '../data/usePortfolioTable';
import { DataState, ExternalLink, Tags } from './PortfolioUI';

export default function ProjectDetails() {
  const { id } = useParams();
  const state = usePortfolioTable('projects');
  const project = state.data.find(row => String(row.id) === id);
  useEffect(() => { window.scrollTo(0, 0); }, [id]);
  return <div className="portfolio-site"><main className="site-container project-detail">
    <Helmet><title>{project?.Title || 'Studi kasus'} | Rusdi Aulia Romadhon</title>{project && <meta name="description" content={project.Description} />}</Helmet>
    <Link className="text-link" to="/#Portofolio"><ArrowLeft size={18} /> Kembali ke proyek</Link>
    {(state.loading || state.error) && <DataState state={state} />}
    {!state.loading && !state.error && !project && <div className="data-state"><h1>Proyek tidak ditemukan</h1><p>Proyek ini belum tersedia atau tidak dipublikasikan.</p></div>}
    {project && <article><header className="detail-heading"><p className="eyebrow">{project.category || 'Web Development'} {project.featured && ' / Unggulan'}</p><h1>{project.Title}</h1><p className="hero-description">{project.Description}</p><p className="muted">{[project.role, project.period].filter(Boolean).join(' · ')}</p><Tags items={asList(project.TechStack)} /><div className="hero-actions"><ExternalLink href={project.Link}>Lihat proyek</ExternalLink><ExternalLink href={project.Github}>Repository</ExternalLink><ExternalLink href={project.report_url}>Dokumentasi / write-up</ExternalLink></div></header>
      {safeUrl(project.Img) ? <img className="detail-image" src={safeUrl(project.Img)} alt={project.Title} /> : <div className="detail-art" aria-hidden="true"><ShieldCheck size={72} strokeWidth={1} /><span>{project.category || 'Project'}</span></div>}
      <div className="detail-grid">{[['Konteks & tujuan', project.context], ['Pendekatan & metode', project.methods], ['Hasil & pembelajaran', project.outcomes]].filter(([, value]) => value).map(([title, value]) => <section className="panel" key={title}><h2>{title}</h2><p className="detail-text">{value}</p></section>)}
      {asList(project.Features).length > 0 && <section className="panel"><h2>Kontribusi & highlights</h2><ul className="bullet-list">{asList(project.Features).map((item, index) => <li key={index}>{item}</li>)}</ul></section>}</div>
    </article>}
  </main></div>;
}
