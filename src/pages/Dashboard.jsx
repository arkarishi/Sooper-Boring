import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import ArticleForm from "../components/forms/ArticleForm";
import JobForm from "../components/forms/JobForm";
import TheoryForm from "../components/forms/TheoryForm";
import VideoForm from "../components/forms/VideoForm";
import SpotlightForm from "../components/forms/SpotlightForm";
import { FileText, Briefcase, Lightbulb, Video, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formOptions = [
  { label: "Article", value: "article", icon: <FileText size={18} /> },
  { label: "Job", value: "job", icon: <Briefcase size={18} /> },
  { label: "Theory", value: "theory", icon: <Lightbulb size={18} /> },
  { label: "Video", value: "video", icon: <Video size={18} /> },
  { label: "Spotlight", value: "spotlight", icon: <Star size={18} /> },
];

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [selectedForm, setSelectedForm] = useState("article");

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
        <div className="backdrop-blur-lg bg-white/60 p-10 rounded-2xl shadow-2xl text-center text-gray-700">
          <span className="block text-lg font-bold mb-2">🔒 Please log in to access the dashboard.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center py-10">
      <motion.div
        className="w-full max-w-2xl mx-auto glass-card p-8 rounded-3xl shadow-2xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-1 tracking-tight">
          Admin Dashboard
        </h1>
        <div className="text-center text-lg text-gray-500 mb-8">
          Add new <span className="font-semibold text-blue-600">{formOptions.find(f => f.value === selectedForm)?.label.toLowerCase()}</span> content in style. Select the type below.
        </div>

        {/* Stylish dropdown */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white/80 backdrop-blur-xl rounded-full shadow gap-2 px-2 py-2 border border-neutral-200">
            {formOptions.map(opt => (
              <button
                key={opt.value}
                className={`
                  flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-base
                  transition 
                  ${selectedForm === opt.value
                    ? "bg-blue-700 text-white shadow"
                    : "text-blue-800 hover:bg-blue-100"}
                `}
                onClick={() => setSelectedForm(opt.value)}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Animated form swap */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedForm}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.33 }}
          >
            {selectedForm === "article" && <ArticleForm />}
            {selectedForm === "job" && <JobForm />}
            {selectedForm === "theory" && <TheoryForm />}
            {selectedForm === "video" && <VideoForm />}
            {selectedForm === "spotlight" && <SpotlightForm />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Glassmorphism utility (add this to your global CSS or Tailwind config if not present)
