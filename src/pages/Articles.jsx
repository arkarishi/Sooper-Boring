import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const placeholderImg = "https://placehold.co/320x180/eeeeee/cccccc?text=No+Image";

const getImageUrl = (path) => {
  if (!path) return placeholderImg;
  const { data } = supabase.storage.from("article-images").getPublicUrl(path);
  return data?.publicUrl || placeholderImg;
};

export default function Articles({ search }) {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, [search]);

  const fetchArticles = async () => {
    let query = supabase.from("articles").select("*").order("created_at", { ascending: false });
    if (search && search.trim()) {
      query = query.ilike("title", `%${search}%`);
    }
    const { data } = await query;
    setArticles(data || []);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10" style={{ fontFamily: '"Newsreader", "Noto Sans", sans-serif' }}>
      <div className="max-w-6xl mx-auto px-0 sm:px-4">
        <div className="flex items-center mb-8 mt-12 gap-4">
          <h1 className="text-[2rem] font-extrabold text-black flex-1 text-left">
            Articles
          </h1>
        </div>
        <div className="flex flex-col gap-6">
          {articles.map((article) => (
            <motion.div
              key={article.id}
              whileHover={{ backgroundColor: "#f6f6f6" }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
              className="flex items-stretch gap-8 cursor-pointer px-0 py-3 transition-all"
              onClick={() => navigate(`/articles/${article.id}`)}
            >
              {/* Left: Image */}
              <div
                className="w-[260px] min-w-[210px] aspect-video bg-center bg-no-repeat bg-cover rounded-xl flex-shrink-0"
                style={{
                  backgroundImage: `url(${article.image_url || placeholderImg})`,
                  height: 160,
                  maxHeight: 180,
                }}
              />
              {/* Right: Text */}
              <div className="flex flex-col justify-center flex-1 min-w-0">
                <p className="text-[#101419] text-lg font-bold leading-tight mb-1 font-serif truncate">
                  {article.title}
                </p>
                <p className="text-[#49719c] text-base font-normal leading-normal mb-1 truncate">
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
