import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { ArrowLeft } from "lucide-react";

// Helper: Get public image from Supabase Storage
const getImageUrl = (job) => {
  if (!job || !job.image_url) return "https://placehold.co/900x350/eeeeee/cccccc?text=No+Image";
  
  // Handle full HTTP URLs
  if (job.image_url.startsWith('http')) {
    return job.image_url;
  }
  
  // Handle Supabase storage paths
  const { data } = supabase.storage.from("job-images").getPublicUrl(job.image_url);
  return data?.publicUrl || "https://placehold.co/900x350/eeeeee/cccccc?text=No+Image";
};

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  useEffect(() => {
    async function fetchJob() {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();
      setJob(data);
    }
    fetchJob();
  }, [id]);

  if (!job)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-50 py-14 px-2 sm:px-4" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex flex-wrap gap-2 mb-4 px-2">
          <span
            className="text-neutral-500 text-base font-medium leading-normal cursor-pointer hover:underline"
            onClick={() => navigate("/jobs")}
          >
            Jobs
          </span>
          <span className="text-neutral-500 text-base font-medium leading-normal">/</span>
          <span className="text-[#141414] text-base font-medium leading-normal">{job.title}</span>
        </div>
        {/* Title & Company */}
        <div className="flex flex-wrap justify-between gap-3 px-2">
          <div className="flex min-w-72 flex-col gap-3">
            <h1 className="text-[#141414] text-[2rem] font-bold leading-tight">{job.title}</h1>
            <p className="text-neutral-500 text-sm font-normal leading-normal">
              {job.company}
              {job.location && <> · {job.location}</>}
            </p>
          </div>
        </div>
        {/* Image */}
        <div className="w-full aspect-[3/2] rounded-xl overflow-hidden flex">
          <img
            src={getImageUrl(job)}
            alt={job.title}
            className="w-full h-full object-contain rounded-xl bg-white"
            onError={(e) => {
              e.target.src = "https://placehold.co/900x350/eeeeee/cccccc?text=No+Image";
            }}
          />
        </div>
        {/* About the job */}
        <h2 className="text-[#141414] text-[22px] font-bold leading-tight tracking-[-0.015em] px-2 pb-3 pt-5">About the job</h2>
        <p className="text-[#141414] text-base font-normal leading-normal pb-3 pt-1 px-2">
          {job.about}
        </p>
        {/* Responsibilities */}
        {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
          <>
            <h2 className="text-[#141414] text-[22px] font-bold leading-tight tracking-[-0.015em] px-2 pb-3 pt-5">Responsibilities</h2>
            <div className="px-2">
              {job.responsibilities.map((item, idx) => (
                <label key={idx} className="flex gap-x-3 py-3 flex-row">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-[#dbdbdb] border-2 bg-transparent text-black checked:bg-black checked:border-black focus:ring-0 focus:ring-offset-0 focus:border-[#dbdbdb] focus:outline-none"
                    disabled
                  />
                  <p className="text-[#141414] text-base font-normal leading-normal">{item}</p>
                </label>
              ))}
            </div>
          </>
        )}
        {/* Qualifications */}
        {Array.isArray(job.qualifications) && job.qualifications.length > 0 && (
          <>
            <h2 className="text-[#141414] text-[22px] font-bold leading-tight tracking-[-0.015em] px-2 pb-3 pt-5">Qualifications</h2>
            <div className="px-2">
              {job.qualifications.map((item, idx) => (
                <label key={idx} className="flex gap-x-3 py-3 flex-row">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-[#dbdbdb] border-2 bg-transparent text-black checked:bg-black checked:border-black focus:ring-0 focus:ring-offset-0 focus:border-[#dbdbdb] focus:outline-none"
                    disabled
                  />
                  <p className="text-[#141414] text-base font-normal leading-normal">{item}</p>
                </label>
              ))}
            </div>
          </>
        )}
        {/* How to Apply */}
        {job.how_to_apply && (
          <>
            <h2 className="text-[#141414] text-[22px] font-bold leading-tight tracking-[-0.015em] px-2 pb-3 pt-5">How to Apply</h2>
            <p className="text-[#141414] text-base font-normal leading-normal pb-3 pt-1 px-2">
              {job.how_to_apply}
            </p>
          </>
        )}
        {/* Apply Button */}
        {job.apply_url && (
          <div className="flex px-2 py-3 justify-start">
            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-black text-neutral-50 text-sm font-bold leading-normal tracking-[0.015em]"
            >
              <span className="truncate">Apply Now</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
