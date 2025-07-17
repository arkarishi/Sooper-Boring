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

export default function SpotlightForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    body: "",
    position: "",
    location: "",
    image_url: "",
    created_at: new Date().toISOString(),
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Tiptap editor setup
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
    "w-full px-4 py-2 border border-neutral-700 rounded bg-neutral-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-3";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (!file) return;
    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("spotlight-images")
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

    if (!formData.name || !formData.description || !formData.body || !formData.position || !formData.location || !formData.image_url) {
      setError("All fields are required.");
      return;
    }

    const { error: insertError } = await supabase.from("spotlights").insert([formData]);
    
    if (insertError) {
      setError(insertError.message);
    } else {
      // Reset form
      setFormData({
        name: "",
        description: "",
        body: "",
        position: "",
        location: "",
        image_url: "",
        created_at: new Date().toISOString(),
      });
      setImageFile(null);
      if (editor) {
        editor.commands.clearContent();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Spotlight</h2>
      
      <input
        type="text"
        name="name"
        placeholder="Designer Name"
        value={formData.name}
        onChange={handleChange}
        className={inputClass}
        required
      />
      
      <textarea
        name="description"
        placeholder="Short Description"
        value={formData.description}
        onChange={handleChange}
        className={inputClass}
        rows={2}
        required
      />
      
      <label className="font-medium text-gray-700 mt-2 mb-1">Full Bio / Background</label>
      <div className="rounded-md border focus-within:ring-2 focus-within:ring-blue-400 bg-neutral-50 min-h-[140px] text-gray-800 transition-shadow mb-3">
        <MenuBar editor={editor} />
        <div className="px-3 pb-3 pt-2">
          <EditorContent editor={editor} className="outline-none min-h-[90px] tiptap-content" />
        </div>
      </div>
      
      <input
        type="text"
        name="position"
        placeholder="Position/Title"
        value={formData.position}
        onChange={handleChange}
        className={inputClass}
        required
      />
      
      <input
        type="text"
        name="location"
        placeholder="Location"
        value={formData.location}
        onChange={handleChange}
        className={inputClass}
        required
      />
      
      <div>
        <label className="block font-medium text-gray-700 mb-1">Upload Profile Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className={inputClass}
          disabled={uploading}
          required
        />
        {uploading && <div className="text-blue-600 mt-1 text-sm">Uploading...</div>}
        {formData.image_url && (
          <img
            src={supabase.storage.from("spotlight-images").getPublicUrl(formData.image_url).data.publicUrl}
            alt="Preview"
            className="h-24 rounded mt-2 border bg-white object-cover"
          />
        )}
      </div>
      
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        disabled={uploading}
      >
        Add to Spotlight
      </button>
      
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}