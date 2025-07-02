import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail"; // <-- Add this import
import Theories from "./pages/Theories";
import TheoryDetail from "./pages/TheoryDetail";
import Videos from "./pages/Videos";
import VideoDetail from "./pages/VideoDetail";

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
      <div className="w-screen min-h-screen flex flex-col w-full bg-neutral-50">
        <Navbar search={search} setSearch={setSearch} session={session} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route
              path="/dashboard"
              element={
                session ? <Dashboard session={session} /> : <Navigate to="/auth" replace />
              }
            />
            <Route path="/jobs" element={<Jobs search={search} />} />
            <Route path="/jobs/:id" element={<JobDetail />} /> {/* <-- Add this line */}
            <Route path="/theories" element={<Theories />} />
            <Route path="/theories/:id" element={<TheoryDetail />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/videos/:id" element={<VideoDetail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
