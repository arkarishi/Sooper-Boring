import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

const placeholderImg = "https://placehold.co/320x180/eeeeee/cccccc?text=No+Image";

const getImageUrl = (path) => {
  if (!path) return placeholderImg;
  const { data } = supabase.storage.from("spotlight-images").getPublicUrl(path);
  return data?.publicUrl || placeholderImg;
};

export default function Spotlights({ search }) {
  const [spotlights, setSpotlights] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpotlights();
  }, [search]);

  const fetchSpotlights = async () => {
    let query = supabase
      .from("spotlights")
      .select("*")
      .order("created_at", { ascending: false });

    if (search && search.trim()) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data } = await query;
    setSpotlights(data || []);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10" style={{ fontFamily: '"Newsreader", "Noto Sans", sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-4">
        <div className="flex items-center mb-6 sm:mb-8 mt-8 sm:mt-12 gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold text-black flex-1 text-left">
            Instructional Designer Spotlight
          </h1>
        </div>
        
        <div className="flex flex-col gap-4 sm:gap-6">
          {spotlights.map((spotlight) => (
            <motion.div
              key={spotlight.id}
              whileHover={{ backgroundColor: "#f6f6f6" }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
              className="cursor-pointer transition-all"
              onClick={() => navigate(`/spotlights/${spotlight.id}`)}
            >
              {/* Desktop/Laptop View - Horizontal Layout */}
              <div className="hidden lg:flex items-center justify-between gap-8 px-0 py-3">
                {/* Left: Profile Image */}
                <div
                  className="w-20 h-20 min-w-20 bg-white border border-gray-200 rounded-full flex items-center justify-center overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${getImageUrl(spotlight.image_url)})`,
                  }}
                />
                {/* Middle: Spotlight Info */}
                <div className="flex flex-col justify-center min-w-0 flex-1 ml-2">
                  <span className="text-black text-base font-semibold font-serif leading-tight mb-0.5 truncate">
                    {spotlight.name}
                  </span>
                  <span className="text-gray-700 text-sm font-normal line-clamp-2">
                    {spotlight.description}
                  </span>
                </div>
                {/* Right: View Profile Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    navigate(`/spotlights/${spotlight.id}`);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full px-5 py-2 font-medium shadow-none border-none transition"
                >
                  View Profile
                </button>
              </div>

              {/* Mobile/Tablet View - Card Layout */}
              <div className="lg:hidden bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {/* Content */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    {/* Profile Image */}
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-white border border-gray-200 rounded-full flex items-center justify-center overflow-hidden bg-cover bg-center flex-shrink-0"
                      style={{
                        backgroundImage: `url(${getImageUrl(spotlight.image_url)})`,
                      }}
                    />
                    {/* Spotlight Info */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 font-serif leading-tight">
                        {spotlight.name}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {spotlight.description}
                      </p>
                      
                      {/* View Profile Button */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/spotlights/${spotlight.id}`);
                        }}
                        className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full px-5 py-2 shadow-none border-none transition"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}