import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-14 px-2 sm:px-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-blue-700 hover:underline"
      >
        <ArrowLeft size={22} /> Back to Theories
      </button>
      <div className="max-w-5xl sm:max-w-6xl mx-auto bg-white p-0 sm:p-16 p-4 rounded-3xl shadow-2xl border border-neutral-200 transition-all duration-300">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{theory.title}</h1>
        {theory.subtitle && (
          <div className="mb-3 text-lg text-gray-500">{theory.subtitle}</div>
        )}
        <div className="mb-6 text-gray-400 text-base">
          {theory.created_at && (
            <>{new Date(theory.created_at).toLocaleDateString()}</>
          )}
        </div>
        <img
          src={getImageUrl(theory.image_url)}
          alt={theory.title}
          className="rounded-2xl mb-10 w-full max-h-[600px] object-cover border"
        />
        <div className="text-xl text-gray-700 mb-8">{theory.intro}</div>
        {Array.isArray(theory.principles) && theory.principles.length > 0 && (
            <div className="mb-6">
                <div className="font-semibold text-blue-900 mb-2 bg-blue-100 px-2 py-1 rounded inline-block">Principles:</div>
                <ul className="list-disc list-inside text-gray-700 mt-2">
                {theory.principles.map((item, idx) => (
                    <li key={idx}>{item}</li>
                ))}
                </ul>
            </div>
            )}
            {Array.isArray(theory.applications) && theory.applications.length > 0 && (
            <div className="mb-6">
                <div className="font-semibold text-blue-900 mb-2 bg-blue-100 px-2 py-1 rounded inline-block">Applications:</div>
                <ul className="list-disc list-inside text-gray-700 mt-2">
                {theory.applications.map((item, idx) => (
                    <li key={idx}>{item}</li>
                ))}
                </ul>
            </div>
            )}
            {Array.isArray(theory.examples) && theory.examples.length > 0 && (
            <div className="mb-6">
                <div className="font-semibold text-blue-900 mb-2 bg-blue-100 px-2 py-1 rounded inline-block">Examples:</div>
                <ul className="list-disc list-inside text-gray-700 mt-2">
                {theory.examples.map((item, idx) => (
                    <li key={idx}>{item}</li>
                ))}
                </ul>
            </div>
            )}
      </div>
    </div>
  );
}
