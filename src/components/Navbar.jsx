import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function Navbar({ search, setSearch }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center">
      {/* Left: Logo and Nav Links */}
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold text-black font-serif tracking-tight">
          Sooper Boring
        </Link>
        <div className="flex gap-6 ml-4">
          <Link to="/articles" className="text-gray-700 hover:text-blue-600">Articles</Link>
          <Link to="/theories" className="text-gray-700 hover:text-blue-600">Theories</Link>
          <Link to="/videos" className="text-gray-700 hover:text-blue-600">Videos</Link>
          <Link to="/jobs" className="text-gray-700 hover:text-blue-600">Jobs</Link>
        </div>
      </div>
      {/* Right: Search + Auth/Dashboard */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow bg-white text-gray-700 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {user ? (
          <>
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth" className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
            Login/Sign Up
          </Link>
        )}
      </div>
    </nav>
  );
}
