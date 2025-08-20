import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

// ✅ FIXED: Handle both HTTP URLs and Supabase storage paths
function getImageUrl(theory) {
  if (!theory || !theory.image_url) return "https://placehold.co/900x350/eeeeee/cccccc?text=No+Image";
  
  // Handle full HTTP URLs
  if (theory.image_url.startsWith('http')) {
    return theory.image_url;
  }
  
  // Handle Supabase storage paths
  const { data } = supabase.storage.from("theory-images").getPublicUrl(theory.image_url);
  return data?.publicUrl || "https://placehold.co/900x350/eeeeee/cccccc?text=No+Image";
}

export default function TheoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theory, setTheory] = useState(null);

  useEffect(() => {
    async function fetchTheory() {
      try {
        // ✅ First get the theory
        const { data: theoryData, error: theoryError } = await supabase
          .from("theories")
          .select("*")
          .eq("id", id)
          .single();

        if (theoryError) {
          console.error("Error fetching theory:", theoryError);
          return;
        }

        // ✅ Then get the author profile if author_id exists
        let authorProfile = null;
        if (theoryData.author_id) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("name, profile_photo_url, slug")
            .eq("id", theoryData.author_id)
            .single();
          
          authorProfile = profileData;
        }

        // ✅ Combine the data
        setTheory({
          ...theoryData,
          profiles: authorProfile
        });

      } catch (error) {
        console.error("Error in fetchTheory:", error);
      }
    }
    
    fetchTheory();
  }, [id]);

  if (!theory)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 py-10" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className="text-[#49719c] text-base font-medium leading-normal cursor-pointer hover:underline"
            onClick={() => navigate("/theories")}
          >
            Theories
          </span>
          <span className="text-[#49719c] text-base font-medium leading-normal">/</span>
          <span className="text-[#141414] text-base font-medium leading-normal">{theory.title}</span>
        </div>
        
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0d141c] leading-tight mb-2">
          {theory.title}
        </h1>
        
        {/* Intro/Description */}
        {theory.intro && (
          <p className="text-[#0d141c] text-base font-normal leading-normal pb-3 pt-1">
            {theory.intro}
          </p>
        )}
        
        {/* ✅ Author and Date - Updated to match your format */}
        <div className="mb-6 text-[#49719c] text-sm">
          {(theory.profiles?.name || theory.author) && <>By {theory.profiles?.name || theory.author} · </>}
          {theory.created_at && (
            <>Published on {new Date(theory.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</>
          )}
        </div>
        
        {/* Image */}
        {theory.image_url && (
          <div className="w-full aspect-[3/2] overflow-hidden rounded-2xl bg-slate-50 mb-8">
            <img
              src={getImageUrl(theory)}
              alt={theory.title}
              className="w-full h-full object-cover rounded-2xl"
              style={{ background: "#f5f7fa" }}
            />
          </div>
        )}
        
        {/* Content/Body */}
        <div
          className="prose prose-lg text-[#0d141c] max-w-none"
          dangerouslySetInnerHTML={{
            __html: theory.content || "<i>No detailed content provided.</i>",
          }}
        />
        
        {/* Tags & Category at the bottom */}
        <div className="flex flex-wrap gap-2 mt-10">
          {theory.category && (
            <span className="inline-block bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded font-semibold uppercase tracking-wide">
              {theory.category}
            </span>
          )}
          {Array.isArray(theory.tags) && theory.tags.length > 0 && (
            theory.tags.map(tag => (
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
