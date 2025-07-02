import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const placeholderImg = "https://placehold.co/320x180/eeeeee/cccccc?text=No+Image";

const getImageUrl = (path) => {
  if (!path) return placeholderImg;
  const { data } = supabase.storage.from("job-images").getPublicUrl(path);
  return data?.publicUrl || placeholderImg;
};

function timeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "today";
  if (diff === 1) return "1 day ago";
  if (diff < 30) return `${diff} days ago`;
  const months = Math.floor(diff / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export default function Jobs({ search }) {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, [search]);

  const fetchJobs = async () => {
    let query = supabase.from("jobs").select("*").order("posted_at", { ascending: false });
    if (search && search.trim()) {
      query = query.ilike("title", `%${search}%`);
    }
    const { data } = await query;
    setJobs(data || []);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10" style={{ fontFamily: '"Newsreader", "Noto Sans", sans-serif' }}>
      <div className="max-w-6xl mx-auto px-0 sm:px-4">
        <div className="flex items-center mb-8 mt-12 gap-4">
          <h1 className="text-[2rem] font-extrabold text-black flex-1 text-left">
            Instructional Design Jobs
          </h1>
        </div>
        <div className="flex flex-col gap-2">
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              whileHover={{ backgroundColor: "#f6f6f6" }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
              className="flex items-center justify-between gap-8 cursor-pointer px-0 py-3 transition-all"
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              {/* Left: Logo */}
              <div
                className="w-16 h-16 min-w-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden bg-cover bg-center"
                style={{
                  backgroundImage: `url(${getImageUrl(job.image_url)})`,
                }}
              />
              {/* Middle: Job Info */}
              <div className="flex flex-col justify-center min-w-0 flex-1 ml-2">
                <span className="text-black text-base font-semibold font-serif leading-tight mb-0.5 truncate">
                  {job.title}
                </span>
                <span className="text-gray-500 text-sm mb-0.5">
                  Posted {job.posted_at ? timeAgo(new Date(job.posted_at)) : ""}
                </span>
                <span className="text-gray-700 text-sm font-normal">
                  {job.location}
                </span>
              </div>
              {/* Right: View Details Button */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  navigate(`/jobs/${job.id}`);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full px-5 py-2 font-medium shadow-none border-none transition"
              >
                View Details
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
