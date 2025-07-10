import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function Navbar({ search, setSearch }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-4 sm:px-8 flex justify-between items-center relative">
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <Link to="/" className="text-xl font-bold text-black font-serif tracking-tight">
          Sooper Boring
        </Link>
        {/* Hamburger for mobile */}
        <button
          className="sm:hidden ml-2 p-2 rounded hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        {/* Desktop Nav Links */}
        <div className="hidden sm:flex gap-6 ml-4 font-serif text-base font-medium">
          <Link to="/articles" className="text-black hover:text-blue-600">Articles</Link>
          <Link to="/theories" className="text-black hover:text-blue-600">Theories</Link>
          <Link to="/videos" className="text-black hover:text-blue-600">Videos</Link>
          <Link to="/jobs" className="text-black hover:text-blue-600">Jobs</Link>
          {user && (
            <Link to="/dashboard" className="text-black hover:text-blue-600">Dashboard</Link>
          )}
        </div>
      </div>
      {/* Right: Search + Auth (desktop) */}
      <div className="hidden sm:flex items-center gap-4">
        {!isDashboard && (
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg shadow bg-white text-gray-700 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        )}
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        ) : (
          <Link to="/auth" className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
            Login/Sign Up
          </Link>
        )}
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 z-50 flex flex-col sm:hidden">
          <div className="flex flex-col gap-2 py-3 px-4 font-serif text-base font-medium">
            <Link to="/articles" className="py-2 text-black hover:text-blue-600" onClick={() => setMenuOpen(false)}>Articles</Link>
            <Link to="/theories" className="py-2 text-black hover:text-blue-600" onClick={() => setMenuOpen(false)}>Theories</Link>
            <Link to="/videos" className="py-2 text-black hover:text-blue-600" onClick={() => setMenuOpen(false)}>Videos</Link>
            <Link to="/jobs" className="py-2 text-black hover:text-blue-600" onClick={() => setMenuOpen(false)}>Jobs</Link>
            {user && (
              <Link to="/dashboard" className="py-2 text-black hover:text-blue-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            )}
            {!isDashboard && (
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="px-4 py-2 border rounded-lg shadow bg-white text-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}
            {user ? (
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 mt-2"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 mt-2"
                onClick={() => setMenuOpen(false)}
              >
                Login/Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
