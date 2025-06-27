import React, { useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function VideoForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState("file"); // "file" or "link"

  // Use same input style as ArticleForm!
  const inputClass =
    "w-full px-4 py-2 border border-neutral-700 rounded bg-neutral-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setVideoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let video_url = formData.video_url;

    // If local file, upload to Supabase Storage
    if (uploadType === "file" && videoFile) {
      const fileExt = videoFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("video-thumbnails")
        .upload(fileName, videoFile);

      if (uploadError) {
        setError("Video upload failed: " + uploadError.message);
        setLoading(false);
        return;
      }
      const { data: publicData } = supabase.storage
        .from("video-thumbnails")
        .getPublicUrl(fileName);
      video_url = publicData.publicUrl;
    }

    // Insert video row
    const { error: insertError } = await supabase.from("videos").insert([
      { ...formData, video_url }
    ]);

    setLoading(false);

    if (insertError) setError(insertError.message);
    else {
      setFormData({ title: "", description: "", video_url: "" });
      setVideoFile(null);
      setVideoPreview(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Post New Video</h2>

      {/* Upload type dropdown */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Choose Upload Type</label>
        <select
          value={uploadType}
          onChange={e => setUploadType(e.target.value)}
          className={inputClass}
        >
          <option value="file">Upload Local Video</option>
          <option value="link">Paste YouTube Link</option>
        </select>
      </div>

      <input
        type="text"
        name="title"
        placeholder="Title"
        value={formData.title}
        onChange={handleChange}
        className={inputClass}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className={inputClass}
        rows="3"
        required
      />

      {/* Conditionally render video input */}
      {uploadType === "file" ? (
        <div>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className={inputClass}
            required={uploadType === "file"}
          />
          {/* Video preview */}
          {videoPreview && (
            <video
              src={videoPreview}
              controls
              muted
              className="w-32 h-32 object-cover mt-2 rounded shadow"
            />
          )}
        </div>
      ) : (
        <input
          type="text"
          name="video_url"
          placeholder="Paste YouTube video link"
          value={formData.video_url}
          onChange={handleChange}
          className={inputClass}
          required={uploadType === "link"}
        />
      )}

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Posting...
          </span>
        ) : (
          "Post Video"
        )}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
