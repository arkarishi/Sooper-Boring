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

export default function VideoForm({ editingItem, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    video_url: "",
    description: "",
    body: "",
    category: "",
    tags: "",
    thumbnail_url: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState("file"); // "file" or "link"
  const [isEditing, setIsEditing] = useState(false);

  // Helper function to detect if URL is YouTube
  const isYouTubeURL = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  // Helper function to get YouTube thumbnail
  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    
    let videoId = null;
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  // Initialize form with editing data
  useEffect(() => {
    if (editingItem) {
      setIsEditing(true);
      setFormData({
        title: editingItem.title || "",
        video_url: editingItem.video_url || "",
        description: editingItem.description || "",
        body: editingItem.body || "",
        category: editingItem.category || "",
        tags: editingItem.tags ? editingItem.tags.join(", ") : "",
        thumbnail_url: editingItem.thumbnail_url || "",
      });
      
      // Detect upload type based on existing video_url
      if (editingItem.video_url && isYouTubeURL(editingItem.video_url)) {
        setUploadType("link");
      } else {
        setUploadType("file");
      }
    } else {
      // ✅ Reset everything when editingItem is null
      setIsEditing(false);
      setFormData({
        title: "",
        video_url: "",
        description: "",
        body: "",
        category: "",
        tags: "",
        thumbnail_url: "",
      });
      setUploadType("file");
      setVideoFile(null);
      setThumbnailFile(null);
      setVideoPreview(null);
      setError(null);
    }
  }, [editingItem]);

  // TipTap editor for body (full content)
  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.body,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, body: editor.getHTML() }));
    },
  });

  useEffect(() => {
    if (editor && formData.body !== editor.getHTML()) {
      editor.commands.setContent(formData.body || "");
    }
  }, [editor, formData.body]);

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Auto-detect YouTube thumbnail
    if (e.target.name === 'video_url' && uploadType === 'link') {
      const youTubeThumbnail = getYouTubeThumbnail(e.target.value);
      if (youTubeThumbnail) {
        setFormData(prev => ({ ...prev, video_url: e.target.value, thumbnail_url: youTubeThumbnail }));
      }
    }
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
    let thumbnail_url = formData.thumbnail_url;

    // If local file, upload video to Supabase Storage
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
    }

    // Upload thumbnail if provided (for both file and link types)
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
      const { data: thumbData } = supabase.storage
        .from("video-thumbnails")
        .getPublicUrl(thumbName);
      thumbnail_url = thumbData.publicUrl;
    }

    // Get user (Supabase v2+)
    const { data: { user } } = await supabase.auth.getUser();

    // Prepare tags array
    const tagsArray = formData.tags
      ? formData.tags.split(",").map(tag => tag.trim()).filter(Boolean)
      : [];

    const payload = {
      title: formData.title,
      video_url,
      thumbnail_url,
      description: formData.description,
      body: formData.body,
      category: formData.category || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
      author: user?.user_metadata?.full_name || user?.email || "Anonymous",
    };

    let result;
    if (isEditing) {
      // Update existing video
      result = await supabase
        .from("videos")
        .update(payload)
        .eq("id", editingItem.id);
    } else {
      // Insert new video
      result = await supabase
        .from("videos")
        .insert([payload]);
    }

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
    } else {
      // Reset form to create mode
      setFormData({
        title: "",
        video_url: "",
        description: "",
        body: "",
        category: "",
        tags: "",
        thumbnail_url: "",
      });
      setVideoFile(null);
      setThumbnailFile(null);
      setVideoPreview(null);
      setUploadType("file");
      setIsEditing(false); // ✅ Reset editing state
      if (editor) editor.commands.clearContent();
      
      alert(isEditing ? "Video updated successfully!" : "Video posted successfully!");
      
      // ✅ Call onSuccess to clear editingItem in parent component
      if (onSuccess) onSuccess();
    }
  };

  const getCurrentThumbnail = () => {
    if (thumbnailFile) {
      return URL.createObjectURL(thumbnailFile);
    }
    if (formData.thumbnail_url) {
      return formData.thumbnail_url;
    }
    return null;
  };

  const getCurrentVideo = () => {
    if (videoPreview) return videoPreview;
    if (isEditing && formData.video_url && !isYouTubeURL(formData.video_url)) {
      return formData.video_url;
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {isEditing ? "Edit Video" : "Post New Video"}
      </h2>

      {/* Upload type dropdown */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Choose Upload Type</label>
        <select
          value={uploadType}
          onChange={e => setUploadType(e.target.value)}
          className={inputClass}
          disabled={isEditing} // Disable changing upload type when editing
        >
          <option value="file">Upload Local Video</option>
          <option value="link">Paste YouTube Link</option>
        </select>
        {isEditing && (
          <p className="text-sm text-gray-500 mt-1">
            Upload type cannot be changed when editing
          </p>
        )}
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
        placeholder="Short Description (for previews)"
        value={formData.description}
        onChange={handleChange}
        className={inputClass}
        rows={2}
        required
      />

      <label className="font-medium text-gray-700 mt-2 mb-1">Full Video Content</label>
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
          <label className="block font-medium text-gray-700 mb-1">
            {isEditing ? "Upload New Video File (optional)" : "Upload Video File"}
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className={inputClass}
            required={uploadType === "file" && !isEditing}
          />
          {/* Video preview */}
          {getCurrentVideo() && (
            <div className="mt-2">
              <video
                src={getCurrentVideo()}
                controls
                muted
                className="w-full max-w-sm h-32 object-cover rounded shadow"
              />
            </div>
          )}
          {/* Show existing video filename if editing */}
          {isEditing && formData.video_url && !videoPreview && !isYouTubeURL(formData.video_url) && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Current video: {formData.video_url.split('/').pop()}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            type="text"
            name="video_url"
            placeholder="Paste YouTube video link"
            value={formData.video_url}
            onChange={handleChange}
            className={inputClass}
            required={uploadType === "link"}
          />
          {/* YouTube preview */}
          {uploadType === "link" && formData.video_url && isYouTubeURL(formData.video_url) && (
            <div className="mt-2">
              <p className="text-sm text-green-600">✓ YouTube video detected</p>
              {formData.thumbnail_url && (
                <img
                  src={formData.thumbnail_url}
                  alt="YouTube thumbnail"
                  className="w-32 h-20 object-cover rounded shadow mt-2"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Thumbnail input */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          {uploadType === "link" ? "Custom Thumbnail (optional - YouTube thumbnail auto-detected)" : 
           isEditing ? "Upload New Thumbnail (optional)" : "Thumbnail Image"}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleThumbnailChange}
          className={inputClass}
          required={uploadType === "file" && !isEditing && !formData.thumbnail_url}
        />
        {/* Thumbnail preview */}
        {getCurrentThumbnail() && (
          <div className="mt-2">
            <img
              src={getCurrentThumbnail()}
              alt="Thumbnail preview"
              className="w-32 h-20 object-cover rounded shadow"
            />
          </div>
        )}
        {/* Show existing thumbnail info if editing */}
        {isEditing && formData.thumbnail_url && !thumbnailFile && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              Current thumbnail: {formData.thumbnail_url.includes('youtube') ? 'YouTube auto-generated' : 'Custom uploaded'}
            </p>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
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
            {isEditing ? "Updating..." : "Posting..."}
          </span>
        ) : (
          isEditing ? "Update Video" : "Post Video"
        )}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
