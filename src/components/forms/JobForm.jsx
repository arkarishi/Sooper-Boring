import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function JobForm({ editingItem, onSuccess }) {
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
  });
  const [logoFile, setLogoFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form with editing data
  useEffect(() => {
    if (editingItem) {
      setIsEditing(true);
      setFormData({
        title: editingItem.title || "",
        company: editingItem.company || "",
        location: editingItem.location || "",
        image_url: editingItem.image_url || "",
        about: editingItem.about || "",
        responsibilities: editingItem.responsibilities || [],
        qualifications: editingItem.qualifications || [],
        how_to_apply: editingItem.how_to_apply || "",
        apply_url: editingItem.apply_url || "",
      });
    } else {
      // ✅ Reset everything when editingItem is null
      setIsEditing(false);
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
      });
      setLogoFile(null);
      setError(null);
    }
  }, [editingItem]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (field, value) => {
    setFormData({ ...formData, [field]: value.split("\n").filter(Boolean) });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setLogoFile(file);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("job-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("job-images").getPublicUrl(fileName);
      setFormData((prev) => ({ ...prev, image_url: data.publicUrl }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.company || !formData.location) {
      setError("Title, company, and location are required.");
      return;
    }

    try {
      let result;
      if (isEditing) {
        // Update existing job
        result = await supabase
          .from("jobs")
          .update(formData)
          .eq("id", editingItem.id);
      } else {
        // Insert new job
        result = await supabase
          .from("jobs")
          .insert([formData]);
      }

      if (result.error) throw result.error;

      // Reset form to create mode
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
      });
      setLogoFile(null);
      setIsEditing(false); // ✅ Reset editing state
      
      alert(isEditing ? "Job updated successfully!" : "Job posted successfully!");
      
      // ✅ Call onSuccess to clear editingItem in parent component
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {isEditing ? "Edit Job" : "Post a New Job"}
      </h2>
      
      <input
        type="text"
        name="title"
        placeholder="Job Title"
        value={formData.title}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        required
      />
      
      <input
        type="text"
        name="company"
        placeholder="Company"
        value={formData.company}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        required
      />
      
      <input
        type="text"
        name="location"
        placeholder="Location"
        value={formData.location}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        required
      />
      
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          {isEditing ? "Upload New Company Logo (optional)" : "Upload Company Logo"}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          disabled={uploading}
          className="w-full px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          required={!isEditing && !formData.image_url}
        />
        {uploading && <p className="text-blue-600 text-sm mt-1">Uploading...</p>}
        {formData.image_url && (
          <div className="mt-2">
            <img
              src={formData.image_url}
              alt="Logo Preview"
              className="h-20 rounded border bg-white object-contain"
            />
            {isEditing && !logoFile && (
              <p className="text-sm text-gray-600 mt-1">Current company logo</p>
            )}
          </div>
        )}
      </div>
      
      <textarea
        name="about"
        placeholder="About the job"
        value={formData.about}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        required
        rows={3}
      />
      
      <div>
        <label className="block font-medium text-gray-700 mb-1">Responsibilities</label>
        <textarea
          name="responsibilities"
          placeholder="Enter responsibilities (one per line)&#10;• Develop user interfaces&#10;• Collaborate with team&#10;• Write clean code"
          value={formData.responsibilities.join('\n')}
          onChange={(e) => handleArrayChange('responsibilities', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          rows={4}
          required
        />
        <p className="text-sm text-gray-500 mt-1">Enter each responsibility on a new line</p>
      </div>
      
      <div>
        <label className="block font-medium text-gray-700 mb-1">Qualifications</label>
        <textarea
          name="qualifications"
          placeholder="Enter qualifications (one per line)&#10;• 3+ years experience&#10;• Bachelor's degree&#10;• Knowledge of React"
          value={formData.qualifications.join('\n')}
          onChange={(e) => handleArrayChange('qualifications', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          rows={4}
          required
        />
        <p className="text-sm text-gray-500 mt-1">Enter each qualification on a new line</p>
      </div>
      
      <textarea
        name="how_to_apply"
        placeholder="How to apply instructions"
        value={formData.how_to_apply}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        required
        rows={3}
      />
      
      <input
        type="url"
        name="apply_url"
        placeholder="Application Link (https://...) or Email (mailto:...)"
        value={formData.apply_url}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        required
      />
      
      <button 
        type="submit" 
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : (isEditing ? "Update Job" : "Post Job")}
      </button>
      
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
