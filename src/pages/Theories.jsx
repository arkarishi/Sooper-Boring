import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const placeholderImg = "https://placehold.co/320x180/eeeeee/cccccc?text=No+Image";

const getImageUrl = (path) => {
  if (!path) return placeholderImg;
  const { data } = supabase.storage.from("theory-images").getPublicUrl(path);
  return data?.publicUrl || placeholderImg;
};

export default function Theories({ search }) {
  const [theories, setTheories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTheories();
  }, [search]);

  const fetchTheories = async () => {
    let query = supabase.from("theories").select("*").order("created_at", { ascending: false });
    if (search && search.trim()) {
      query = query.ilike("title", `%${search}%`);
    }
    const { data } = await query;
    setTheories(data || []);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10" style={{ fontFamily: '"Newsreader", "Noto Sans", sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-4">
        <div className="flex items-center mb-6 sm:mb-8 mt-8 sm:mt-12 gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold text-black flex-1 text-left">
            Instructional Design Theories
          </h1>
        </div>
        
        <div className="flex flex-col gap-4 sm:gap-6">
          {theories.map((theory) => (
            <motion.div
              key={theory.id}
              whileHover={{ backgroundColor: "#f6f6f6" }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
              className="cursor-pointer transition-all rounded-lg"
              onClick={() => navigate(`/theories/${theory.id}`)}
            >
              {/* Desktop/Laptop View - Horizontal Layout (Image Right, Text Left) */}
              <div className="hidden lg:flex flex-row-reverse items-start gap-8 px-2 sm:px-0 py-3">
                {/* Right: Image */}
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                  style={{
                    backgroundImage: `url(${getImageUrl(theory.image_url)})`,
                  }}
                />
                {/* Left: Text */}
                <div className="flex flex-col justify-start flex-[2_2_0px] pt-2">
                  <p className="text-[#101419] text-base font-bold leading-tight mb-1">
                    {theory.title}
                  </p>
                  {theory.intro && (
                    <p className="text-[#58728d] text-sm font-normal leading-normal mb-4 line-clamp-2">
                      {theory.intro}
                    </p>
                  )}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/theories/${theory.id}`);
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full px-5 py-2 font-medium shadow-none border-none transition w-fit mb-2"
                  >
                    Read More
                  </button>
                </div>
              </div>

              {/* Mobile/Tablet View - Card Layout */}
              <div className="lg:hidden bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {/* Image */}
                <div
                  className="w-full h-48 sm:h-56 bg-center bg-cover rounded-t-xl"
                  style={{
                    backgroundImage: `url(${getImageUrl(theory.image_url)})`,
                    backgroundColor: "#f3f4f6",
                  }}
                />
                {/* Content */}
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 font-serif leading-tight">
                    {theory.title}
                  </h3>
                  {theory.intro && (
                    <p className="text-gray-600 text-sm sm:text-base mb-3 line-clamp-3">
                      {theory.intro}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-400">
                      {theory.created_at && (
                        <>Published on {new Date(theory.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</>
                      )}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/theories/${theory.id}`);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-medium rounded-lg px-3 py-1.5 transition-colors"
                    >
                      Read More
                    </button>
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