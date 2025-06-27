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

  if (!article)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-14 px-2 sm:px-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-blue-700 hover:underline"
      >
        <ArrowLeft size={22} /> Back to Articles
      </button>
      <div className="max-w-5xl sm:max-w-6xl mx-auto bg-white p-0 sm:p-16 p-4 rounded-3xl shadow-2xl border border-neutral-200 transition-all duration-300">
        {/* Category on its own line */}
        {article.category && (
          <span className="inline-block bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded font-semibold uppercase tracking-wide mr-2 mb-1">
            {article.category}
          </span>
        )}

        {/* Tags in a new line below */}
        {Array.isArray(article.tags) && article.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <span key={tag} className="inline-block bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight mt-6">
          {article.title}
        </h1>
        <div className="mb-6 text-gray-400 text-base">
          {article.author && <>By {article.author} • </>}
          {article.created_at && (
            <>
              {new Date(article.created_at).toLocaleDateString()}
            </>
          )}
        </div>
        <img
          src={article.image_url || "https://placehold.co/900x350/eeeeee/cccccc?text=No+Image"}
          alt={article.title}
          className="rounded-2xl mb-10 w-full max-h-[600px] object-cover border"
        />
        <p className="text-xl text-gray-700 mb-8">{article.description}</p>
        <div
          className="prose prose-xl text-gray-900 max-w-none"
          dangerouslySetInnerHTML={{
            __html: article.body || "<i>No detailed content provided.</i>",
          }}
        />
      </div>
    </div>
  );
}
