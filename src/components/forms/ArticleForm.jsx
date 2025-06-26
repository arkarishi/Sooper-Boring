import React, { useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function ArticleForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    body: "",
    category: "",
    tags: "",
    image_url: "",
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Handle text inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    let { error: uploadError } = await supabase
      .storage
      .from("article-images")
      .upload(filePath, file);

    if (uploadError) {
      setError("Image upload failed!");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("article-images").getPublicUrl(filePath);
    setFormData({ ...formData, image_url: data.publicUrl });
    setUploading(false);
  };

  // Submit article
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.title || !formData.description || !formData.body || !formData.image_url) {
      setError("All fields required including image.");
      return;
    }
    const tagsArray = formData.tags
      ? formData.tags.split(",").map(tag => tag.trim()).filter(Boolean)
      : [];

    const payload = {
      title: formData.title,
      description: formData.description,
      body: formData.body,
      category: formData.category || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
      image_url: formData.image_url,
    };

    const { error } = await supabase.from("articles").insert([payload]);
    if (error) setError(error.message);
    else setFormData({
      title: "",
      description: "",
      body: "",
      category: "",
      tags: "",
      image_url: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Post New Article</h2>
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={formData.title}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded"
        required
      />
      <textarea
        name="description"
        placeholder="Short Description (for previews)"
        value={formData.description}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded"
        rows="2"
        required
      />
      <textarea
        name="body"
        placeholder="Full Article Content"
        value={formData.body}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded"
        rows="8"
        required
      />
      <input
        type="text"
        name="category"
        placeholder="Category (e.g. Design, Learning)"
        value={formData.category}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded"
      />
      <input
        type="text"
        name="tags"
        placeholder="Tags (comma separated, e.g. theory, ux, edtech)"
        value={formData.tags}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded"
      />
      <div>
        <label className="block mb-1 font-medium">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full text-sm"
          disabled={uploading}
        />
        {uploading && <div className="text-blue-600 mt-1 text-sm">Uploading...</div>}
        {formData.image_url && (
          <img src={formData.image_url} alt="Preview" className="h-32 rounded mt-2 border" />
        )}
      </div>
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        disabled={uploading}
      >
        Post Article
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
