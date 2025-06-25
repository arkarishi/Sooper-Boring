import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function Navbar() {
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
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">
        Sooper Boring
      </Link>
      <div className="space-x-4">
        <Link to="/articles" className="text-gray-700 hover:text-blue-600">Articles</Link>
        <Link to="/videos" className="text-gray-700 hover:text-blue-600">Videos</Link>
        <Link to="/jobs" className="text-gray-700 hover:text-blue-600">Jobs</Link>
        <Link to="/theories" className="text-gray-700 hover:text-blue-600">Theories</Link>
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
