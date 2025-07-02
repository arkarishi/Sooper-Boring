import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const placeholderImg = "https://placehold.co/320x180/eeeeee/cccccc?text=No+Image";

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, [search]);

  const fetchArticles = async () => {
    let query = supabase.from("articles").select("*").order("created_at", { ascending: false });
    if (search.trim()) {
      query = query.ilike("title", `%${search}%`);
    }
    const { data } = await query;
    setArticles(data || []);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10" style={{ fontFamily: '"Newsreader", "Noto Sans", sans-serif' }}>
      <div className="max-w-6xl mx-auto px-0 sm:px-4">
        <div className="flex items-center mb-8 mt-12 gap-4">
          <h1 className="text-[2rem] font-extrabold text-blue-900 flex-1 text-left">Articles</h1>
          <input
            type="text"
            placeholder="Search articles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 border rounded-lg shadow bg-white text-gray-700 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex flex-col gap-6">
          {articles.map((article) => (
            <motion.div
              key={article.id}
              whileHover={{ y: -2, boxShadow: "0 6px 24px 0 rgba(0,0,0,0.08)" }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
              className="flex items-stretch justify-between gap-7 rounded-xl bg-white/95 border border-neutral-100 hover:border-blue-200 transition-all cursor-pointer p-6"
              onClick={() => navigate(`/articles/${article.id}`)}
              style={{ minHeight: 130 }}
            >
              {/* Left: Thumbnail */}
              <div
                className="w-[260px] min-w-[210px] aspect-video bg-center bg-no-repeat bg-cover rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{
                  backgroundImage: `url(${article.image_url || placeholderImg})`,
                  height: 120,
                  maxHeight: 130,
                }}
              />
              {/* Right: Text */}
              <div className="flex flex-col justify-center flex-[2.2_2.2_0px] min-w-0 pr-4">
                <p className="text-[#0d141c] text-base font-bold leading-tight mb-1 truncate">
                  {article.title}
                </p>
                <p className="text-[#49719c] text-sm font-normal leading-normal mb-2 truncate">
                  {article.description}
                </p>
                <span className="text-xs text-gray-400 mt-2">
                  {article.created_at && new Date(article.created_at).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
