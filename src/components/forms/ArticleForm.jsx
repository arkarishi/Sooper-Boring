import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// Toolbar Button Component
function MenuBar({ editor }) {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap gap-2 border-b pb-2 mb-2">
      <button
        type="button"
        className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >B</button>
      <button
        type="button"
        className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      ><span style={{ fontStyle: "italic" }}>I</span></button>
      <button
        type="button"
        className={`px-2 py-1 rounded ${editor.isActive('strike') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      ><span style={{ textDecoration: "line-through" }}>S</span></button>
      <button
        type="button"
        className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >H1</button>
      <button
        type="button"
        className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >H2</button>
      <button
        type="button"
        className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >• List</button>
      <button
        type="button"
        className={`px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >1. List</button>
      <button
        type="button"
        className="px-2 py-1 rounded hover:bg-gray-100"
        onClick={() => editor.chain().focus().undo().run()}
      >↶ Undo</button>
      <button
        type="button"
        className="px-2 py-1 rounded hover:bg-gray-100"
        onClick={() => editor.chain().focus().redo().run()}
      >↷ Redo</button>
    </div>
  );
}

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

  // Tiptap editor with StarterKit
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    if (editor) {
      editor.commands.clearContent();
    }
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

      {/* Tiptap Editor with Toolbar */}
      <label className="font-medium text-gray-700 mt-2 mb-1">Full Article Content</label>
      <div className="bg-white border rounded shadow p-2 mb-6 min-h-[180px]">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>

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
