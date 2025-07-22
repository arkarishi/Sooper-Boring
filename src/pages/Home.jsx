import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

// Helper for job images (Supabase storage)
function getJobImageUrl(path) {
  if (!path) return "https://placehold.co/400x200/eeeeee/cccccc?text=No+Image";
  const { data } = supabase.storage.from("job-images").getPublicUrl(path);
  return data?.publicUrl || "https://placehold.co/400x200/eeeeee/cccccc?text=No+Image";
}

// Helper for theory images (Supabase storage)
function getTheoryImageUrl(path) {
  if (!path) return "https://placehold.co/400x200/eeeeee/cccccc?text=No+Image";
  const { data } = supabase.storage.from("theory-images").getPublicUrl(path);
  return data?.publicUrl || "https://placehold.co/400x200/eeeeee/cccccc?text=No+Image";
}

// Helper for YouTube thumbnails
function isYouTube(url) {
  return url && (url.includes("youtube.com") || url.includes("youtu.be"));
}
function getYouTubeID(url) {
  const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
  const match = url?.match(regExp);
  return match && match[1] ? match[1] : "";
}
// Helper for video thumbnails (Supabase storage)
function getVideoImageUrl(path) {
  if (!path) return "https://placehold.co/400x200/eeeeee/cccccc?text=No+Image";
  const { data } = supabase.storage.from("video-thumbnails").getPublicUrl(path);
  return data?.publicUrl || "https://placehold.co/400x200/eeeeee/cccccc?text=No+Image";
}

