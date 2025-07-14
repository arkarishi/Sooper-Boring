import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-slate-50 py-10" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex flex-wrap gap-2 mb-4 px-2">
          <span
            className="text-[#49719c] text-base font-medium leading-normal cursor-pointer hover:underline"
            onClick={() => navigate("/articles")}
          >
            Articles
          </span>
          <span className="text-[#49719c] text-base font-medium leading-normal">/</span>
          <span className="text-[#141414] text-base font-medium leading-normal">{article.title}</span>
        </div>
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d141c] leading-tight mb-2">
          {article.title}
        </h1>
        {/* Description */}
        {article.description && (
          <p className="text-[#0d141c] text-base font-normal leading-normal pb-3 pt-1">
            {article.description}
          </p>
        )}
        {/* Author and Date */}
        <div className="mb-6 text-[#49719c] text-sm">
          {article.author && <>By {article.author} · </>}
          {article.created_at && (
            <>Published on {new Date(article.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</>
          )}
        </div>
        {/* Image */}
        {article.image_url && (
          <div className="w-full aspect-[3/2] overflow-hidden rounded-2xl bg-slate-50 mb-8">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover rounded-2xl"
              style={{ background: "#f5f7fa" }}
            />
          </div>
        )}
        {/* Body */}
        <div
          className="prose prose-lg text-[#0d141c] max-w-none"
          dangerouslySetInnerHTML={{
            __html: article.body || "<i>No detailed content provided.</i>",
          }}
        />
        {/* Tags & Category at the bottom */}
        <div className="flex flex-wrap gap-2 mt-10">
          {article.category && (
            <span className="inline-block bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded font-semibold uppercase tracking-wide">
              {article.category}
            </span>
          )}
          {Array.isArray(article.tags) && article.tags.length > 0 && (
            article.tags.map(tag => (
              <span key={tag} className="inline-block bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
                #{tag}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
