import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Card from '../components/Card';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: ''
  });

  // Fetch articles from Supabase
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
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
          placeholder="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded"
          rows="4"
          required
        />
        <input
          type="text"
          name="image_url"
          placeholder="Image URL"
          value={formData.image_url}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border rounded"
          required
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Post Article
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>

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
