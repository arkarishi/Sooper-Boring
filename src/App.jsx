import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";

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
  const [session, setSession] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="w-screen min-h-screen flex flex-col w-full bg-neutral-50">
        <Navbar search={search} setSearch={setSearch} session={session} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/articles" element={<Articles search={search} />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route
              path="/dashboard"
              element={
                session ? (
                  <Dashboard session={session} />
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
                session ? (
                  <EditProfile session={session} />
                ) : (
                  <Navigate to="/auth" replace />
                )
              } 
            />
            <Route 
              path="/profile" 
              element={
                session ? (
                  <DetailProfile session={session} />
                ) : (
                  <Navigate to="/auth" replace />
                )
              } 
            />
            <Route 
              path="/profile/:id" 
              element={<DetailProfile session={session} />} 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
