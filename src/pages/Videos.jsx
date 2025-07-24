import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const placeholderImg = "https://placehold.co/320x180/eeeeee/cccccc?text=No+Image";

// Helper for YouTube thumbnails
function isYouTube(url) {
  return url && (url.includes("youtube.com") || url.includes("youtu.be"));
}
function getYouTubeID(url) {
  const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : "";
}
const getImageUrl = (path) => {
  if (!path) return placeholderImg;
  const { data } = supabase.storage.from("video-thumbnails").getPublicUrl(path);
  return data?.publicUrl || placeholderImg;
};

export default function Videos({ search }) {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, [search]);

  const fetchVideos = async () => {
    let query = supabase.from("videos").select("*").order("created_at", { ascending: false });
    if (search && search.trim()) {
      query = query.ilike("title", `%${search}%`);
    }
    const { data } = await query;
    setVideos(data || []);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10" style={{ fontFamily: '"Newsreader", "Noto Sans", sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-4">
        <div className="flex items-center mb-6 sm:mb-8 mt-8 sm:mt-12 gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold text-black flex-1 text-left">
            Instructional Design Videos
          </h1>
        </div>
        
        <div className="flex flex-col gap-4 sm:gap-6">
          {videos.map((video) => (
            <motion.div
              key={video.id}
              whileHover={{ backgroundColor: "#f6f6f6" }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
              className="cursor-pointer transition-all"
              onClick={() => navigate(`/videos/${video.id}`)}
            >
              {/* Desktop/Laptop View - Horizontal Layout (Image Left, Content Right) */}
              <div className="hidden lg:flex items-start gap-8 px-2 sm:px-0 py-3">
                {/* Left: Image with same dimensions as Theories */}
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                  style={{
                    backgroundImage: isYouTube(video.video_url) 
                      ? `url(https://img.youtube.com/vi/${getYouTubeID(video.video_url)}/hqdefault.jpg)`
                      : `url(${getImageUrl(video.thumbnail_url)})`,
                    backgroundColor: "#f3f4f6",
                  }}
                />
                {/* Right: Text Content */}
                <div className="flex flex-col justify-start flex-[2_2_0px] pt-2">
                  <p className="text-[#101419] text-lg font-bold leading-tight mb-1 font-serif tracking-[-0.015em]">
                    {video.title}
                  </p>
                  <div
                    className="text-[#49719c] text-base font-normal leading-normal mb-1 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: video.description || "" }}
                  />
                  <span className="text-xs text-gray-400 mt-2">
                    {video.created_at && (
                      <>Published on {new Date(video.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</>
                    )}
                  </span>
                </div>
              </div>

              {/* Mobile/Tablet View - Card Layout */}
              <div className="lg:hidden bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {/* Image with YouTube 16:9 aspect ratio */}
                <div
                  className="w-full bg-center bg-cover rounded-t-xl"
                  style={{
                    backgroundImage: isYouTube(video.video_url) 
                      ? `url(https://img.youtube.com/vi/${getYouTubeID(video.video_url)}/hqdefault.jpg)`
                      : `url(${getImageUrl(video.thumbnail_url)})`,
                    aspectRatio: '16/9',
                    backgroundColor: "#f3f4f6",
                  }}
                />
                {/* Content */}
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 font-serif leading-tight">
                    {video.title}
                  </h3>
                  <div
                    className="text-gray-600 text-sm sm:text-base mb-3 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: video.description || "" }}
                  />
                  <span className="text-xs sm:text-sm text-gray-400">
                    {video.created_at && (
                      <>Published on {new Date(video.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</>
                    )}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
