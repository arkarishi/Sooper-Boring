import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Fetch videos
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });
    setVideos(data || []);
    setError(error ? error.message : null);
    setLoading(false);
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle thumbnail selection
  const handleFileChange = (e) => {
    setThumbnailFile(e.target.files[0]);
  };

  // Handle post video
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    let thumbnail_url = null;

    // 1. Upload thumbnail to Supabase Storage
    if (thumbnailFile) {
      const fileExt = thumbnailFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('video-thumbnails')
        .upload(fileName, thumbnailFile);

      if (uploadError) {
        setError('Thumbnail upload failed: ' + uploadError.message);
        return;
      }
      const { data: publicData } = supabase.storage.from('video-thumbnails').getPublicUrl(fileName);
      thumbnail_url = publicData.publicUrl; 
    }

    // 2. Insert video row
    const { error: insertError } = await supabase.from('videos').insert([
      { ...formData, thumbnail_url }
    ]);

    if (insertError) setError(insertError.message);
    else {
      setFormData({ title: '', description: '', video_url: '' });
      setThumbnailFile(null);
      fetchVideos();
    }
  };

  return (
    <div className="min-h-screen w-full px-6 py-10 bg-neutral-100">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">Videos</h1>

      {/* Show form ONLY if logged in */}
      {session && (
        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto mb-10 bg-white p-6 rounded-lg shadow"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Post New Video</h2>
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
            rows="3"
            required
          />
          <input
            type="text"
            name="video_url"
            placeholder="Video URL (YouTube, Vimeo, etc.)"
            value={formData.video_url}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-2 border rounded"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full mb-4"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Post Video
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : videos.length === 0 ? (
        <p className="text-center text-gray-500">No videos found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="mb-3 rounded aspect-video object-cover"
              />
              <h3 className="text-lg font-semibold mb-1">{video.title}</h3>
              <p className="text-gray-600 mb-2">{video.description}</p>
              <a
                href={video.video_url}
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch Video
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Videos;
