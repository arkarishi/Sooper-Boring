import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    };

    checkUser();
  }, [navigate]);

  // Handle sign in/up
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isLogin) {
      // Sign In - Allow anyone
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      
      if (error) {
        setError(error.message);
        setLoading(false);
      } else if (data.user) {
        navigate("/");
        setLoading(false);
      }
    } else {
      // Sign Up - Allow anyone
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        alert("Check your email for the confirmation link!");
        setIsLogin(true);
        setLoading(false);
      }
    }
  };

  // Handle Google OAuth - Allow anyone
  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Monitor auth state changes
  useEffect(() => {
    const handleAuthStateChange = async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Allow anyone to sign in, dashboard access will be controlled separately
        navigate("/");
        setLoading(false);
      }
      
      if (event === 'SIGNED_OUT') {
        setLoading(false);
        setError("");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur rounded-2xl shadow-xl p-8 border border-neutral-100">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">
          {isLogin ? "Sign In" : "Create Account"}
        </h2>
        <p className="text-center text-gray-500 mb-6">
          {isLogin ? "Welcome back to Sooper Boring!" : "Start your journey with us."}
        </p>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-neutral-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-neutral-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl hover:bg-blue-700 transition shadow"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button
            type="button"
            className="text-blue-600 hover:underline text-sm font-medium"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </div>
        
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-400">OR</span>
          </div>
        </div>
        
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-neutral-50 hover:bg-neutral-200 text-gray-800 font-semibold py-2 rounded-xl shadow transition"
        >
          <svg height={20} width={20} viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.72 1.23 9.22 3.26l6.88-6.88C36.62 2.07 30.71 0 24 0 14.82 0 6.64 5.17 2.48 13.02l8.04 6.24C12.67 13.24 17.9 9.5 24 9.5z"/><path fill="#34A853" d="M46.53 24.63c0-1.69-.14-3.31-.41-4.84H24v9.16h12.75c-.55 2.97-2.16 5.47-4.66 7.16l7.25 5.62C44.67 36.79 46.53 31.28 46.53 24.63z"/><path fill="#FBBC05" d="M10.52 28.35c-1.17-3.44-1.17-7.26 0-10.7l-8.04-6.24C.65 16.13 0 20 0 24s.65 7.87 2.48 12.59l8.04-6.24z"/><path fill="#EA4335" d="M24 47.5c6.71 0 12.62-2.17 16.97-5.93l-7.25-5.62c-2.02 1.37-4.61 2.17-7.53 2.17-6.1 0-11.32-3.74-13.48-9.07l-8.04 6.24C6.64 42.83 14.82 47.5 24 47.5z"/></g></svg>
          {loading ? "Loading..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}