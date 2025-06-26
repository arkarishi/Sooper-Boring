import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {articles.map((article, i) => (
          <motion.div
            key={article.id}
            layout
            whileHover={{
              scale: 1.04,
              y: -4,
              boxShadow: "0 8px 36px rgba(0,0,0,0.13)",
            }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="cursor-pointer rounded-3xl bg-white shadow-lg group flex flex-col h-full overflow-hidden border border-neutral-100 hover:border-blue-200 transition-all"
            style={{
              minHeight: "370px",
              maxHeight: "480px",
            }}
            onClick={() => navigate(`/articles/${article.id}`)}
          >
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-52 object-cover object-center group-hover:scale-105 transition rounded-t-3xl"
              style={{ background: "#f6f8fa" }}
            />
            <div className="flex-1 flex flex-col justify-between p-5">
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
                <h2 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-blue-700 transition">
                  {article.title}
                </h2>
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
          </motion.div>
        ))}
      </div>
    </div>
  );
}
