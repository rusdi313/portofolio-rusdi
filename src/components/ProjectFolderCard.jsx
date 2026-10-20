import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { asList, safeUrl } from '../data/usePortfolioTable';

// Folder silhouette adapted from the supplied FolderCard reference.
const folderPath = 'M-2,151 a16,16 0 0 1 16,-16 h247 c26.6,0 59.3,59 76,59 h149 a32,32 0 0 1 32,32 v368 a32,32 0 0 1 -32,32 h-456 a32,32 0 0 1 -32,-32 Z';

export default function ProjectFolderCard({ project }) {
  const cover = safeUrl(project.Img);
  return <article className="project-card folder-card">
    <Link className="folder-link" to={`/project/${project.id}`} aria-label={`Lihat studi kasus: ${project.Title}`}>
      <div className="folder-inner">
        <div className="folder-cover" aria-hidden="true">{cover && <img src={cover} alt="" loading="lazy" />}</div>
        {project.featured && <span className="folder-featured">Unggulan</span>}
        <div className="folder-front">
          <svg className="folder-silhouette" viewBox="0 0 516 494" preserveAspectRatio="none" aria-hidden="true"><path d={folderPath} /></svg>
          <p className="folder-category">{project.category || 'Web Development'}</p>
          <div className="folder-copy"><h3>{project.Title}</h3>{project.period && <p className="folder-period">{project.period}</p>}<p className="folder-description">{project.Description}</p></div>
        </div>
        <div className="folder-footer"><p><strong>{asList(project.TechStack).length}</strong><span>Tools</span></p><span className="folder-open">Studi kasus <ArrowUpRight size={18} aria-hidden="true" /></span></div>
      </div>
    </Link>
  </article>;
}
ProjectFolderCard.propTypes = { project: PropTypes.object.isRequired };
