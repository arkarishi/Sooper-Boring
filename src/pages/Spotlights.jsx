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
      <div className="max-w-6xl mx-auto px-0 sm:px-4">
        <div className="flex items-center mb-8 mt-12 gap-4">
          <h1 className="text-[2rem] font-extrabold text-black flex-1 text-left">
            Instructional Designer Spotlight
          </h1>
        </div>
        <div className="flex flex-col gap-0">
          {spotlights.map((spotlight) => (
            <motion.div
              key={spotlight.id}
              whileHover={{ backgroundColor: "#f6f6f6" }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
              className="p-4 cursor-pointer transition-all"
              onClick={() => navigate(`/spotlights/${spotlight.id}`)}
            >
              <div className="flex items-stretch justify-between gap-4 rounded-xl">
                <div className="flex flex-col gap-1 flex-[2_2_0px]">
                  <p className="text-[#0d141c] text-base font-bold leading-tight">
                    {spotlight.name}
                  </p>
                  <p className="text-[#49719c] text-sm font-normal leading-normal">
                    {spotlight.description}
                  </p>
                </div>
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                  style={{
                    backgroundImage: `url(${getImageUrl(spotlight.image_url)})`,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}