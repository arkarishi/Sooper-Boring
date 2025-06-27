import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Helper: Detect YouTube link
function isYouTube(url) {
  return url && (url.includes("youtube.com") || url.includes("youtu.be"));
}
// Helper: Extract YouTube video ID
function getYouTubeID(url) {
  const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : "";
}

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const { data } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });
    setVideos(data || []);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-10">Videos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {videos.map((video) => (
          <motion.div
            key={video.id}
            whileHover={{
              scale: 1.035,
              y: -3,
              boxShadow: "0 10px 40px 0 rgba(0,0,0,0.11)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="flex flex-col justify-between h-[340px] rounded-3xl bg-white shadow-lg overflow-hidden border border-neutral-100 hover:border-blue-300 transition-all cursor-pointer group"
            onClick={() => navigate(`/videos/${video.id}`)}
          >
            {/* Preview */}
            {isYouTube(video.video_url) ? (
              <div className="relative w-full h-40 rounded-t-3xl overflow-hidden flex-shrink-0">
                <img
                  src={`https://img.youtube.com/vi/${getYouTubeID(video.video_url)}/hqdefault.jpg`}
                  alt="YouTube thumbnail"
                  className="w-full h-full object-cover transition group-hover:scale-105 duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white/80 rounded-full p-2 text-3xl text-blue-600 shadow-lg group-hover:scale-110 transition">
                    ▶
                  </span>
                </div>
              </div>
            ) : video.video_url ? (
              <video
                src={video.video_url}
                className="w-full h-40 object-cover rounded-t-3xl bg-black flex-shrink-0"
                muted
                preload="metadata"
                controls={false}
              />
            ) : (
              <div className="w-full h-40 bg-gray-200 rounded-t-3xl flex items-center justify-center text-4xl text-gray-400 flex-shrink-0">
                <span>▶</span>
              </div>
            )}

            {/* Info/content section */}
            <div className="flex-1 flex flex-col p-4 md:p-5 min-h-0">
              <h2 className="font-semibold text-[1.09rem] md:text-lg text-gray-900 mb-1 line-clamp-2 leading-snug">
                {video.title}
              </h2>
              <p className="text-gray-500 text-[0.96rem] mb-0 line-clamp-2 leading-tight">
                {video.description}
              </p>
            </div>

            {/* Date/footer */}
            <div className="border-t border-gray-100 px-5 pt-3 pb-3 min-h-[32px] flex items-center">
              <span className="text-[13px] text-gray-400 tracking-wide">
                {video.created_at && new Date(video.created_at).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
