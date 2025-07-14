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
  const [spotlights] = useState([
    {
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCIl_4bMjvEIH6o_-ry3E-wF0b5Tgeeqi2FRmDj9k1Ic0gWy6D0R1UQ6VmAOZBfigF7rFrJi9L_0PbHWUGPyS3JyHUTf0MgAzNE1xasJGQd5ECfnvRXrwgf5phyzqe2sxBNJDlRwrb8hP-GhM5o7Dn-wWGoFujlFe3zfO27rxnbyGA_Wpbqkzj8Gc4Y-8BRKmGNrrSI57glhQuznyl2eUxGHCGOfBf4FtX3xSxgI_o9ANnosrJaBvdVvc-0lirlB_6DhfhHLc16Pw",
      title: "Dr. Amelia Bennett",
      desc: "A leading expert in cognitive load theory and instructional design.",
      link: "#",
    },
    {
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA5-_sxUNnBD2f41TAojgF6jj9Vi8oOaDCW9vykQWVCmngExSlk_Adgs2Py820BQ481bR10Wf14BzXEJUXwepODbPeFBlqUkDayoqES191S2DYAVMJDaSb3scTAO0ujTz2Xn4z76vOH33WlitFjaJkFGdVqECgpoBjl-PiNtAcjanT7Dpfp6waMfsrDFd1A70CIHaDhs4qaGd74TFS5EEBaM98TsjbdZq9dzaIgYTvrRevdVAQtU_8dHfTtO-2Luv2tfcOKnTLQAA",
      title: "Ethan Harper",
      desc: "An experienced e-learning developer and learning experience designer.",
      link: "#",
    },
    {
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCcSSKY-mCERXHqYf-_lSBq20UfwAur5qKHnXQ1_18q1Pp1OG8YoZphLoDa6y4772TUDGsTn3nvULB16-Yfmo9gso3E2cWt3zC9WSobsSS-tNWBghmUjZxIwvIOO76D1c3mOXeUg8nOJPd7-tsUf6qYjUA3z-4Z26BN5e0hVRxCPJvoXr_UxNM8m3arw1qG64lljXxjYg3riB0NleM88x3WAVKzix1smOOkFBuPHPv2bIXtURVrGuuIyQLQUNJwD345OeyOg0QBNQ",
      title: "Olivia Bennett",
      desc: "A renowned instructional designer specializing in corporate training.",
      link: "#",
    },
    {
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBBnRaDmpfQsAbVmi2w4sHE6g0RWLjc4TUU4w8fMTj-I51H3zx44GlXVczJmc8QJvrgjE2I2M987hvFKb1EEsZdEzZhbdgJeEp0kx5RmSLr4ggcjlj7j-UHKDnGP_rIMwUhwNTGkR_RtD5788EW8mDPkCPlaPSEh2ktEdz0-jTAvLSH_KXFEeLcvKgPMOiLFS_fTYpruFRcykDughHJuGqVKYs0y8I6Tp-wIQ_M4gg7Xu0ATF3obDdu7zEZif9OHAiD18VTHqXYdA",
      title: "Owen Carter",
      desc: "A creative instructional designer with a focus on gamification.",
      link: "#",
    },
  ]);

  useEffect(() => {
    fetchLatestArticles();
    fetchLatestTheories();
    fetchLatestVideos();
    fetchLatestJobs();
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

  return (
    <section className="min-h-screen w-screen w-full bg-neutral-50 flex flex-col items-center font-[Newsreader,sans-serif] pb-20">
      <HeroBanner />
      <SectionCards title="Latest Articles" items={latestArticles} />
      <SectionCards title="Theories" items={theories} />
      <SectionCards title="Videos" items={videos} /> {/* <-- Videos column */}
      <SectionCards title="Jobs" items={jobs} />
      <SpotlightsSection items={spotlights} />
    </section>
  );
}

// Hero banner (unchanged)
function HeroBanner() {
  return (
    <div
      className="w-full flex flex-col items-start justify-end min-h-[380px] max-w-5xl mx-auto mt-10 px-8 py-8 rounded-xl bg-cover bg-center shadow"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.1),rgba(0,0,0,0.4)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-tR9rmSDwI7QaAQdo4o4Tob0QnLHMLEE4UNyH0pCllrN5BKsfo7GMoQOCUBPl6eMpfl0Ag5EY4QGJm3hbXOI0HimqTp9EDJk23145L5pgg4CwgvooBzmskDiyAnyaUjb3iJVQr5owXa3ZoI7ji_B7Tl3WIU_OY3ew7ORrbG-6dlMI0Y_10a8lzCOoml_uZnrGPBnSrGYygdW0X5tM35qMhNczeyqbZnvUtuw7SmRT1qDuylHkIw4DWObEWZ_kHNlh3r_hLkWDGw')",
      }}
    >
      <h1 className="text-white text-4xl md:text-5xl font-extrabold mb-2 drop-shadow-lg">
        Instructional Design Theories
      </h1>
      <p className="text-white text-base md:text-lg mb-6 drop-shadow-lg max-w-xl">
        Explore the world of instructional design theories with Sooper Boring. We provide in-depth articles, videos, and resources to help you master the art of effective learning design.
      </p>
      <Link
        to="/articles"
        className="bg-black text-white rounded-full px-6 py-3 font-bold shadow hover:bg-neutral-800"
      >
        Explore Articles
      </Link>
    </div>
  );
}

// Generic Section for Cards (scrollable horizontally)
function SectionCards({ title, items }) {
  const placeholder =
    "https://placehold.co/400x200/eeeeee/cccccc?text=No+Image";
  return (
    <div className="w-full max-w-5xl mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 px-2">{title}</h2>
      <div className="flex gap-6 overflow-x-auto px-2 pb-2 hide-scrollbar">
        {items.map((item, idx) => (
          <Link
            key={idx}
            to={item.link}
            className="w-[320px] flex-shrink-0 bg-white rounded-xl shadow flex flex-col hover:scale-105 transition-transform"
            style={{ maxHeight: 340 }}
          >
            <div
              className="h-40 w-full bg-center bg-cover rounded-t-xl"
              style={{
                backgroundImage: `url(${item.image || placeholder})`,
                backgroundColor: "#f3f4f6",
              }}
            />
            <div className="p-4 flex flex-col flex-1">
              {/* Title: always 1 line */}
              <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
                {item.title}
              </h3>
              {/* Company and location: always 1 line, only for jobs */}
              {item.company && (
                <div className="text-xs text-gray-500 mb-1 truncate">
                  {item.company}
                  {item.location && <> · {item.location}</>}
                </div>
              )}
              {/* Description: always 2 lines */}
              <p className="text-sm text-gray-500 line-clamp-2">
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Designer Spotlights - Circular cards (modified)
function SpotlightsSection({ items }) {
  return (
    <div className="w-full max-w-5xl mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 px-2">Instructional Designers Spotlight</h2>
      <div className="flex gap-8 sm:gap-12 md:gap-14 overflow-x-auto px-2 pb-2 hide-scrollbar">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center"
            style={{ minWidth: 180, maxWidth: 220 }}
          >
            <div
              className="w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 rounded-full bg-center bg-cover mb-4 sm:mb-6 shadow-xl border-4 border-white"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 text-center">{item.title}</h3>
            <p className="text-sm sm:text-base text-gray-500 text-center">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hides ugly scrollbars in Chrome/Edge
// Put this in your global CSS if you want to hide horizontal scrollbars for cards:
// .hide-scrollbar::-webkit-scrollbar { display: none; }
