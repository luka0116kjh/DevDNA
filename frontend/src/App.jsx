import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Mail, Share2, Activity, LogOut } from 'lucide-react';
import ContributionHeatmap2D from './components/ContributionHeatmap2D';
import './index.css';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const GITHUB_USERNAME_REGEX = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
const OWNER_GITHUB_URL = import.meta.env.VITE_OWNER_GITHUB_URL || 'https://github.com/luka0116kjh';
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'kjh08116@naver.com';

function MainApp() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { user } = useParams();
  const siteBaseUrl = window.location.origin;

  const normalizeUsername = useCallback((value) => {
    const cleaned = value.trim();
    if (!cleaned) return '';
    return cleaned.replace(/^@+/, '');
  }, []);

  const fetchData = useCallback(async (targetUser) => {
    const normalizedUser = normalizeUsername(targetUser);
    if (!normalizedUser) return;

    if (!GITHUB_USERNAME_REGEX.test(normalizedUser)) {
      setError('Invalid GitHub username format.');
      setData(null);
      return;
    }

    setLoading(true);
    setError('');
    setData(null);

    try {
      const encodedUser = encodeURIComponent(normalizedUser);
      const response = await axios.get(`${API_BASE_URL}/api/analyze/${encodedUser}`);
      setData(response.data);
      let routeUser = '';
      if (user) {
        try {
          routeUser = decodeURIComponent(user);
        } catch {
          routeUser = user;
        }
      }
      if (routeUser !== normalizedUser) {
        navigate(`/user/${normalizedUser}`, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [user, navigate, normalizeUsername]);

  useEffect(() => {
    if (user) {
      let decoded = user;
      try {
        decoded = decodeURIComponent(user);
      } catch {
        decoded = user;
      }
      setUsername(decoded);
      fetchData(decoded);
    }
  }, [user, fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    const normalizedUser = normalizeUsername(username);
    if (normalizedUser) {
      setUsername(normalizedUser);
      fetchData(normalizedUser);
    }
  };

  const handleOpenGithub = () => {
    window.open(OWNER_GITHUB_URL, '_blank', 'noopener,noreferrer');
  };

  const handleContactShare = () => {
    if (!CONTACT_EMAIL) {
      alert('Contact email is not configured.');
      return;
    }

    const subject = encodeURIComponent('DevDNA Inquiry');
    const body = encodeURIComponent(
      `Hello,\n\nI have an inquiry about DevDNA.\n\nProfile: ${siteBaseUrl}/user/${encodeURIComponent(username)}\n\nThanks.`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${siteBaseUrl}/user/${encodeURIComponent(username)}`);
      alert('Link copied to clipboard!');
    } catch {
      alert('Failed to copy link.');
    }
  };

  const handleLogout = () => {
    setData(null);
    setError('');
    setUsername('');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('githubToken');
    navigate('/');
  };

  const handle3DUpdateNotice = () => {
    alert('3D view is currently being updated.');
  };

  return (
    <div className="app-container">
      <ContributionHeatmap2D data={data} />

      <div className="content-layer">
        <div className="header">
          <div className="logo" onClick={() => { navigate('/'); setData(null); setUsername(''); setError(''); }}>
            <Activity className="logo-icon" size={32} />
            <span>DevDNA</span>
          </div>
          <button type="button" className="view-update-btn glow-hover" onClick={handle3DUpdateNotice}>
            3D (Updating)
          </button>
        </div>

        <motion.form
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: data ? -200 : 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="search-form"
          onSubmit={handleSearch}
        >
          <div className="input-wrapper">
            <Github className="github-icon" size={24} />
            <input
              type="text"
              className="username-input"
              placeholder="Enter GitHub ID (e.g., luka0116kjh)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          {!data && (
            <button type="submit" className="btn-primary glow-hover" disabled={loading || !username}>
              Analyze My DNA
            </button>
          )}
        </motion.form>

        {loading && (
          <div className="loader-container">
            <div className="spinner"></div>
            <span className="loading-text">SEQUENCING REPOSITORY DATA...</span>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel"
            style={{ padding: '1rem', color: '#ff3366', marginTop: '1rem', borderColor: '#ff3366' }}
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence>
          {data && !loading && (
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
              className="result-card glass-panel"
            >
              <div className="user-profile">
                <img src={`https://github.com/${username}.png`} alt={username} className="avatar glow-hover" />
                <div className="user-info">
                  <h2 className="neon-text">{username}</h2>
                  <p>{data.totalContributions} Contributions in the last year</p>
                </div>
              </div>

              <div className="dna-type glow-hover">
                <p>{data.type}</p>
              </div>

              <div className="dna-stats">
                {Object.entries(data.scores || {}).map(([label, score]) => (
                  <div className="stat-row" key={label}>
                    <span className="stat-label">{label}</span>
                    <div className="stat-bar-container">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                        className="stat-bar"
                      />
                    </div>
                    <span className="stat-value neon-text">{score}</span>
                  </div>
                ))}
              </div>

              <div className="actions" data-html2canvas-ignore>
                <button onClick={handleOpenGithub} className="btn-secondary glow-hover" title="Open GitHub">
                  <Github size={20} /> Github
                </button>
                <button onClick={handleContactShare} className="btn-secondary glow-hover" title="Contact via Email">
                  <Mail size={20} /> mail
                </button>
                <button onClick={handleCopyLink} className="btn-secondary glow-hover" title="Copy Link">
                  <Share2 size={20} /> Copy
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="footer-actions">
          <button type="button" onClick={handleLogout} className="btn-logout glow-hover">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/user/:user" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

export default App;
