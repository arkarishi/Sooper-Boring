import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    async function fetchArticle() {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();
      setArticle(data);
    }
    fetchArticle();
  }, [id]);

  if (!article) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-blue-700 hover:underline"
      >
        <ArrowLeft size={20} /> Back to Articles
      </button>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl">
        <div className="mb-5 flex flex-wrap gap-2 items-center">
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{article.title}</h1>
        <div className="mb-4 text-gray-400 text-sm">
          {article.author && <>By {article.author} • </>}
          {article.created_at && (
            <>
              {new Date(article.created_at).toLocaleDateString()}
            </>
          )}
        </div>
        <img
          src={article.image_url}
          alt={article.title}
          className="rounded-xl mb-6 w-full max-h-[400px] object-cover"
        />
        <p className="text-lg text-gray-700 mb-6">{article.description}</p>
        <div className="prose prose-lg text-gray-900 max-w-none">
          {article.body ? article.body : <i>No detailed content provided.</i>}
        </div>
      </div>
    </div>
  );
}
