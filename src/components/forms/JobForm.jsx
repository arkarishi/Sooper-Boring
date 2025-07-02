import React, { useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function JobForm() {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleArrayChange = (field, value) => {
    setFormData({ ...formData, [field]: value.split("\n").filter(Boolean) });
  };

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
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Post a New Job</h2>
      <input
        type="text"
        name="title"
        placeholder="Job Title"
        value={formData.title}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-neutral-700 rounded bg-neutral-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
        required
      />
      <input
        type="text"
        name="company"
        placeholder="Company"
        value={formData.company}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-neutral-700 rounded bg-neutral-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
        required
      />
      <input
        type="text"
        name="location"
        placeholder="Location"
        value={formData.location}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-neutral-700 rounded bg-neutral-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
        required
      />
      <div>
        <label className="block font-medium text-gray-700 mb-1">Upload Company Logo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="w-full px-4 py-2 border border-neutral-700 rounded bg-neutral-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        {formData.image_url && (
          <img
            src={supabase.storage.from("job-images").getPublicUrl(formData.image_url).data.publicUrl}
            alt="Logo Preview"
            className="h-20 rounded mt-2 border bg-white object-contain"
          />
        )}
      </div>
      <textarea
        name="about"
        placeholder="About the job"
        value={formData.about}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-neutral-700 rounded bg-neutral-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
        required
        rows={2}
      />
      <textarea
        name="responsibilities"
        placeholder="Responsibilities (one per line)"
        value={formData.responsibilities.join('\n')}
        onChange={(e) => handleArrayChange('responsibilities', e.target.value)}
        className="w-full px-4 py-2 border border-neutral-700 rounded bg-neutral-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
        rows={2}
        required
      />
      <textarea
        name="qualifications"
        placeholder="Qualifications (one per line)"
        value={formData.qualifications.join('\n')}
        onChange={(e) => handleArrayChange('qualifications', e.target.value)}
        className="w-full px-4 py-2 border border-neutral-700 rounded bg-neutral-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
        rows={2}
        required
      />
      <textarea
        name="how_to_apply"
        placeholder="How to apply"
        value={formData.how_to_apply}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-neutral-700 rounded bg-neutral-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
        required
        rows={2}
      />
      <input
        type="text"
        name="apply_url"
        placeholder="Application Link or Email"
        value={formData.apply_url}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-neutral-700 rounded bg-neutral-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
        required
      />
      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
        Post Job
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
