import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-14 px-2 sm:px-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-blue-700 hover:underline"
      >
        <ArrowLeft size={22} /> Back to Videos
      </button>
      <div className="max-w-5xl sm:max-w-6xl mx-auto bg-white p-0 sm:p-16 p-4 rounded-3xl shadow-2xl border border-neutral-200 transition-all duration-300">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">{video.title}</h1>
        <div className="mb-6 text-gray-400 text-base">
          {video.created_at && (
            <>{new Date(video.created_at).toLocaleDateString()}</>
          )}
        </div>
        {/* Video player logic */}
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
        <p className="text-xl text-gray-700 mb-8">{video.description}</p>
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
