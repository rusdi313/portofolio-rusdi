import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PortfolioSite from './Pages/PortfolioSite';
import ProjectDetails from './components/ProjectDetail';
import NotFoundPage from './Pages/404';
import './portfolio.css';

export default function App() {
  return <BrowserRouter><div className="app-shell"><Routes>
    <Route path="/" element={<PortfolioSite />} />
    <Route path="/project/:id" element={<ProjectDetails />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes></div></BrowserRouter>;
}
