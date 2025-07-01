import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { ArrowLeft } from "lucide-react";

// Helper: Get public image from Supabase Storage
const getImageUrl = (path) => {
  if (!path) return "https://placehold.co/900x350/eeeeee/cccccc?text=No+Image";
  const { data } = supabase.storage.from("job-images").getPublicUrl(path);
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-14 px-2 sm:px-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-blue-700 hover:underline"
      >
        <ArrowLeft size={22} /> Back to Jobs
      </button>
      <div className="max-w-5xl sm:max-w-6xl mx-auto bg-white p-0 sm:p-16 p-4 rounded-3xl shadow-2xl border border-neutral-200 transition-all duration-300">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{job.title}</h1>
        <div className="mb-4 text-lg text-gray-700 font-semibold">
          {job.company} {job.location && <span className="text-gray-400 text-base ml-2">• {job.location}</span>}
        </div>
        <div className="mb-6 text-gray-400 text-base">
          {job.posted_at && new Date(job.posted_at).toLocaleDateString()}
        </div>
        <img
          src={getImageUrl(job.image_url)}
          alt={job.title}
          className="rounded-2xl mb-10 w-full max-h-[320px] object-contain border"
        />
        <div className="mb-6">
          <span className="block font-semibold mb-1 text-lg">About the job</span>
          <p className="text-gray-700">{job.about}</p>
        </div>
        {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
          <div className="mb-6">
            <span className="block font-semibold mb-1 text-base bg-blue-100 text-blue-900 px-2 py-1 rounded inline-block">
              Responsibilities:
            </span>
            <ul className="list-disc list-inside text-gray-700 mt-2">
              {job.responsibilities.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {Array.isArray(job.qualifications) && job.qualifications.length > 0 && (
          <div className="mb-6">
            <span className="block font-semibold mb-1 text-base bg-blue-100 text-blue-900 px-2 py-1 rounded inline-block">
              Qualifications:
            </span>
            <ul className="list-disc list-inside text-gray-700 mt-2">
              {job.qualifications.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {job.how_to_apply && (
          <div className="mb-4">
            <span className="block font-semibold mb-1 text-base bg-blue-100 text-blue-900 px-2 py-1 rounded inline-block">How to Apply:</span>
            <div className="text-gray-700">{job.how_to_apply}</div>
          </div>
        )}
        {job.apply_url && (
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-medium transition"
          >
            Apply Now
          </a>
        )}
      </div>
    </div>
  );
}
