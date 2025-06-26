import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

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
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Articles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {articles.map((article) => (
          <motion.div
            key={article.id}
            layout
            className={`rounded-xl bg-white shadow transition-all cursor-pointer border border-transparent hover:border-blue-200 ${expandedId === article.id ? "col-span-full" : ""}`}
            onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
            whileHover={{ scale: 1.02 }}
            initial={false}
          >
            <div className="flex flex-col md:flex-row">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full md:w-60 aspect-video object-cover rounded-t-xl md:rounded-t-none md:rounded-l-xl"
              />
              <div className="flex-1 p-4">
                <div className="mb-1 flex flex-wrap gap-2 items-center">
                  {article.category && (
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium uppercase tracking-wide">
                      {article.category}
                    </span>
                  )}
                  {Array.isArray(article.tags) && article.tags.map(tag => (
                    <span key={tag} className="inline-block bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                <h2 className="font-bold text-xl text-gray-800 mb-1">{article.title}</h2>
                <p className="text-gray-500 mb-2 line-clamp-2">{article.description}</p>
                <AnimatePresence>
                  {expandedId === article.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="pt-4 text-gray-800"
                    >
                      {/* Full content */}
                      <div className="prose max-w-none">
                        {article.body || <i>No detailed content provided.</i>}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        {article.author && <>By {article.author} • </>}
                        {article.created_at && (
                          <>
                            {new Date(article.created_at).toLocaleDateString()}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
