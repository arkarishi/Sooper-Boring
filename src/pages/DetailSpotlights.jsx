import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

const placeholderImg = "https://placehold.co/320x180/eeeeee/cccccc?text=No+Image";

const getImageUrl = (path) => {
  if (!path) return placeholderImg;
  const { data } = supabase.storage.from("spotlight-images").getPublicUrl(path);
  return data?.publicUrl || placeholderImg;
};

export default function DetailSpotlights() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spotlight, setSpotlight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpotlight();
  }, [id]);

  const fetchSpotlight = async () => {
    const { data, error } = await supabase
      .from("spotlights")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching spotlight:", error);
    } else {
      setSpotlight(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center" style={{ fontFamily: '"Newsreader", "Noto Sans", sans-serif' }}>Loading...</div>;
  }

  if (!spotlight) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center" style={{ fontFamily: '"Newsreader", "Noto Sans", sans-serif' }}>Spotlight not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10" style={{ fontFamily: '"Newsreader", "Noto Sans", sans-serif' }}>
      <div className="max-w-6xl mx-auto px-0 sm:px-4">
        {/* Breadcrumb */}
        <div className="flex flex-wrap gap-2 mb-8 mt-12 px-2">
          <span
            className="text-[#58728d] text-base font-normal leading-normal cursor-pointer hover:underline"
            onClick={() => navigate("/spotlights")}
          >
            Spotlights
          </span>
          <span className="text-[#58728d] text-base font-normal leading-normal">/</span>
          <span className="text-[#101419] text-base font-normal leading-normal">{spotlight.name}</span>
        </div>
        
        <div className="flex p-4 @container">
          <div className="flex w-full flex-col gap-4 items-center">
            <div className="flex gap-4 flex-col items-center">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-48 w-48"
                style={{
                  backgroundImage: `url("${getImageUrl(spotlight.image_url)}")`,
                }}
              ></div>
              <div className="flex flex-col items-center justify-center justify-center">
                <p className="text-[#101419] text-2xl font-bold leading-tight text-center">
                  {spotlight.name}
                </p>
                <p className="text-[#58728d] text-lg font-normal leading-normal text-center">
                  {spotlight.position}
                </p>
                <p className="text-[#58728d] text-lg font-normal leading-normal text-center">
                  {spotlight.location}
                </p>
              </div>
            </div>
          </div>
        </div>
        <h2 className="text-[#101419] text-xl font-bold leading-tight px-4 pb-3 pt-5">
          Interview with {spotlight.name}
        </h2>
        <div 
          className="text-[#101419] text-base font-normal leading-normal pb-3 pt-1 px-4 prose prose-base max-w-none"
          dangerouslySetInnerHTML={{ __html: spotlight.body }}
        />
      </div>
    </div>
  );
}