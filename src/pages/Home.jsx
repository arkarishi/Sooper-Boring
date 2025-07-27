import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

// Import floating images
import float1 from '../assets/images/floating/float1.png';

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

// Enhanced Hero banner with carousel functionality
function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      backgroundImage: "linear-gradient(rgba(0,0,0,0.1),rgba(0,0,0,0.4)), url('/images/floating/f1.png')",
      title: "Design Theories",
      description: "Explore the world of design theories. We provide in-depth articles, videos, and resources to help you master the art of effective design.",
      buttonText: "Explore Articles",
      buttonLink: "/articles"
    },
    {
      backgroundImage: "linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.5)), url('/images/floating/f2.png')",
      title: "Learning Theories & Frameworks",
      description: "Dive deep into foundational frameworks that shape modern design practices.",
      buttonText: "View Theories",
      buttonLink: "/theories"
    },
    {
      backgroundImage: "linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.5)), url('/images/floating/f3.png')",
      title: "Video Learning Resources",
      description: "Watch expert insights and practical tutorials on design methodologies, tools, and best practices.",
      buttonText: "Watch Videos",
      buttonLink: "/videos"
    },
    {
      backgroundImage: "linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.5)), url('/images/floating/f1.png')",
      title: "Career Opportunities",
      description: "Discover exciting job opportunities in design and educational technology from leading organizations.",
      buttonText: "Browse Jobs",
      buttonLink: "/jobs"
    }
  ]

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto mt-2 sm:mt-4 lg:mt-6 px-2 sm:px-4 lg:px-6">
      <div className="relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg lg:shadow-xl">
        {/* Slides Container */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 flex flex-col justify-center items-start text-left min-h-[200px] xs:min-h-[240px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[360px] xl:min-h-[400px] px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 xs:py-5 sm:py-6 md:py-8 lg:py-10 bg-cover bg-center relative overflow-hidden"
              style={{ backgroundImage: slide.backgroundImage }}
            >
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-black bg-opacity-20 sm:bg-opacity-10"></div>

              {/* Main content - Left Aligned */}
              <div className="relative z-10 max-w-full sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl ml-0 sm:ml-2 md:ml-2 lg:ml-2 xl:ml-2 mt-8 sm:mt-12 md:mt-16 lg:mt-20 xl:mt-24">
                <h1 className="text-white text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold sm:font-extrabold mb-2 xs:mb-3 sm:mb-4 lg:mb-5 xl:mb-6 drop-shadow-lg leading-tight">
                  {slide.title}
                </h1>
                <p className="text-white text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl mb-3 xs:mb-4 sm:mb-5 lg:mb-6 xl:mb-7 drop-shadow-lg leading-relaxed opacity-95">
                  {slide.description}
                </p>
                <Link
                  to={slide.buttonLink}
                  className="inline-block bg-black text-white rounded-full px-3 xs:px-4 sm:px-5 md:px-6 lg:px-7 xl:px-8 py-1.5 xs:py-2 sm:py-2.5 md:py-3 lg:py-3.5 text-xs xs:text-sm sm:text-base md:text-lg font-semibold sm:font-bold shadow-lg hover:bg-gray-800 hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1.5 sm:p-2 rounded-full transition-all duration-200 z-30 shadow-lg hover:shadow-xl"
          aria-label="Previous slide"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1.5 sm:p-2 rounded-full transition-all duration-200 z-30 shadow-lg hover:shadow-xl"
          aria-label="Next slide"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentSlide ? 'bg-white shadow-md' : 'bg-white/50 hover:bg-white/75'
                }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>



      </div>
    </div>
  );
}

// Floating Images Component
function FloatingImages() {


  return (
    <>
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute opacity-20 hover:opacity-40 transition-all duration-500 hidden lg:block ${image.className}`}
          style={image.style}
        >
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover rounded-full shadow-lg animate-float"
          />
        </div>
      ))}
    </>
  );
}

// Generic Section for Cards - Mobile view with padding, desktop without padding
function SectionCards({ title, items }) {
  const placeholder = "https://placehold.co/400x200/eeeeee/cccccc?text=No+Image";
  const navigate = useNavigate();

  // Map section titles to their routes
  const getRouteFromTitle = (title) => {
    switch (title.toLowerCase()) {
      case 'latest articles':
        return '/articles';
      case 'theories':
        return '/theories';
      case 'videos':
        return '/videos';
      case 'jobs':
        return '/jobs';
      default:
        return '/';
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto mt-2 sm:mt-4 lg:mt-6 px-2 sm:px-4 lg:px-6">
      <h2
        className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 cursor-pointer hover:text-gray-700 transition-colors"
        onClick={() => navigate(getRouteFromTitle(title))}
      >
        {title}
      </h2>

      {/* Mobile: Stack cards vertically with transparent background */}
      <div className="block sm:hidden space-y-4">
        {items.map((item, idx) => (
          <Link
            key={idx}
            to={item.link}
            className="block bg-transparent rounded-xl hover:bg-gray-100 hover:bg-opacity-30 transition-all"
          >
            <div className="flex gap-4 p-4">
              <div
                //className="w-20 h-20 flex-shrink-0 bg-center bg-cover rounded-lg shadow-md"
                //className="w-full max-w-md aspect-[5/3] bg-center bg-cover rounded-lg shadow-md"
                className="w-[500px] h-[300px] bg-center bg-cover rounded-lg shadow-md"
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

      {/* Tablet and Desktop: Responsive grid with transparent cards */}
      <div className="hidden sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 lg:gap-3">
        {items.map((item, idx) => (
          <Link
            key={idx}
            to={item.link}
            className="bg-transparent rounded-xl hover:bg-gray-100 hover:bg-opacity-20 hover:scale-[1.02] transition-all duration-200 flex flex-col group w-full"
          >
            <div
              className="h-32 sm:h-36 lg:h-40 w-full bg-center bg-cover rounded-xl group-hover:brightness-105 transition-all duration-200 shadow-md"
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

// Designer Spotlights - Route individual cards to detail pages
function SpotlightsSection({ items }) {
  const navigate = useNavigate();

  return (
    <div className="relative w-full max-w-6xl mx-auto mt-2 sm:mt-4 lg:mt-6 px-2 sm:px-4 lg:px-6">
      <h2
        className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 cursor-pointer hover:text-gray-700 transition-colors"
        onClick={() => navigate('/spotlights')}
      >
       Spotlight
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-6">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center text-center hover:transform hover:scale-105 transition-transform cursor-pointer w-full"
            onClick={() => navigate(item.link)}
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
