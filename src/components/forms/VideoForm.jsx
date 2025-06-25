import React, { useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function VideoForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setThumbnailFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    let thumbnail_url = null;

    // 1. Upload thumbnail to Supabase Storage
    if (thumbnailFile) {
      const fileExt = thumbnailFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from("video-thumbnails")
        .upload(fileName, thumbnailFile);

      if (uploadError) {
        setError("Thumbnail upload failed: " + uploadError.message);
        return;
      }
      const { data: publicData } = supabase.storage.from("video-thumbnails").getPublicUrl(fileName);
      thumbnail_url = publicData.publicUrl;
    }

    // 2. Insert video row
    const { error: insertError } = await supabase.from("videos").insert([
      { ...formData, thumbnail_url }
    ]);

    if (insertError) setError(insertError.message);
    else {
      setFormData({ title: "", description: "", video_url: "" });
      setThumbnailFile(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Post New Video</h2>
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={formData.title}
        onChange={handleChange}
        className="w-full mb-4 px-4 py-2 border rounded"
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="w-full mb-4 px-4 py-2 border rounded"
        rows="3"
        required
      />
      <input
        type="text"
        name="video_url"
        placeholder="Video URL (YouTube, Vimeo, etc.)"
        value={formData.video_url}
        onChange={handleChange}
        className="w-full mb-4 px-4 py-2 border rounded"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full mb-4"
        required
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Post Video
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
