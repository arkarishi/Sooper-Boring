import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function DashboardGuard({ children }) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkDashboardAccess = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (!user) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // Check if user has dashboard access
        const { data: dashboardUser, error } = await supabase
          .from('dashboard_users')
          .select('email')
          .eq('email', user.email)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking dashboard access:', error);
          setHasAccess(false);
        } else {
          setHasAccess(!!dashboardUser);
        }
      } catch (err) {
        console.error('Dashboard access check failed:', err);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkDashboardAccess();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-9a3 3 0 00-3 3v1m6-4a3 3 0 013 3v1m-6-4h6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600 mb-4">
            Hi {user?.email}! You don't have permission to access the dashboard.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Contact the administrator to request access.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return children;
}