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

        {/* Intro/Description */}
        {theory.intro && (
          <div className="text-[#141414] text-sm sm:text-base font-normal leading-relaxed pb-4 sm:pb-6 pt-1">
            {theory.intro}
          </div>
        )}

        {/* Principles */}
        {Array.isArray(theory.principles) && theory.principles.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-[#141414] text-lg sm:text-xl lg:text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 sm:pb-4 pt-2 sm:pt-3">
              Principles
            </h2>
            <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base leading-relaxed space-y-2">
              {theory.principles.map((item, idx) => (
                <li key={idx} className="pl-2">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Applications */}
        {Array.isArray(theory.applications) && theory.applications.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-[#141414] text-lg sm:text-xl lg:text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 sm:pb-4 pt-2 sm:pt-3">
              Applications
            </h2>
            <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base leading-relaxed space-y-2">
              {theory.applications.map((item, idx) => (
                <li key={idx} className="pl-2">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Examples */}
        {Array.isArray(theory.examples) && theory.examples.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-[#141414] text-lg sm:text-xl lg:text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 sm:pb-4 pt-2 sm:pt-3">
              Examples
            </h2>
            <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base leading-relaxed space-y-2">
              {theory.examples.map((item, idx) => (
                <li key={idx} className="pl-2">{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
