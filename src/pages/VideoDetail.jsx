import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    async function fetchVideo() {
      const { data } = await supabase
        .from("videos")
        .select("*")
        .eq("id", id)
        .single();
      setVideo(data);
    }
    fetchVideo();
  }, [id]);

  if (!video)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  // Helper: Detect if it's a YouTube link
  const isYouTube = (url) =>
    url && (url.includes("youtube.com") || url.includes("youtu.be"));

  return (
    <div className="min-h-screen bg-slate-50 py-10" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[#49719c] text-base font-medium leading-normal cursor-pointer hover:underline"
            onClick={() => navigate("/videos")}
          >
            Videos
          </span>
          <span className="text-[#49719c] text-base font-medium leading-normal">/</span>
        </div>
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d141c] leading-tight mb-2">
          {video.title}
        </h1>
        {/* Date */}
        <div className="mb-6 text-[#49719c] text-sm">
          {video.created_at && (
            <>Published on {new Date(video.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</>
          )}
        </div>
        {/* Video player */}
        <div className="w-full mb-8">
          {isYouTube(video.video_url) ? (
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeID(video.video_url)}`}
              title={video.title}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full rounded-2xl aspect-video bg-black"
            />
          ) : (
            <video
              src={video.video_url}
              controls
              className="w-full rounded-2xl max-h-[600px] bg-black"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
        {/* Description */}
        <p className="text-lg text-gray-700 mb-8">{video.description}</p>
      </div>
    </div>
  );
}

// Helper to extract YouTube video ID
function getYouTubeID(url) {
  const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : "";
}
