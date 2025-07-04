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
        {/* Author and Date */}
        <div className="mb-6 text-[#49719c] text-sm">
          {video.author && <>By {video.author} · </>}
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
        {/* Description (short summary) */}
        {video.description && (
          <p className="text-[#0d141c] text-base font-normal leading-normal pb-3 pt-1">
            {video.description}
          </p>
        )}
        {/* Body (full content, rich HTML) */}
        <div
          className="prose prose-lg text-gray-700 mb-8"
          dangerouslySetInnerHTML={{ __html: video.body || "<i>No detailed content provided.</i>" }}
        />
        {/* Category & Tags at the bottom */}
        <div className="flex flex-wrap gap-2 mt-10">
          {video.category && (
            <span className="inline-block bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded font-semibold uppercase tracking-wide">
              {video.category}
            </span>
          )}
          {Array.isArray(video.tags) && video.tags.length > 0 && (
            video.tags.map(tag => (
              <span key={tag} className="inline-block bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
                #{tag}
              </span>
            ))
          )}
        </div>
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
