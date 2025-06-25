// src/pages/Articles.jsx

import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Card from '../components/Card';

const Articles = () => {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: ''
  });

  // Track current user for auth gating
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Fetch articles from Supabase
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setArticles(data || []);
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image file upload to Supabase Storage
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    // Make filename unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    let { error: uploadError } = await supabase
      .storage
      .from('article-images')
      .upload(filePath, file);

    if (uploadError) {
      setError('Image upload failed!');
      setUploading(false);
      return;
    }

    // Get public URL
    const { data } = supabase.storage.from('article-images').getPublicUrl(filePath);
    setFormData({ ...formData, image_url: data.publicUrl });
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.title || !formData.description || !formData.image_url) {
      setError('All fields required including image.');
      return;
    }
    const { error } = await supabase
      .from('articles')
      .insert([formData]);
    if (error) setError(error.message);
    else {
      setFormData({ title: '', description: '', image_url: '' });
      fetchArticles();
    }
  };

  return (
    <div className="min-h-screen w-full px-6 py-10 bg-neutral-100">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">Articles</h1>
      
      {/* Only show the form if the user is logged in */}
      {user ? (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-10 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Post New Article</h2>
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
            rows="4"
            required
          />
          <div className="mb-4">
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
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" disabled={uploading}>
            Post Article
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      ) : (
        <div className="max-w-xl mx-auto mb-10 bg-white p-6 rounded-lg shadow text-center text-gray-600">
          Please log in or sign up to post an article.
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : articles.length === 0 ? (
        <p className="text-center text-gray-500">No articles found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <Card
              key={article.id}
              title={article.title}
              description={article.description}
              image={article.image_url}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Articles;