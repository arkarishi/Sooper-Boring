import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Helper: Detect YouTube link
function isYouTube(url) {
  return url && (url.includes("youtube.com") || url.includes("youtu.be"));
}
function getYouTubeID(url) {
  const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : "";
}

// Placeholder image for local videos
const videoPlaceholder = "https://placehold.co/320x180/eeeeee/cccccc?text=No+Thumbnail";

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
    <div className="min-h-screen bg-slate-50 pb-10" style={{ fontFamily: '"Newsreader", "Noto Sans", sans-serif' }}>
      <div className="max-w-6xl mx-auto px-0 sm:px-4">
        {/* Blue left headline */}
        <h1 className="text-[2rem] font-extrabold text-blue-900 mb-8 mt-12 text-left">
          Instructional Design Videos
        </h1>

        <div className="flex flex-col gap-6">
          {videos.map((video) => (
            <motion.div
              key={video.id}
              whileHover={{ y: -2, boxShadow: "0 6px 24px 0 rgba(0,0,0,0.08)" }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
              className="flex items-stretch justify-between gap-7 rounded-xl bg-white/95 border border-neutral-100 hover:border-blue-200 transition-all cursor-pointer p-6"
              onClick={() => navigate(`/videos/${video.id}`)}
              style={{ minHeight: 130 }}
            >
              {/* Left: Text */}
              <div className="flex flex-col justify-center flex-[2.2_2.2_0px] min-w-0 pr-4">
                <p className="text-[#0d141c] text-base font-bold leading-tight mb-1 truncate">{video.title}</p>
                <p className="text-[#49719c] text-sm font-normal leading-normal mb-2 truncate">{video.description}</p>
                <span className="text-xs text-gray-400 mt-2">
                  {video.created_at && new Date(video.created_at).toLocaleDateString()}
                </span>
              </div>
              {/* Right: Thumbnail */}
              <div
                className="w-[260px] min-w-[210px] aspect-video bg-center bg-no-repeat bg-cover rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{
                  backgroundImage: isYouTube(video.video_url)
                    ? `url(https://img.youtube.com/vi/${getYouTubeID(video.video_url)}/hqdefault.jpg)`
                    : `url(${videoPlaceholder})`,
                  height: 120,
                  maxHeight: 130,
                }}
              >
                {!isYouTube(video.video_url) && video.video_url && (
                  <video
                    src={video.video_url}
                    className="w-full h-full object-cover rounded-xl bg-black"
                    muted
                    preload="metadata"
                    controls={false}
                    poster={videoPlaceholder}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
