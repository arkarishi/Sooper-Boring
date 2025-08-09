import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import ArticleForm from "../components/forms/ArticleForm";
import JobForm from "../components/forms/JobForm";
import TheoryForm from "../components/forms/TheoryForm";
import VideoForm from "../components/forms/VideoForm";
import SpotlightForm from "../components/forms/SpotlightForm";
import { FileText, Briefcase, Lightbulb, Video, Star, ChevronDown } from "lucide-react";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const handleFormSelect = (value) => {
    setSelectedForm(value);
    setDropdownOpen(false);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 px-4">
        <div className="backdrop-blur-lg bg-white/60 p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl text-center text-gray-700 max-w-md w-full">
          <span className="block text-base sm:text-lg md:text-xl font-bold mb-2">
            🔒 Please log in to access the dashboard.
          </span>
        </div>
      </div>
    );
  }

  const selectedOption = formOptions.find(opt => opt.value === selectedForm);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center py-4 sm:py-6 md:py-8 lg:py-10 px-4">
      <motion.div
        className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto glass-card p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        {/* Responsive Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center text-blue-900 mb-1 tracking-tight">
          Admin Dashboard
        </h1>
        
        {/* Responsive Description */}
        <div className="text-center text-sm sm:text-base md:text-lg text-gray-500 mb-4 sm:mb-6 md:mb-8 px-2">
          Add new <span className="font-semibold text-blue-600">{selectedOption?.label.toLowerCase()}</span> content in style. 
          <span className="hidden sm:inline"> Select the type below.</span>
        </div>

        {/* Responsive Form Selector */}
        <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
          {/* Mobile/Small Tablet: Dropdown */}
          <div className="block md:hidden relative w-full max-w-xs">
            <button
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl shadow-lg border border-gray-200 font-semibold text-black hover:bg-gray-50 transition-all duration-200"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="flex items-center gap-2">
                {selectedOption?.icon}
                <span>{selectedOption?.label}</span>
              </div>
              <ChevronDown 
                className={`w-5 h-5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                {formOptions.map(opt => (
                  <button
                    key={opt.value}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 bg-white transition-all duration-200 text-black"
                    onClick={() => handleFormSelect(opt.value)}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Medium Screens: Compact Buttons */}
          <div className="hidden md:flex lg:hidden bg-white/80 backdrop-blur-xl rounded-2xl shadow gap-1 p-2 border border-neutral-200 flex-wrap justify-center max-w-md">
            {formOptions.map(opt => (
              <button
                key={opt.value}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-sm
                  transition-all duration-200
                  ${selectedForm === opt.value
                    ? "bg-blue-700 text-white shadow-md"
                    : "text-blue-800 hover:bg-blue-100"}
                `}
                onClick={() => setSelectedForm(opt.value)}
              >
                <span className="flex-shrink-0">{opt.icon}</span>
                <span className="hidden xl:inline">{opt.label}</span>
                <span className="xl:hidden">{opt.label.slice(0, 3)}</span>
              </button>
            ))}
          </div>

          {/* Large Screens: Full Buttons */}
          <div className="hidden lg:flex bg-white/80 backdrop-blur-xl rounded-full shadow gap-2 px-3 py-2 border border-neutral-200">
            {formOptions.map(opt => (
              <button
                key={opt.value}
                className={`
                  flex items-center gap-2 px-4 lg:px-5 py-2 rounded-full font-semibold text-base
                  transition-all duration-200
                  ${selectedForm === opt.value
                    ? "bg-blue-700 text-white shadow-md"
                    : "text-blue-800 hover:bg-blue-100"}
                `}
                onClick={() => setSelectedForm(opt.value)}
              >
                <span className="flex-shrink-0">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Form Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedForm}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.33 }}
            className="w-full"
          >
            <div className="max-h-[60vh] sm:max-h-[65vh] md:max-h-[70vh] lg:max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100 rounded-lg">
              {selectedForm === "article" && <ArticleForm />}
              {selectedForm === "job" && <JobForm />}
              {selectedForm === "theory" && <TheoryForm />}
              {selectedForm === "video" && <VideoForm />}
              {selectedForm === "spotlight" && <SpotlightForm />}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}