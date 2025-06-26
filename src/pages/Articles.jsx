import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    setArticles(data || []);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-10">Articles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {articles.map((article) => (
          <div
            key={article.id}
            className="cursor-pointer group rounded-3xl bg-white shadow-lg hover:shadow-2xl transition p-6 flex flex-col md:flex-row items-stretch min-h-[260px]"
            onClick={() => navigate(`/articles/${article.id}`)}
          >
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full md:w-56 h-44 md:h-full object-cover rounded-2xl group-hover:scale-105 transition"
            />
            <div className="flex-1 md:pl-7 pt-4 md:pt-0 flex flex-col justify-between">
              <div>
                <div className="mb-2 flex flex-wrap gap-2 items-center">
                  {article.category && (
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-semibold uppercase tracking-wide">
                      {article.category}
                    </span>
                  )}
                  {Array.isArray(article.tags) && article.tags.map(tag => (
                    <span key={tag} className="inline-block bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                <h2 className="font-bold text-2xl text-gray-900 mb-1">{article.title}</h2>
                <p className="text-gray-500 text-base line-clamp-3">{article.description}</p>
              </div>
              <div className="mt-4 text-xs text-gray-400">
                {article.author && <>By {article.author} • </>}
                {article.created_at && (
                  <>
                    {new Date(article.created_at).toLocaleDateString()}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
