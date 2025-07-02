import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function Navbar({ search, setSearch }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
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
    <nav className="bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center">
      {/* Left: Logo and Nav Links */}
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold text-black font-serif tracking-tight">
          Sooper Boring
        </Link>
        <div className="flex gap-6 ml-4 font-serif text-base font-medium">
          <Link to="/articles" className="text-black hover:text-blue-600">Articles</Link>
          <Link to="/theories" className="text-black hover:text-blue-600">Theories</Link>
          <Link to="/videos" className="text-black hover:text-blue-600">Videos</Link>
          <Link to="/jobs" className="text-black hover:text-blue-600">Jobs</Link>
          {user && (
            <Link to="/dashboard" className="text-black hover:text-blue-600">Dashboard</Link>
          )}
        </div>
      </div>
      {/* Right: Search + Auth */}
      <div className="flex items-center gap-4">
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
    </nav>
  );
}
