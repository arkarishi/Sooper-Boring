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

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, [search]);

  const fetchJobs = async () => {
    let query = supabase.from("jobs").select("*").order("posted_at", { ascending: false });
    if (search.trim()) {
      query = query.ilike("title", `%${search}%`);
    }
    const { data } = await query;
    setJobs(data || []);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10" style={{ fontFamily: '"Newsreader", "Noto Sans", sans-serif' }}>
      <div className="max-w-6xl mx-auto px-0 sm:px-4">
        <div className="flex items-center mb-8 mt-12 gap-4">
          <h1 className="text-[2rem] font-extrabold text-blue-900 flex-1 text-left">Instructional Design Jobs</h1>
          <input
            type="text"
            placeholder="Search jobs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg shadow bg-white text-gray-700 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex flex-col gap-2">
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              whileHover={{ y: -2, backgroundColor: "#f1f5f9" }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
              className="flex items-stretch justify-between gap-7 cursor-pointer p-4 rounded-xl transition-all"
              onClick={() => navigate(`/jobs/${job.id}`)}
              style={{ minHeight: 130 }}
            >
              {/* Left: Thumbnail */}
              <div
                className="w-[120px] min-w-[100px] aspect-video bg-center bg-no-repeat bg-cover rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{
                  backgroundImage: `url(${getImageUrl(job.image_url)})`,
                  height: 80,
                  maxHeight: 100,
                }}
              />
              {/* Right: Text */}
              <div className="flex flex-col justify-center flex-[2.2_2.2_0px] min-w-0 pr-4">
                <p className="text-[#0d141c] text-base font-bold leading-tight mb-1 truncate">
                  {job.title}
                </p>
                <p className="text-[#49719c] text-sm font-normal leading-normal mb-2 truncate">
                  {job.company} — {job.location}
                </p>
                <p className="text-gray-600 text-sm truncate">{job.about}</p>
                <span className="text-xs text-gray-400 mt-2">
                  {job.posted_at && new Date(job.posted_at).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
