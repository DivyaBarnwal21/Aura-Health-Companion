import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Book, MessageCircle, BarChart2, Heart, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Home',      path: '/',          icon: <Activity size={18} /> },
    { name: 'Journal',   path: '/journal',   icon: <Book size={18} /> },
    { name: 'Chatbot',   path: '/chatbot',   icon: <MessageCircle size={18} /> },
    { name: 'Dashboard', path: '/dashboard', icon: <BarChart2 size={18} /> },
    { name: 'Wellness',  path: '/wellness',  icon: <Heart size={18} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel" style={{ margin: '1rem', padding: '0.875rem 1.5rem' }}>
      <div className="flex justify-between items-center">
        {/* Brand */}
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text)' }}>
          <div className="flex items-center gap-2">
            <Heart size={26} color="var(--primary)" />
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Aura</h2>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="flex gap-4">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  textDecoration: 'none',
                  color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  transition: 'color 0.2s', padding: '0.4rem 0.5rem',
                  borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                }}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User Section */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <User size={16} color="white" />
              </div>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{user.username}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', borderRadius: '0.5rem', padding: '0.5rem 0.875rem',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.1)'}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
