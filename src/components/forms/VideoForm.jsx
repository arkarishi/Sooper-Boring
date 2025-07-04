import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// Modern, Aesthetic Toolbar (same as ArticleForm)
function MenuBar({ editor }) {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap gap-2 bg-white/80 rounded-t-md shadow-sm border-b px-2 py-1 mb-0">
      <button
        type="button"
        className={`px-2 py-1 rounded-md text-sm font-medium transition ${editor.isActive('bold') ? 'bg-blue-200 text-blue-900 shadow-sm' : 'hover:bg-gray-100'}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >B</button>
      <button
        type="button"
        className={`px-2 py-1 rounded-md text-sm font-medium transition ${editor.isActive('italic') ? 'bg-blue-200 text-blue-900 shadow-sm' : 'hover:bg-gray-100'}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      ><span style={{ fontStyle: "italic" }}>I</span></button>
      <button
        type="button"
        className={`px-2 py-1 rounded-md text-sm font-medium transition ${editor.isActive('strike') ? 'bg-blue-200 text-blue-900 shadow-sm' : 'hover:bg-gray-100'}`}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      ><span style={{ textDecoration: "line-through" }}>S</span></button>
      <button
        type="button"
        className={`px-2 py-1 rounded-md text-sm font-medium transition ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-200 text-blue-900 shadow-sm' : 'hover:bg-gray-100'}`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >H1</button>
      <button
        type="button"
        className={`px-2 py-1 rounded-md text-sm font-medium transition ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-200 text-blue-900 shadow-sm' : 'hover:bg-gray-100'}`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >H2</button>
      <button
        type="button"
        className={`px-2 py-1 rounded-md text-sm font-medium transition ${editor.isActive('bulletList') ? 'bg-blue-200 text-blue-900 shadow-sm' : 'hover:bg-gray-100'}`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >• List</button>
      <button
        type="button"
        className={`px-2 py-1 rounded-md text-sm font-medium transition ${editor.isActive('orderedList') ? 'bg-blue-200 text-blue-900 shadow-sm' : 'hover:bg-gray-100'}`}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >1. List</button>
      <button
        type="button"
        className="px-2 py-1 rounded-md text-sm font-medium transition hover:bg-gray-100"
        onClick={() => editor.chain().focus().undo().run()}
      >↶</button>
      <button
        type="button"
        className="px-2 py-1 rounded-md text-sm font-medium transition hover:bg-gray-100"
        onClick={() => editor.chain().focus().redo().run()}
      >↷</button>
    </div>
  );
}

export default function VideoForm() {
  const [formData, setFormData] = useState({
    title: "",
    video_url: "",
    description: "",
    category: "",
    tags: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState("file"); // "file" or "link"

  // Tiptap editor setup for video description
  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.description,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, description: editor.getHTML() }));
    },
  });

  useEffect(() => {
    if (editor && formData.description !== editor.getHTML()) {
      editor.commands.setContent(formData.description || "");
    }
  }, [editor, formData.description]);

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

  const handleThumbnailChange = (e) => {
    setThumbnailFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let video_url = formData.video_url;
    let thumbnail_url = null;

    // If local file, upload video and thumbnail to Supabase Storage
    if (uploadType === "file" && videoFile) {
      // Upload video
      const fileExt = videoFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, videoFile);

      if (uploadError) {
        setError("Video upload failed: " + uploadError.message);
        setLoading(false);
        return;
      }
      const { data: publicData } = supabase.storage
        .from("videos")
        .getPublicUrl(fileName);
      video_url = publicData.publicUrl;

      // Upload thumbnail if provided
      if (thumbnailFile) {
        const thumbExt = thumbnailFile.name.split(".").pop();
        const thumbName = `${Date.now()}-thumb-${Math.random()}.${thumbExt}`;
        const { error: thumbError } = await supabase.storage
          .from("video-thumbnails")
          .upload(thumbName, thumbnailFile);

        if (thumbError) {
          setError("Thumbnail upload failed: " + thumbError.message);
          setLoading(false);
          return;
        }
        thumbnail_url = thumbName;
      }
    }

    // Get user (Supabase v2+)
    const { data: { user } } = await supabase.auth.getUser();

    // Prepare tags array
    const tagsArray = formData.tags
      ? formData.tags.split(",").map(tag => tag.trim()).filter(Boolean)
      : [];

    // Insert video row
    const { error: insertError } = await supabase.from("videos").insert([
      {
        ...formData,
        video_url,
        thumbnail_url,
        author: user?.user_metadata?.full_name || user?.email || "Anonymous",
        category: formData.category || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        description: formData.description,
      }
    ]);

    setLoading(false);

    if (insertError) setError(insertError.message);
    else {
      setFormData({ title: "", video_url: "", description: "", category: "", tags: "" });
      setVideoFile(null);
      setThumbnailFile(null);
      setVideoPreview(null);
      if (editor) editor.commands.clearContent();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 max-w-lg mx-auto">
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

      {/* Rich text editor for description/body */}
      <label className="font-medium text-gray-700 mt-2 mb-1">Video Description</label>
      <div className="rounded-md border focus-within:ring-2 focus-within:ring-blue-400 bg-neutral-50 min-h-[140px] text-gray-800 transition-shadow">
        <MenuBar editor={editor} />
        <div className="px-3 pb-3 pt-2">
          <EditorContent editor={editor} className="outline-none min-h-[90px] tiptap-content" />
        </div>
      </div>

      <input
        type="text"
        name="category"
        placeholder="Category (e.g. Learning, EdTech)"
        value={formData.category}
        onChange={handleChange}
        className={inputClass}
      />
      <input
        type="text"
        name="tags"
        placeholder="Tags (comma separated, e.g. theory, ux, edtech)"
        value={formData.tags}
        onChange={handleChange}
        className={inputClass}
      />

      {/* Conditionally render video and thumbnail input */}
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
          {/* Thumbnail input */}
          <div className="mt-4">
            <label className="block font-medium text-gray-700 mb-1">Thumbnail Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className={inputClass}
              required
            />
          </div>
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
