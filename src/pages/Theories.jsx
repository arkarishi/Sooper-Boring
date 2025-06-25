import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

// Helper to get public image URL from Supabase Storage
const getImageUrl = (path) => {
  if (!path) return "";
  const { data } = supabase.storage.from("theory-images").getPublicUrl(path);
  return data?.publicUrl || "";
};

const PAGE_SIZE = 8;

export default function Theories() {
  const [theories, setTheories] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // --- FORM state
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    intro: "",
    principles: "",
    applications: "",
    examples: "",
    image_url: "",
    created_at: new Date().toISOString(),
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);

  // Get session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Fetch paginated theories
  useEffect(() => {
    fetchTheories();
    // eslint-disable-next-line
  }, [page]);

  const fetchTheories = async () => {
    setLoading(true);
    // Get total count for pagination
    const { count } = await supabase
      .from("theories")
      .select("*", { count: "exact", head: true });

    setTotal(count || 0);

    // Fetch current page
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("theories")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) alert("Failed to load theories: " + error.message);
    else setTheories(data || []);

    setLoading(false);
  };

  const handleToggle = (id) => setExpandedId(expandedId === id ? null : id);

  // Form input change
  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("theory-images")
      .upload(fileName, file);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }
    setFormData((prev) => ({ ...prev, image_url: fileName }));
  };

  // Submit theory with array field fix
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      ...formData,
      principles: formData.principles.split('\n').map(x=>x.trim()).filter(Boolean),
      applications: formData.applications.split('\n').map(x=>x.trim()).filter(Boolean),
      examples: formData.examples.split('\n').map(x=>x.trim()).filter(Boolean),
    };

    const { error: insertError } = await supabase.from("theories").insert([payload]);
    if (insertError) setError(insertError.message);
    else {
      setFormData({
        title: "",
        subtitle: "",
        intro: "",
        principles: "",
        applications: "",
        examples: "",
        image_url: "",
        created_at: new Date().toISOString(),
      });
      setImageFile(null);
      fetchTheories();
    }
  };

  // Pagination UI
  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-4xl mx-auto py-8 px-2">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">Instructional Design Theories</h1>
      
      {/* --- FORM: Only for logged-in users --- */}
      {session && (
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto mb-10 bg-white p-6 rounded-lg shadow"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Post a New Theory</h2>
          <input
            type="text"
            name="title"
            placeholder="Theory Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full mb-3 px-4 py-2 border rounded"
            required
          />
          <input
            type="text"
            name="subtitle"
            placeholder="Subtitle (optional)"
            value={formData.subtitle}
            onChange={handleChange}
            className="w-full mb-3 px-4 py-2 border rounded"
          />
          <textarea
            name="intro"
            placeholder="Short Introduction / Summary"
            value={formData.intro}
            onChange={handleChange}
            className="w-full mb-3 px-4 py-2 border rounded"
            required
            rows={2}
          />
          <textarea
            name="principles"
            placeholder="Principles (one per line)"
            value={formData.principles}
            onChange={handleChange}
            className="w-full mb-3 px-4 py-2 border rounded"
            rows={2}
          />
          <textarea
            name="applications"
            placeholder="Applications (one per line)"
            value={formData.applications}
            onChange={handleChange}
            className="w-full mb-3 px-4 py-2 border rounded"
            rows={2}
          />
          <textarea
            name="examples"
            placeholder="Examples (one per line)"
            value={formData.examples}
            onChange={handleChange}
            className="w-full mb-3 px-4 py-2 border rounded"
            rows={2}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full mb-3"
          />
          <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded">
            Post Theory
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      )}

      {/* --- THEORY LIST --- */}
      {loading ? (
        <div className="text-center py-12">Loading theories...</div>
      ) : (
        <div className="flex flex-col gap-7">
          {theories.length === 0 && <div className="text-center text-gray-400">No theories found.</div>}
          {theories.map((theory) => (
            <div
              key={theory.id}
              className="flex flex-col md:flex-row items-stretch justify-between gap-5 rounded-xl shadow bg-white p-4 hover:shadow-lg transition"
            >
              {/* Info section */}
              <div className="flex-[2_2_0px] flex flex-col gap-2">
                <div className="font-bold text-lg text-gray-800">{theory.title}</div>
                {theory.subtitle && (
                  <div className="text-base text-gray-500 mb-1">{theory.subtitle}</div>
                )}
                <div className="text-sm text-blue-900">
                  {theory.intro}
                </div>
                <button
                  className="mt-2 bg-neutral-100 text-blue-900 rounded-full px-4 py-2 text-sm font-medium w-fit transition hover:bg-blue-50"
                  onClick={() => handleToggle(theory.id)}
                >
                  {expandedId === theory.id ? "Hide Details" : "Read More"}
                </button>
                {/* Expanded details as bullet lists */}
                {expandedId === theory.id && (
                  <div className="mt-4 text-sm text-gray-800 space-y-4">
                    {Array.isArray(theory.principles) && theory.principles.length > 0 && (
                      <div>
                        <div className="font-semibold mb-1">Principles:</div>
                        <ul className="list-disc list-inside">
                          {theory.principles.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {Array.isArray(theory.applications) && theory.applications.length > 0 && (
                      <div>
                        <div className="font-semibold mb-1">Applications:</div>
                        <ul className="list-disc list-inside">
                          {theory.applications.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {Array.isArray(theory.examples) && theory.examples.length > 0 && (
                      <div>
                        <div className="font-semibold mb-1">Examples:</div>
                        <ul className="list-disc list-inside">
                          {theory.examples.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Image section */}
              <div className="flex-1 min-w-[160px] max-w-[220px] flex items-center justify-center">
                {theory.image_url ? (
                  <img
                    src={getImageUrl(theory.image_url)}
                    alt={theory.title}
                    className="rounded-xl aspect-video object-cover w-full bg-neutral-100"
                  />
                ) : (
                  <div className="rounded-xl bg-neutral-200 aspect-video w-full flex items-center justify-center text-neutral-400">
                    No Image
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- PAGINATION --- */}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="size-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-blue-100"
            disabled={page === 1}
          >
            &lt;
          </button>
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              className={`size-8 flex items-center justify-center rounded-full ${
                page === i + 1 ? "bg-blue-100 font-bold" : "bg-neutral-100"
              }`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(p + 1, pageCount))}
            className="size-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-blue-100"
            disabled={page === pageCount}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}
