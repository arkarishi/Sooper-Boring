import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { Edit, Trash2, Eye, Plus, Search, Filter, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const contentTypes = [
  { label: "Articles", value: "articles", table: "articles" },
  { label: "Jobs", value: "jobs", table: "jobs" },
  { label: "Theories", value: "theories", table: "theories" },
  { label: "Videos", value: "videos", table: "videos" },
  { label: "Spotlights", value: "spotlights", table: "spotlights" },
];

const placeholderImg = "https://placehold.co/320x180/eeeeee/cccccc?text=No+Image";

// Helper functions for YouTube (copied from Videos.jsx)
function isYouTube(url) {
  return url && (url.includes("youtube.com") || url.includes("youtu.be"));
}

function getYouTubeID(url) {
  const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : "";
}

export default function ContentManager({ onEdit, activeContentType, setActiveContentType }) {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [activeContentType]);

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from(activeContentType.table)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from(activeContentType.table)
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      // Remove from local state
      setContent(content.filter(item => item.id !== id));
      alert("Item deleted successfully!");
    } catch (err) {
      alert("Error deleting item: " + err.message);
    }
  };

  const filteredContent = content.filter(item => {
    const searchFields = ['title', 'name', 'company', 'category', 'author'];
    return searchFields.some(field => 
      item[field]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getItemTitle = (item) => {
    return item.title || item.name || item.company || "Untitled";
  };

  const getItemSubtitle = (item) => {
    switch (activeContentType.value) {
      case "articles":
        return `By ${item.author} • ${item.category || 'Uncategorized'}`;
      case "jobs":
        const jobDate = item.posted_at || item.created_at;
        return `${item.location} • ${jobDate ? `Posted ${formatDate(jobDate)}` : 'Recently posted'}`;
      case "theories":
        return `${item.subtitle || 'Theory'} • ${item.created_at ? formatDate(item.created_at) : 'Recently added'}`;
      case "videos":
        return `By ${item.author} • ${item.category || 'Uncategorized'}`;
      case "spotlights":
        return `${item.position} • ${item.location}`;
      default:
        return item.created_at ? formatDate(item.created_at) : 'Recently added';
    }
  };

  // Updated image fetching logic with better aspect ratios
  const getImageUrl = (item) => {
    if (activeContentType.value === "videos") {
      // For videos: Check YouTube first, then thumbnail_url, then placeholder
      if (isYouTube(item.video_url)) {
        const videoId = getYouTubeID(item.video_url);
        if (videoId) {
          // Use mqdefault for better aspect ratio (320x180 = 16:9)
          return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        }
      }
      
      if (item.thumbnail_url) {
        if (item.thumbnail_url.startsWith('http')) {
          return item.thumbnail_url;
        } else {
          const { data } = supabase.storage.from("video-thumbnails").getPublicUrl(item.thumbnail_url);
          return data?.publicUrl || placeholderImg;
        }
      }
      
      return placeholderImg;
    }
    
    // For other content types
    if (item.image_url) {
      if (item.image_url.startsWith('http')) {
        return item.image_url;
      } else {
        const bucketMap = {
          articles: "article-images",
          jobs: "job-images", 
          theories: "theory-images",
          spotlights: "spotlight-images"
        };
        const bucket = bucketMap[activeContentType.value];
        if (bucket) {
          const { data } = supabase.storage.from(bucket).getPublicUrl(item.image_url);
          return data?.publicUrl || placeholderImg;
        }
      }
    }
    
    return placeholderImg;
  };

  const handleContentTypeSelect = (type) => {
    setActiveContentType(type);
    setDropdownOpen(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6">
      {/* Header - Responsive */}
      <div className="flex flex-col gap-4 mb-4 sm:mb-6">
        {/* Title and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Manage {activeContentType.label}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {filteredContent.length} {filteredContent.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          
          <button
            onClick={() => onEdit(null, 'create', activeContentType.value)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden xs:inline">Add New</span>
            <span className="hidden sm:inline">{activeContentType.label.slice(0, -1)}</span>
          </button>
        </div>

        {/* Content Type Selector - Responsive with Dropdown */}
        <div className="flex flex-wrap gap-2">
          {/* Desktop: Show all buttons */}
          <div className="hidden md:flex flex-wrap gap-2">
            {contentTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setActiveContentType(type)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  activeContentType.value === type.value
                    ? 'bg-white text-black shadow-md border'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Mobile/Tablet: All content types in dropdown - Using Dashboard CSS */}
          <div className="block md:hidden relative w-full max-w-xs">
            <button
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl shadow-lg border border-gray-200 font-semibold text-black hover:bg-gray-50 transition-all duration-200"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="truncate">
                {activeContentType.label}
              </span>
              <ChevronDown 
                className={`w-5 h-5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                {contentTypes.map(type => (
                  <button
                    key={type.value}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 bg-white transition-all duration-200 text-black"
                    onClick={() => handleContentTypeSelect(type)}
                  >
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search - Responsive */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={`Search ${activeContentType.label.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Content List - Responsive Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm sm:text-base">
          Error: {error}
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm sm:text-base">
          {searchTerm ? 'No items match your search.' : `No ${activeContentType.label.toLowerCase()} found.`}
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 md:gap-6">
          <AnimatePresence>
            {filteredContent.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  {/* Image/Thumbnail - Responsive with proper aspect ratios */}
                  <div className="relative flex-shrink-0 w-full sm:w-auto">
                    {activeContentType.value === "videos" ? (
                      // 16:9 aspect ratio container for videos
                      <div className="w-full h-20 sm:w-28 sm:h-16 md:w-32 md:h-18 lg:w-36 lg:h-20 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={getImageUrl(item)}
                          alt={getItemTitle(item)}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = placeholderImg;
                          }}
                        />
                      </div>
                    ) : (
                      // Square container for other content types
                      <img
                        src={getImageUrl(item)}
                        alt={getItemTitle(item)}
                        className="w-full h-32 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = placeholderImg;
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Content - Responsive */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg line-clamp-2">
                          {getItemTitle(item)}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {getItemSubtitle(item)}
                        </p>
                      </div>

                      {/* Actions - Mobile: Full width, Desktop: Right aligned */}
                      <div className="flex items-center gap-2 sm:flex-shrink-0 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => onEdit(item, 'edit', activeContentType.value)}
                          className="flex-1 sm:flex-initial p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} className="sm:w-[18px] sm:h-[18px] mx-auto" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex-1 sm:flex-initial p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} className="sm:w-[18px] sm:h-[18px] mx-auto" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Description - Responsive */}
                    {item.description && (
                      <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 sm:line-clamp-3 mb-2">
                        {item.description}
                      </p>
                    )}
                    
                    {/* Tags - Responsive */}
                    {item.tags && Array.isArray(item.tags) && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, window.innerWidth < 640 ? 3 : 4).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > (window.innerWidth < 640 ? 3 : 4) && (
                          <span className="text-xs text-gray-500">
                            +{item.tags.length - (window.innerWidth < 640 ? 3 : 4)} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}