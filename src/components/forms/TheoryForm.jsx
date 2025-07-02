import React, { useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function TheoryForm() {
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
  const [uploading, setUploading] = useState(false);

  const inputClass =
    "w-full px-4 py-2 border border-neutral-700 rounded bg-neutral-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-3";

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("theory-images")
      .upload(fileName, file);
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }
    setFormData((prev) => ({ ...prev, image_url: fileName }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      ...formData,
      principles: formData.principles.split('\n').map(x => x.trim()).filter(Boolean),
      applications: formData.applications.split('\n').map(x => x.trim()).filter(Boolean),
      examples: formData.examples.split('\n').map(x => x.trim()).filter(Boolean),
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
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-2 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Post a New Theory</h2>
      <input
        type="text"
        name="title"
        placeholder="Theory Title"
        value={formData.title}
        onChange={handleChange}
        className={inputClass}
        required
      />
      <input
        type="text"
        name="subtitle"
        placeholder="Subtitle (optional)"
        value={formData.subtitle}
        onChange={handleChange}
        className={inputClass}
      />
      <textarea
        name="intro"
        placeholder="Short Introduction / Summary"
        value={formData.intro}
        onChange={handleChange}
        className={inputClass}
        required
        rows={2}
      />
      <textarea
        name="principles"
        placeholder="Principles (one per line)"
        value={formData.principles}
        onChange={handleChange}
        className={inputClass}
        rows={2}
      />
      <textarea
        name="applications"
        placeholder="Applications (one per line)"
        value={formData.applications}
        onChange={handleChange}
        className={inputClass}
        rows={2}
      />
      <textarea
        name="examples"
        placeholder="Examples (one per line)"
        value={formData.examples}
        onChange={handleChange}
        className={inputClass}
        rows={2}
      />
      <div>
        <label className="block font-medium text-gray-700 mb-1">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className={inputClass}
          disabled={uploading}
        />
        {uploading && <div className="text-blue-600 mt-1 text-sm">Uploading...</div>}
        {formData.image_url && (
          <img
            src={supabase.storage.from("theory-images").getPublicUrl(formData.image_url).data.publicUrl}
            alt="Preview"
            className="h-24 rounded mt-2 border bg-white object-contain"
          />
        )}
      </div>
      <button
        type="submit"
        className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded"
        disabled={uploading}
      >
        Post Theory
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
