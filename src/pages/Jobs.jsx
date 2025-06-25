import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

// Helper to get public image URL from Supabase Storage
const getImageUrl = (path) => {
  if (!path) return "";
  const { data } = supabase.storage.from("job-images").getPublicUrl(path);
  return data?.publicUrl || "";
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    image_url: "",
    about: "",
    responsibilities: [],
    qualifications: [],
    how_to_apply: "",
    apply_url: "",
    posted_at: new Date().toISOString(),
  });
  const [logoFile, setLogoFile] = useState(null);
  const [error, setError] = useState(null);

  // Fetch auth session for showing form
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Fetch jobs
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("posted_at", { ascending: false });
    if (error) {
      alert("Failed to load jobs: " + error.message);
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  };

  const handleToggle = (id) => setExpandedId(expandedId === id ? null : id);

  // Input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  // For array fields (textarea, one item per line)
  const handleArrayChange = (field, value) => {
    setFormData({ ...formData, [field]: value.split("\n").filter(Boolean) });
  };

  // Logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("job-images")
      .upload(fileName, file);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }
    setFormData((prev) => ({ ...prev, image_url: fileName }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const { error: insertError } = await supabase.from("jobs").insert([formData]);
    if (insertError) setError(insertError.message);
    else {
      setFormData({
        title: "",
        company: "",
        location: "",
        image_url: "",
        about: "",
        responsibilities: [],
        qualifications: [],
        how_to_apply: "",
        apply_url: "",
        posted_at: new Date().toISOString(),
      });
      setLogoFile(null);
      fetchJobs();
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-2">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Instructional Design Jobs</h1>
      
      {/* --- POST JOB FORM (only for logged-in) --- */}
      {session && (
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto mb-10 bg-white p-6 rounded-lg shadow"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Post a New Job</h2>
          <input
            type="text"
            name="title"
            placeholder="Job Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full mb-3 px-4 py-2 border rounded"
            required
          />
          <input
            type="text"
            name="company"
            placeholder="Company"
            value={formData.company}
            onChange={handleChange}
            className="w-full mb-3 px-4 py-2 border rounded"
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full mb-3 px-4 py-2 border rounded"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="w-full mb-3"
          />
          <textarea
            name="about"
            placeholder="About the job"
            value={formData.about}
            onChange={handleChange}
            className="w-full mb-3 px-4 py-2 border rounded"
            required
            rows={2}
          />
          <textarea
            name="responsibilities"
            placeholder="Responsibilities (one per line)"
            value={formData.responsibilities.join('\n')}
            onChange={(e) => handleArrayChange('responsibilities', e.target.value)}
            className="w-full mb-3 px-4 py-2 border rounded"
            rows={2}
            required
          />
          <textarea
            name="qualifications"
            placeholder="Qualifications (one per line)"
            value={formData.qualifications.join('\n')}
            onChange={(e) => handleArrayChange('qualifications', e.target.value)}
            className="w-full mb-3 px-4 py-2 border rounded"
            rows={2}
            required
          />
          <textarea
            name="how_to_apply"
            placeholder="How to apply"
            value={formData.how_to_apply}
            onChange={handleChange}
            className="w-full mb-3 px-4 py-2 border rounded"
            required
            rows={2}
          />
          <input
            type="text"
            name="apply_url"
            placeholder="Application Link or Email"
            value={formData.apply_url}
            onChange={handleChange}
            className="w-full mb-3 px-4 py-2 border rounded"
            required
          />
          <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded">
            Post Job
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      )}

      {/* --- JOB LIST & DETAILS --- */}
      {loading ? (
        <div className="text-center py-12">Loading jobs...</div>
      ) : (
        <div className="flex flex-col gap-6">
          {jobs.length === 0 && <div className="text-center text-gray-400">No jobs found.</div>}
          {jobs.map((job) => (
            <div key={job.id} className="rounded-2xl shadow-md border bg-white hover:shadow-xl transition">
              <button
                onClick={() => handleToggle(job.id)}
                className="w-full text-left p-5 focus:outline-none flex items-center gap-4"
              >
                {job.image_url && (
                  <img
                    src={getImageUrl(job.image_url)}
                    alt={job.company || "Logo"}
                    className="w-14 h-14 object-contain rounded-lg border bg-neutral-100"
                  />
                )}
                <div className="flex-1">
                  <div className="font-semibold text-xl">{job.title}</div>
                  <div className="text-sm text-gray-500">
                    {job.company} &bull; {job.location}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Posted {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : "Recently"}
                  </div>
                </div>
                <svg
                  className={`w-6 h-6 ml-3 transform transition-transform ${expandedId === job.id ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedId === job.id && (
                <div className="border-t px-6 pb-6 pt-3">
                  <div className="mb-4">
                    <span className="block font-semibold mb-1 text-lg">About the job</span>
                    <p className="text-gray-700">{job.about}</p>
                  </div>
                  {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
                    <div className="mb-4">
                      <span className="block font-semibold mb-1">Responsibilities:</span>
                      <ul className="list-disc list-inside text-gray-700">
                        {job.responsibilities.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(job.qualifications) && job.qualifications.length > 0 && (
                    <div className="mb-4">
                      <span className="block font-semibold mb-1">Qualifications:</span>
                      <ul className="list-disc list-inside text-gray-700">
                        {job.qualifications.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {job.how_to_apply && (
                    <div className="mb-4">
                      <span className="block font-semibold mb-1">How to Apply:</span>
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
