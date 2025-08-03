import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

function getImageUrl(path) {
  if (!path) return "https://placehold.co/900x350/eeeeee/cccccc?text=No+Image";
  const { data } = supabase.storage.from("theory-images").getPublicUrl(path);
  return data?.publicUrl || "https://placehold.co/900x350/eeeeee/cccccc?text=No+Image";
}

export default function TheoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theory, setTheory] = useState(null);

  useEffect(() => {
    async function fetchTheory() {
      const { data } = await supabase
        .from("theories")
        .select("*")
        .eq("id", id)
        .single();
      setTheory(data);
    }
    fetchTheory();
  }, [id]);

  if (!theory)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-50 py-6 sm:py-10" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
          <span
            className="text-neutral-500 text-sm sm:text-base font-medium leading-normal cursor-pointer hover:underline"
            onClick={() => navigate("/theories")}
          >
            Theories
          </span>
          <span className="text-neutral-500 text-sm sm:text-base font-medium leading-normal">/</span>
          <span className="text-[#141414] text-sm sm:text-base font-medium leading-normal truncate">{theory.title}</span>
        </div>

        {/* Intro/Description */}
        {theory.intro && (
          <div className="text-[#141414] text-sm sm:text-base font-normal leading-relaxed pb-4 sm:pb-6 pt-1">
            {theory.intro}
          </div>
        )}

        {/* Banner Image */}
        <div
          className="w-full rounded-xl overflow-hidden flex flex-col justify-end min-h-64 sm:min-h-80 lg:min-h-96 mb-6 sm:mb-8"
          style={{
            backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 25%), url(${getImageUrl(theory.image_url)})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="flex p-4 sm:p-6">
            <h1 className="text-white tracking-light text-xl sm:text-2xl lg:text-[28px] font-bold leading-tight drop-shadow-lg">
              {theory.title}
            </h1>
          </div>
        </div>

        {/* Date */}
        <div className="mb-4 sm:mb-6 text-gray-400 text-sm sm:text-base">
          {theory.created_at && (
            <>Published on {new Date(theory.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</>
          )}
        </div>

        {/* Content */}
        {theory.content && (
          <div className="mb-6 sm:mb-8">
            <div 
              className="text-gray-700 text-sm sm:text-base leading-relaxed prose prose-sm sm:prose-base max-w-none prose-headings:text-[#141414] prose-headings:font-bold prose-h1:text-lg sm:prose-h1:text-xl lg:prose-h1:text-[22px] prose-h2:text-base sm:prose-h2:text-lg lg:prose-h2:text-xl prose-ul:space-y-2 prose-ol:space-y-2 prose-li:pl-2"
              dangerouslySetInnerHTML={{ __html: theory.content }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
