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
    // eslint-disable-next-line
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
      <div className="max-w-6xl mx-auto px-0 sm:px-4">
        <div className="flex items-center mb-8 mt-12 gap-4">
          <h1 className="text-[2rem] font-extrabold text-black flex-1 text-left">
            Instructional Design Videos
          </h1>
        </div>
        <div className="flex flex-col gap-6">
          {videos.map((video) => (
            <motion.div
              key={video.id}
              whileHover={{ backgroundColor: "#f6f6f6" }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
              className="flex items-stretch justify-between gap-4 cursor-pointer px-0 py-3 transition-all rounded-xl"
              onClick={() => navigate(`/videos/${video.id}`)}
            >
              {/* Left: Text */}
              <div className="flex flex-col gap-1 flex-[2_2_0px]">
                <p className="text-[#0d141c] text-base font-bold leading-tight">
                  {video.title}
                </p>
                <div
                  className="text-[#49719c] text-sm font-normal leading-normal prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: video.description || "" }}
                />
                <span className="text-xs text-gray-400 mt-2">
                  {video.created_at && (
                    <>Published on {new Date(video.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</>
                  )}
                </span>
              </div>
              {/* Right: Thumbnail */}
              <div
                className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                style={{
                  backgroundImage: isYouTube(video.video_url) 
                    ? `url(https://img.youtube.com/vi/${getYouTubeID(video.video_url)}/hqdefault.jpg)`
                    : `url(${getImageUrl(video.thumbnail_url)})`
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
