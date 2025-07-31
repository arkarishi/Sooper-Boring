import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

// Helper functions for image URLs
const getArticleImageUrl = (imageUrl) => {
  // Articles store full URLs, not storage paths
  if (!imageUrl) return "https://placehold.co/40x40/eeeeee/cccccc?text=A";
  return imageUrl;
};

const getTheoryImageUrl = (path) => {
  if (!path) return "https://placehold.co/40x40/eeeeee/cccccc?text=T";
  const { data } = supabase.storage.from("theory-images").getPublicUrl(path);
  return data?.publicUrl || "https://placehold.co/40x40/eeeeee/cccccc?text=T";
};

const getVideoImageUrl = (path, videoUrl) => {
  if (videoUrl && (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be"))) {
    const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
    const match = videoUrl.match(regExp);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/default.jpg`;
    }
  }
  if (!path) return "https://placehold.co/40x40/eeeeee/cccccc?text=V";
  const { data } = supabase.storage.from("video-thumbnails").getPublicUrl(path);
  return data?.publicUrl || "https://placehold.co/40x40/eeeeee/cccccc?text=V";
};

const getJobImageUrl = (path) => {
  if (!path) return "https://placehold.co/40x40/eeeeee/cccccc?text=J";
  const { data } = supabase.storage.from("job-images").getPublicUrl(path);
  return data?.publicUrl || "https://placehold.co/40x40/eeeeee/cccccc?text=J";
};

const getSpotlightImageUrl = (path) => {
  if (!path) return "https://placehold.co/40x40/eeeeee/cccccc?text=S";
  const { data } = supabase.storage.from("spotlight-images").getPublicUrl(path);
  return data?.publicUrl || "https://placehold.co/40x40/eeeeee/cccccc?text=S";
};

// Search component with dropdown
function SearchDropdown({ search, setSearch, onItemClick }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (search.trim().length > 1) {
      fetchSuggestions(search.trim());
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [search]);

  const fetchSuggestions = async (query) => {
    setLoading(true);
    try {
      // Fetch from all tables
      const [articlesRes, theoriesRes, videosRes, jobsRes, spotlightsRes] = await Promise.all([
        supabase
          .from('articles')
          .select('id, title, image_url')
          .ilike('title', `%${query}%`)
          .limit(3),
        supabase
          .from('theories')
          .select('id, title, image_url')
          .ilike('title', `%${query}%`)
          .limit(3),
        supabase
          .from('videos')
          .select('id, title, thumbnail_url, video_url')
          .ilike('title', `%${query}%`)
          .limit(3),
        supabase
          .from('jobs')
          .select('id, title, image_url')
          .ilike('title', `%${query}%`)
          .limit(3),
        supabase
          .from('spotlights')
          .select('id, name, image_url')
          .ilike('name', `%${query}%`)
          .limit(3)
      ]);

      const results = [];
      
      // Add articles - using image_url directly since it's a full URL
      if (articlesRes.data) {
        results.push(...articlesRes.data.map(item => ({
          ...item,
          type: 'article',
          displayTitle: item.title,
          link: `/articles/${item.id}`,
          image: getArticleImageUrl(item.image_url)
        })));
      }

      // Add theories
      if (theoriesRes.data) {
        results.push(...theoriesRes.data.map(item => ({
          ...item,
          type: 'theory',
          displayTitle: item.title,
          link: `/theories/${item.id}`,
          image: getTheoryImageUrl(item.image_url)
        })));
      }

      // Add videos
      if (videosRes.data) {
        results.push(...videosRes.data.map(item => ({
          ...item,
          type: 'video',
          displayTitle: item.title,
          link: `/videos/${item.id}`,
          image: getVideoImageUrl(item.thumbnail_url, item.video_url)
        })));
      }

      // Add jobs
      if (jobsRes.data) {
        results.push(...jobsRes.data.map(item => ({
          ...item,
          type: 'job',
          displayTitle: item.title,
          link: `/jobs/${item.id}`,
          image: getJobImageUrl(item.image_url)
        })));
      }

      // Add spotlights
      if (spotlightsRes.data) {
        results.push(...spotlightsRes.data.map(item => ({
          ...item,
          type: 'spotlight',
          displayTitle: item.name,
          link: `/spotlights/${item.id}`,
          image: getSpotlightImageUrl(item.image_url)
        })));
      }

      setSuggestions(results.slice(0, 8)); // Limit to 8 results
      setShowDropdown(results.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowDropdown(false);
    }
    setLoading(false);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-700';
      case 'theory': return 'bg-green-100 text-green-700';
      case 'video': return 'bg-purple-100 text-purple-700';
      case 'job': return 'bg-orange-100 text-orange-700';
      case 'spotlight': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'article': return 'Article';
      case 'theory': return 'Theory';
      case 'video': return 'Video';
      case 'job': return 'Job';
      case 'spotlight': return 'Spotlight';
      default: return 'Item';
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => search.trim().length > 1 && suggestions.length > 0 && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className="px-4 py-2 border rounded-lg shadow bg-white text-gray-700 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      
      {showDropdown && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
              <span className="text-sm mt-2 block">Searching...</span>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((item, index) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => {
                  onItemClick(item.link);
                  setShowDropdown(false);
                  setSearch('');
                }}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                {/* Image */}
                <div
                  className="w-10 h-10 bg-center bg-cover rounded-lg flex-shrink-0"
                  style={{
                    backgroundImage: `url(${item.image})`,
                    backgroundColor: "#f3f4f6",
                  }}
                />
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {item.displayTitle}
                  </h4>
                  <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium mt-1 ${getTypeColor(item.type)}`}>
                    {getTypeLabel(item.type)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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

  const handleSearchItemClick = (link) => {
    navigate(link);
    setMenuOpen(false);
  };

  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-4 sm:px-8 flex justify-between items-center relative">
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <Link to="/" className="text-xl font-bold text-black font-serif tracking-tight">
          Design Hub
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
          <Link to="/spotlights" className="text-black hover:text-blue-600">Spotlights</Link>
          {user && (
            <>
              <Link to="/dashboard" className="text-black hover:text-blue-600">Dashboard</Link>
              <Link to="/profile" className="text-black hover:text-blue-600">My Profile</Link>
            </>
          )}
        </div>
      </div>
      {/* Right: Search + Auth (desktop) */}
      <div className="hidden sm:flex items-center gap-4">
        {!isDashboard && (
          <SearchDropdown 
            search={search} 
            setSearch={setSearch} 
            onItemClick={handleSearchItemClick}
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
            <Link to="/spotlights" className="py-2 text-black hover:text-blue-600" onClick={() => setMenuOpen(false)}>Spotlights</Link>
            {user && (
              <>
                <Link to="/dashboard" className="py-2 text-black hover:text-blue-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link to="/profile" className="py-2 text-black hover:text-blue-600" onClick={() => setMenuOpen(false)}>My Profile</Link>
              </>
            )}
            {!isDashboard && (
              <div className="mt-2">
                <SearchDropdown 
                  search={search} 
                  setSearch={setSearch} 
                  onItemClick={handleSearchItemClick}
                />
              </div>
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