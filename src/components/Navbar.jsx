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
  const [focused, setFocused] = useState(false);

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
        onFocus={() => {
          setFocused(true);
          if (search.trim().length > 1 && suggestions.length > 0) setShowDropdown(true);
        }}
        onBlur={() => {
          setFocused(false);
          setTimeout(() => setShowDropdown(false), 200);
        }}
        className={`border rounded-full shadow bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base py-2
          // Mobile: Fixed width, no expansion
          w-48 px-4
          // Desktop: Expanding animation
          sm:transition-all sm:duration-300
          ${focused || search.length > 0
            ? "sm:px-8 sm:w-80"
            : "sm:px-4 sm:w-48"}
        `}
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

// Profile dropdown component
function ProfileDropdown({ user, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_photo_url, name, slug')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowDropdown(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    setShowDropdown(false);
  };

  // Generate a random profile image if none exists
  const getProfileImageUrl = () => {
    if (profile?.profile_photo_url) {
      return profile.profile_photo_url;
    }

    // Generate a random avatar using DiceBear API with the user's email as seed
    const seed = user?.email || 'default';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e6e9f4&textColor=0d0f1c`;
  };

  // Copy profile URL function
  const copyProfileUrl = async () => {
    if (!profile?.slug) return;
    
    const url = `${window.location.origin}/profile/${profile.slug}`;
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        alert('Profile URL copied to clipboard!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Profile URL copied to clipboard!');
      }
    } catch (err) {
      console.error('Failed to copy URL:', err);
      alert('Failed to copy URL. Please try again.');
    }
    
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 cursor-pointer hover:ring-2 hover:ring-white hover:ring-opacity-50 transition-all duration-200"
        style={{
          backgroundImage: `url("${getProfileImageUrl()}")`,
          backgroundColor: "#e6e9f4"
        }}
      />

      {showDropdown && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {profile?.name && (
              <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                <div className="font-medium">{profile.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            )}
            <button
              onClick={handleProfileClick}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </button>
            
            {/* Share Profile URL - only show if user has a slug */}
            {profile?.slug && (
              <button
                onClick={copyProfileUrl}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Profile
              </button>
            )}
            
            <button
              onClick={handleLogoutClick}
              className="w-full text-left px-4 py-2 text-sm text-red-600 bg-white hover:bg-red-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar({ search, setSearch }) {
  const [user, setUser] = useState(null);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
      if (data?.session?.user) {
        checkAdminAccess(data.session.user.email);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        checkAdminAccess(session.user.email);
      } else {
        setHasAdminAccess(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const checkAdminAccess = async (email) => {
    try {
      const { data: dashboardUser, error } = await supabase
        .from('dashboard_users')
        .select('email')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin access:', error);
        setHasAdminAccess(false);
      } else {
        setHasAdminAccess(!!dashboardUser);
      }
    } catch (err) {
      console.error('Admin access check failed:', err);
      setHasAdminAccess(false);
    }
  };

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
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#006B37] border-b border-gray-200 py-2 px-4 sm:px-8 flex justify-between items-center">
      {/* Left: Logo only */}
      <div className="flex items-center">
        <Link
          to="/"
          className="text-xl font-bold text-white font-serif tracking-tight transition-all duration-150 hover:text-white hover:scale-110"
        >
          Design Hub
        </Link>
        {/* Desktop Nav Links */}
        <div className="hidden lg:flex gap-6 ml-8 font-serif text-base font-medium">
          <Link
            to="/articles"
            className="text-white transition-all duration-150 hover:text-white hover:scale-110"
          >
            Articles
          </Link>
          <Link
            to="/theories"
            className="text-white transition-all duration-150 hover:text-white hover:scale-110"
          >
            Theories
          </Link>
          <Link
            to="/videos"
            className="text-white transition-all duration-150 hover:text-white hover:scale-110"
          >
            Videos
          </Link>
          <Link
            to="/jobs"
            className="text-white transition-all duration-150 hover:text-white hover:scale-110"
          >
            Jobs
          </Link>
          <Link
            to="/spotlights"
            className="text-white transition-all duration-150 hover:text-white hover:scale-110"
          >
            Spotlights
          </Link>
          {user && hasAdminAccess && (
            <Link
              to="/dashboard"
              className="text-white transition-all duration-150 hover:text-white hover:scale-110"
            >
              Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Right: Search + Hamburger + Auth */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search bar - hidden on mobile (sm:block), hidden on dashboard */}
        {!isDashboard && (
          <div className="hidden sm:block">
            <SearchDropdown
              search={search}
              setSearch={setSearch}
              onItemClick={handleSearchItemClick}
            />
          </div>
        )}
        {/* Hamburger for mobile - positioned before profile */}
        <button
          className="lg:hidden p-2 rounded hover:bg-white hover:bg-opacity-20 text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        {user ? (
          <ProfileDropdown user={user} onLogout={handleLogout} />
        ) : (
          <Link to="/auth" className="bg-blue-600 text-white px-3 sm:px-4 py-1 rounded hover:bg-blue-700 text-sm sm:text-base">
            Login/Sign Up
          </Link>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 z-50 flex flex-col lg:hidden">
          <div className="flex flex-col gap-2 py-3 px-4 font-serif text-base font-medium">
            <Link to="/articles" className="py-2 text-black hover:text-blue-600" onClick={() => setMenuOpen(false)}>Articles</Link>
            <Link to="/theories" className="py-2 text-black hover:text-blue-600" onClick={() => setMenuOpen(false)}>Theories</Link>
            <Link to="/videos" className="py-2 text-black hover:text-blue-600" onClick={() => setMenuOpen(false)}>Videos</Link>
            <Link to="/jobs" className="py-2 text-black hover:text-blue-600" onClick={() => setMenuOpen(false)}>Jobs</Link>
            <Link to="/spotlights" className="py-2 text-black hover:text-blue-600" onClick={() => setMenuOpen(false)}>Spotlights</Link>
            {user && hasAdminAccess && (
              <Link to="/dashboard" className="py-2 text-black hover:text-blue-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            )}
            {user && (
              <Link to="/profile" className="py-2 text-black hover:text-blue-600" onClick={() => setMenuOpen(false)}>My Profile</Link>
            )}
            {/* Search bar in mobile menu - only show if not dashboard */}
            {!isDashboard && (
              <div className="mt-2">
                <SearchDropdown
                  search={search}
                  setSearch={setSearch}
                  onItemClick={handleSearchItemClick}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}