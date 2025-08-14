import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './utils/supabaseClient';

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Theories from "./pages/Theories";
import TheoryDetail from "./pages/TheoryDetail";
import Videos from "./pages/Videos";
import VideoDetail from "./pages/VideoDetail";
import Spotlights from "./pages/Spotlights";
import DetailSpotlights from "./pages/DetailSpotlights";
import EditProfile from "./pages/EditProfile";
import DetailProfile from "./pages/DetailProfile";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false); // Set loading to false after checking
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Show loading while checking auth state
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="w-screen min-h-screen flex flex-col w-full bg-neutral-50">
        <Navbar search={search} setSearch={setSearch} session={user} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
            <Route path="/articles" element={<Articles search={search} />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route
              path="/dashboard"
              element={
                user ? (
                  <Dashboard user={user} />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route path="/jobs" element={<Jobs search={search} />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/theories" element={<Theories search={search} />} />
            <Route path="/theories/:id" element={<TheoryDetail />} />
            <Route path="/videos" element={<Videos search={search} />} />
            <Route path="/videos/:id" element={<VideoDetail />} />
            <Route path="/spotlights" element={<Spotlights search={search} />} />
            <Route path="/spotlights/:id" element={<DetailSpotlights />} />
            <Route 
              path="/edit-profile" 
              element={
                user ? (
                  <EditProfile session={{ user }} />
                ) : (
                  <Navigate to="/auth" replace />
                )
              } 
            />
            <Route 
              path="/profile" 
              element={
                user ? (
                  <DetailProfile session={{ user }} />
                ) : (
                  <Navigate to="/auth" replace />
                )
              } 
            />
            <Route 
              path="/profile/:id" 
              element={<DetailProfile session={user} />} 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
