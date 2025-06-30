import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Helper to get image from Supabase storage
function getImageUrl(path) {
  if (!path) return "https://placehold.co/320x180/eeeeee/cccccc?text=No+Image";
  const { data } = supabase.storage.from("theory-images").getPublicUrl(path);
  return data?.publicUrl || "https://placehold.co/320x180/eeeeee/cccccc?text=No+Image";
}

export default function Theories() {
  const [theories, setTheories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTheories();
  }, []);

  const fetchTheories = async () => {
    const { data } = await supabase
      .from("theories")
      .select("*")
      .order("created_at", { ascending: false });
    setTheories(data || []);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10" style={{ fontFamily: '"Newsreader", "Noto Sans", sans-serif' }}>
      <div className="max-w-6xl mx-auto px-0 sm:px-4">
        {/* Blue left headline */}
        <h1 className="text-[2rem] font-extrabold text-blue-900 mb-8 mt-12 text-left">
          Instructional Design Theories
        </h1>

        <div className="flex flex-col gap-6">
          {theories.map((theory) => (
            <motion.div
              key={theory.id}
              whileHover={{ y: -2, boxShadow: "0 6px 24px 0 rgba(0,0,0,0.08)" }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
              className="flex items-stretch justify-between gap-7 rounded-xl bg-white/95 border border-neutral-100 hover:border-blue-200 transition-all cursor-pointer p-6"
              onClick={() => navigate(`/theories/${theory.id}`)}
              style={{ minHeight: 130 }}
            >
              {/* Left: Text */}
              <div className="flex flex-col justify-center flex-[2.2_2.2_0px] min-w-0 pr-4">
                <p className="text-[#0d141c] text-base font-bold leading-tight mb-1 truncate">{theory.title}</p>
                <p className="text-[#49719c] text-sm font-normal leading-normal mb-2 truncate">{theory.intro || theory.subtitle}</p>
                <span className="text-xs text-gray-400 mt-2">
                  {theory.created_at && new Date(theory.created_at).toLocaleDateString()}
                </span>
              </div>
              {/* Right: Thumbnail */}
              <div
                className="w-[260px] min-w-[210px] aspect-video bg-center bg-no-repeat bg-cover rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{
                  backgroundImage: `url(${getImageUrl(theory.image_url)})`,
                  height: 120,
                  maxHeight: 130,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
