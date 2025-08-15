import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// Modern, Aesthetic Toolbar
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

export default function TheoryForm({ editingItem, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    intro: "",
    content: "",
    image_url: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form with editing data
  useEffect(() => {
    if (editingItem) {
      setIsEditing(true);
      setFormData({
        title: editingItem.title || "",
        subtitle: editingItem.subtitle || "",
        intro: editingItem.intro || "",
        content: editingItem.content || "",
        image_url: editingItem.image_url || "",
      });
    } else {
      // ✅ Reset everything when editingItem is null
      setIsEditing(false);
      setFormData({
        title: "",
        subtitle: "",
        intro: "",
        content: "",
        image_url: "",
      });
      setImageFile(null);
      setError(null);
    }
  }, [editingItem]);

  // Tiptap editor setup
  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, content: editor.getHTML() }));
    },
  });

  useEffect(() => {
    if (editor && formData.content !== editor.getHTML()) {
      editor.commands.setContent(formData.content || "");
    }
  }, [editor, formData.content]);

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-3";

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
    
    const { data } = supabase.storage.from("theory-images").getPublicUrl(fileName);
    setFormData((prev) => ({ ...prev, image_url: data.publicUrl }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.intro || !formData.content) {
      setError("Title, intro, and content are required.");
      return;
    }

    const payload = {
      title: formData.title,
      subtitle: formData.subtitle,
      intro: formData.intro,
      content: formData.content,
      image_url: formData.image_url,
    };

    let result;
    if (isEditing) {
      // Update existing theory
      result = await supabase
        .from("theories")
        .update(payload)
        .eq("id", editingItem.id);
    } else {
      // Insert new theory
      result = await supabase
        .from("theories")
        .insert([payload]);
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      // Reset form to create mode
      setFormData({
        title: "",
        subtitle: "",
        intro: "",
        content: "",
        image_url: "",
      });
      setImageFile(null);
      setIsEditing(false); // ✅ Reset editing state
      if (editor) editor.commands.clearContent();
      
      alert(isEditing ? "Theory updated successfully!" : "Theory posted successfully!");
      
      // ✅ Call onSuccess to clear editingItem in parent component
      if (onSuccess) onSuccess();
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return supabase.storage.from("theory-images").getPublicUrl(url).data.publicUrl;
  };

  const getCurrentImage = () => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
    if (formData.image_url) {
      return getImageUrl(formData.image_url);
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-2 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {isEditing ? "Edit Theory" : "Post a New Theory"}
      </h2>
      
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
      
      <label className="font-medium text-gray-700 mt-2 mb-1">Full Theory Content</label>
      <div className="rounded-md border focus-within:ring-2 focus-within:ring-blue-400 bg-neutral-50 min-h-[200px] text-gray-800 transition-shadow mb-3">
        <MenuBar editor={editor} />
        <div className="px-3 pb-3 pt-2">
          <EditorContent editor={editor} className="outline-none min-h-[150px] tiptap-content" />
        </div>
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">
          {isEditing ? "Upload New Image (optional)" : "Upload Image (optional)"}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className={inputClass}
          disabled={uploading}
        />
        {uploading && <div className="text-blue-600 mt-1 text-sm">Uploading...</div>}
        {getCurrentImage() && (
          <div className="mt-2">
            <img
              src={getCurrentImage()}
              alt="Preview"
              className="h-24 rounded border bg-white object-contain"
            />
            {isEditing && !imageFile && (
              <p className="text-sm text-gray-600 mt-1">Current theory image</p>
            )}
          </div>
        )}
      </div>
      
      <button
        type="submit"
        className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : (isEditing ? "Update Theory" : "Post Theory")}
      </button>
      
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