export default function Home() {
  const [latestArticles, setLatestArticles] = useState([]);
  const [theories, setTheories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [spotlights, setSpotlights] = useState([]);

  useEffect(() => {
    fetchLatestArticles();
    fetchLatestTheories();
    fetchLatestVideos();
    fetchLatestJobs();
    fetchLatestSpotlights();
  }, []);

  // Fetch 3 latest articles
  async function fetchLatestArticles() {
    const { data } = await supabase
      .from("articles")
      .select("id, title, description, image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(3);
    setLatestArticles(
      (data || []).map((a) => ({
        image: a.image_url,
        title: a.title,
        desc: a.description,
        link: `/articles/${a.id}`,
      }))
    );
  }

  // Fetch 3 latest theories
  async function fetchLatestTheories() {
    const { data } = await supabase
      .from("theories")
      .select("id, title, intro, image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(3);
    setTheories(
      (data || []).map((t) => ({
        image: getTheoryImageUrl(t.image_url),
        title: t.title,
        desc: t.intro,
        link: `/theories/${t.id}`,
      }))
    );
  }

  // Fetch 3 latest videos
  async function fetchLatestVideos() {
    const { data } = await supabase
      .from("videos")
      .select("id, title, description, thumbnail_url, video_url, created_at")
      .order("created_at", { ascending: false })
      .limit(3);
    setVideos(
      (data || []).map((v) => ({
        image: isYouTube(v.video_url)
          ? `https://img.youtube.com/vi/${getYouTubeID(v.video_url)}/hqdefault.jpg`
          : getVideoImageUrl(v.thumbnail_url),
        title: v.title,
        desc: v.description,
        link: `/videos/${v.id}`,
      }))
    );
  }

  // Fetch 3 latest jobs
  async function fetchLatestJobs() {
    const { data } = await supabase
      .from("jobs")
      .select("id, title, company, image_url, about, posted_at, location")
      .order("posted_at", { ascending: false })
      .limit(3);
    setJobs(
      (data || []).map((job) => ({
        image: getJobImageUrl(job.image_url),
        title: job.title,
        desc: job.about,
        company: job.company,
        location: job.location,
        posted_at: job.posted_at,
        link: `/jobs/${job.id}`,
      }))
    );
  }

  // Fetch 4 latest spotlights
  async function fetchLatestSpotlights() {
    const { data } = await supabase
      .from("spotlights")
      .select("id, name, description, image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(4);
    setSpotlights(
      (data || []).map((s) => ({
        image: getSpotlightImageUrl(s.image_url),
        title: s.name,
        desc: s.description,
        link: `/spotlights/${s.id}`,
      }))
    );
  }

  return (
    <section className="min-h-screen w-full bg-neutral-50 flex flex-col items-center font-[Newsreader,sans-serif] pb-10 sm:pb-20">
      <HeroBanner />
      <SectionCards title="Latest Articles" items={latestArticles} />
      <SectionCards title="Theories" items={theories} />
      <SectionCards title="Videos" items={videos} />
      <SectionCards title="Jobs" items={jobs} />
      <SpotlightsSection items={spotlights} />
    </section>
  );
}

// Hero banner - Made fully responsive
function HeroBanner() {
  return (
    <div
      className="w-full flex flex-col items-start justify-end min-h-[280px] sm:min-h-[340px] lg:min-h-[380px] max-w-5xl mx-auto mt-4 sm:mt-6 lg:mt-10 mx-4 sm:mx-6 lg:mx-8 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 rounded-xl bg-cover bg-center shadow"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.1),rgba(0,0,0,0.4)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-tR9rmSDwI7QaAQdo4o4Tob0QnLHMLEE4UNyH0pCllrN5BKsfo7GMoQOCUBPl6eMpfl0Ag5EY4QGJm3hbXOI0HimqTp9EDJk23145L5pgg4CwgvooBzmskDiyAnyaUjb3iJVQr5owXa3ZoI7ji_B7Tl3WIU_OY3ew7ORrbG-6dlMI0Y_10a8lzCOoml_uZnrGPBnSrGYygdW0X5tM35qMhNczeyqbZnvUtuw7SmRT1qDuylHkIw4DWObEWZ_kHNlh3r_hLkWDGw')",
      }}
    >
      <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 sm:mb-3 lg:mb-4 drop-shadow-lg leading-tight">
        Instructional Design Theories
      </h1>
      <p className="text-white text-sm sm:text-base lg:text-lg mb-4 sm:mb-5 lg:mb-6 drop-shadow-lg max-w-xl leading-relaxed">
        Explore the world of instructional design theories with Sooper Boring. We provide in-depth articles, videos, and resources to help you master the art of effective learning design.
      </p>
      <Link
        to="/articles"
        className="bg-black text-white rounded-full px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base font-bold shadow hover:bg-neutral-800 transition-colors"
      >
        Explore Articles
      </Link>
    </div>
  );
}

// Generic Section for Cards - Mobile view with padding, desktop without padding
function SectionCards({ title, items }) {
  const placeholder = "https://placehold.co/400x200/eeeeee/cccccc?text=No+Image";
  
  return (
    <div className="w-full max-w-5xl mx-auto mt-4 sm:mt-6 lg:mt-10 mx-4 sm:mx-6 lg:mx-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 px-4 sm:px-0">
        {title}
      </h2>
      
      {/* Mobile: Stack cards vertically with padding */}
      <div className="block sm:hidden space-y-4 px-4">
        {items.map((item, idx) => (
          <Link
            key={idx}
            to={item.link}
            className="block bg-white rounded-xl shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex gap-4 p-4">
              <div
                className="w-20 h-20 flex-shrink-0 bg-center bg-cover rounded-lg"
                style={{
                  backgroundImage: `url(${item.image || placeholder})`,
                  backgroundColor: "#f3f4f6",
                }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-800 mb-1 line-clamp-1">
                  {item.title}
                </h3>
                {item.company && (
                  <div className="text-xs text-gray-500 mb-1 line-clamp-1">
                    {item.company}
                    {item.location && <> · {item.location}</>}
                  </div>
                )}
                <p className="text-sm text-gray-500 line-clamp-2">
                  {item.desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Tablet and Desktop: Responsive grid that fills hero banner width */}
      <div className="hidden sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 lg:gap-3">
        {items.map((item, idx) => (
          <Link
            key={idx}
            to={item.link}
            className="bg-white rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex flex-col group w-full"
          >
            <div
              className="h-32 sm:h-36 lg:h-40 w-full bg-center bg-cover rounded-t-xl group-hover:brightness-105 transition-all duration-200"
              style={{
                backgroundImage: `url(${item.image || placeholder})`,
                backgroundColor: "#f3f4f6",
              }}
            />
            <div className="p-3 sm:p-4 flex flex-col flex-1">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-gray-900 transition-colors">
                {item.title}
              </h3>
              {item.company && (
                <div className="text-xs text-gray-500 mb-1 line-clamp-1">
                  {item.company}
                  {item.location && <> · {item.location}</>}
                </div>
              )}
              <p className="text-sm text-gray-500 line-clamp-2 group-hover:text-gray-600 transition-colors">
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Designer Spotlights - Mobile view with padding, desktop without padding
function SpotlightsSection({ items }) {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 sm:mt-6 lg:mt-10 mx-4 sm:mx-6 lg:mx-8">
      <h2 
        className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 cursor-pointer hover:text-gray-700 transition-colors px-4 sm:px-0"
        onClick={() => navigate('/spotlights')}
      >
        Instructional Designers Spotlight
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-6 px-4 sm:px-0">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center text-center hover:transform hover:scale-105 transition-transform cursor-pointer w-full"
            onClick={() => navigate('/spotlights')}
          >
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-full bg-center bg-cover mb-3 sm:mb-4 lg:mb-5 shadow-lg sm:shadow-xl border-2 sm:border-4 border-white"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-800 mb-1 sm:mb-2 line-clamp-2">
              {item.title}
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-500 line-clamp-3 px-2">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper for spotlight images (Supabase storage)
function getSpotlightImageUrl(path) {
  if (!path) return "https://placehold.co/400x200/eeeeee/cccccc?text=No+Image";
  const { data } = supabase.storage.from("spotlight-images").getPublicUrl(path);
  return data?.publicUrl || "https://placehold.co/400x200/eeeeee/cccccc?text=No+Image";
}

// Hides ugly scrollbars in Chrome/Edge
// Put this in your global CSS if you want to hide horizontal scrollbars for cards:
// .hide-scrollbar::-webkit-scrollbar { display: none; }
