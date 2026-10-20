import PropTypes from 'prop-types';
import { ArrowUpRight } from 'lucide-react';
import { safeUrl } from '../data/usePortfolioTable';

export function Section({ id, number, label, title, description, children }) {
  return <section id={id} className="portfolio-section" aria-labelledby={`${id}-heading`}>
    <div className="section-heading"><p className="eyebrow"><span>{number}</span> {label}</p>
      <h2 id={`${id}-heading`}>{title}</h2>{description && <p className="section-description">{description}</p>}
    </div>{children}
  </section>;
}
Section.propTypes = { id: PropTypes.string.isRequired, number: PropTypes.string, label: PropTypes.string, title: PropTypes.string, description: PropTypes.string, children: PropTypes.node };

export function DataState({ state, empty = 'Konten segera hadir.' }) {
  return <>
    {state.loading && <p className="data-state" role="status">Memuat konten…</p>}
    {state.error && <div className="data-state" role="alert">Konten belum berhasil diperbarui. <button onClick={state.retry}>Coba lagi</button></div>}
    {!state.loading && !state.error && !state.data.length && <p className="data-state">{empty}</p>}
  </>;
}
DataState.propTypes = { state: PropTypes.object.isRequired, empty: PropTypes.string };

export function ExternalLink({ href, children, className = 'text-link' }) {
  const url = safeUrl(href);
  return url ? <a className={className} href={url} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={16} aria-hidden="true" /></a> : null;
}
ExternalLink.propTypes = { href: PropTypes.string, children: PropTypes.node, className: PropTypes.string };

export function Tags({ items }) {
  return <ul className="tags">{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>;
}
Tags.propTypes = { items: PropTypes.array.isRequired };
