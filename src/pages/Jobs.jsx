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
      <div className="max-w-6xl mx-auto px-4 sm:px-4">
        <div className="flex items-center mb-6 sm:mb-8 mt-8 sm:mt-12 gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold text-black flex-1 text-left">
            Instructional Design Jobs
          </h1>
        </div>
        
        <div className="flex flex-col gap-4 sm:gap-6">
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              whileHover={{ backgroundColor: "#f6f6f6" }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
              className="cursor-pointer transition-all"
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              {/* Desktop/Laptop View - Horizontal Layout */}
              <div className="hidden lg:flex items-center justify-between gap-8 px-0 py-3">
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
              </div>

              {/* Mobile/Tablet View - Card Layout */}
              <div className="lg:hidden bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {/* Content */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    {/* Company Logo */}
                    <div
                      className="w-12 h-12 sm:w-16 sm:h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden bg-cover bg-center flex-shrink-0"
                      style={{
                        backgroundImage: `url(${getImageUrl(job.image_url)})`,
                      }}
                    />
                    {/* Job Info */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 font-serif leading-tight">
                        {job.title}
                      </h3>
                      <p className="text-blue-600 text-sm sm:text-base font-semibold mb-2">
                        {job.company}
                      </p>
                      
                      {/* Location - Separate line with truncation */}
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 mb-1 w-full overflow-hidden">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate flex-1 min-w-0">{job.location}</span>
                      </div>
                      
                      {/* Posted Date - Separate line */}
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 mb-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Posted {job.posted_at ? timeAgo(new Date(job.posted_at)) : ""}</span>
                      </div>
                      
                      {/* Job Type Tag */}
                      {job.job_type && (
                        <div className="mb-3">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                            {job.job_type}
                          </span>
                        </div>
                      )}
                      
                      {/* Job Description Preview */}
                      {job.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>
                      )}
                      
                      {/* Skills/Tags */}
                      {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="text-gray-500 text-xs px-2 py-1">
                              +{job.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* View Details Button */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/jobs/${job.id}`);
                        }}
                        className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full px-5 py-2 shadow-none border-none transition"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
