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
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-50 py-10" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb like JobDetail */}
        <div className="flex flex-wrap gap-2 mb-4 px-2">
          <span
            className="text-neutral-500 text-base font-medium leading-normal cursor-pointer hover:underline"
            onClick={() => navigate("/theories")}
          >
            Theories
          </span>
          <span className="text-neutral-500 text-base font-medium leading-normal">/</span>
          <span className="text-[#141414] text-base font-medium leading-normal">{theory.title}</span>
        </div>
        {/* Banner Image */}
        <div
          className="w-full rounded-xl overflow-hidden flex flex-col justify-end min-h-80 mb-8"
          style={{
            backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 25%), url(${getImageUrl(theory.image_url)})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="flex p-6">
            <h1 className="text-white tracking-light text-[28px] font-bold leading-tight drop-shadow-lg">{theory.title}</h1>
          </div>
        </div>
        {/* Date */}
        <div className="mb-6 text-gray-400 text-base px-4">
          {theory.created_at && (
            <>{new Date(theory.created_at).toLocaleDateString()}</>
          )}
        </div>
        {/* Intro/Description */}
        {theory.intro && (
          <div className="text-[#141414] text-base font-normal leading-normal pb-3 pt-1 px-4">
            {theory.intro}
          </div>
        )}
        {/* Principles */}
        {Array.isArray(theory.principles) && theory.principles.length > 0 && (
          <>
            <h2 className="text-[#141414] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Principles
            </h2>
            <ul className="list-disc list-inside text-gray-700 mt-2 px-4">
              {theory.principles.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </>
        )}
        {/* Applications */}
        {Array.isArray(theory.applications) && theory.applications.length > 0 && (
          <>
            <h2 className="text-[#141414] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Applications
            </h2>
            <ul className="list-disc list-inside text-gray-700 mt-2 px-4">
              {theory.applications.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </>
        )}

        {/* Examples */}
        {Array.isArray(theory.examples) && theory.examples.length > 0 && (
          <>
            <h2 className="text-[#141414] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Examples
            </h2>
            <ul className="list-disc list-inside text-gray-700 mt-2 px-4">
              {theory.examples.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
