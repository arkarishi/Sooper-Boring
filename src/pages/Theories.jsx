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
      <div className="max-w-6xl mx-auto px-0 sm:px-4">
        <div className="flex items-center mb-8 mt-12 gap-4">
          <h1 className="text-[2rem] font-extrabold text-black flex-1 text-left">
            Instructional Design Theories
          </h1>
        </div>
        <div className="flex flex-col gap-6">
          {theories.map((theory) => (
            <motion.div
              key={theory.id}
              whileHover={{ backgroundColor: "#f6f6f6" }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
              className="flex flex-row-reverse items-start gap-8 cursor-pointer px-0 py-3 transition-all"
              onClick={() => navigate(`/theories/${theory.id}`)}
            >
              {/* Right: Image */}
              <div
                className="w-[300px] min-w-[250px] aspect-video bg-center bg-no-repeat bg-cover rounded-xl flex-shrink-0"
                style={{
                  backgroundImage: `url(${getImageUrl(theory.image_url)})`,
                  height: 180,
                  maxHeight: 200,
                }}
              />
              {/* Left: Text */}
              <div className="flex flex-col justify-start flex-1 min-w-0 pt-2">
                <p className="text-[#101419] text-base font-bold leading-tight mb-1">
                  {theory.title}
                </p>
                {theory.intro && (
                  <p className="text-[#58728d] text-sm font-normal leading-normal mb-4">
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
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
