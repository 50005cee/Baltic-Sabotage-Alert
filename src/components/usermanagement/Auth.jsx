import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';

export default function Auth({ onAuthChange }) {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      onAuthChange(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      onAuthChange(session);
    });

    return () => subscription.unsubscribe();
  }, [onAuthChange]);

  const handleLogin = () => {
    console.log('Login clicked');
  };

  const handleSignUp = () => {
    console.log('Sign up clicked');
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container py-2">
      {session ? (
        <div className="text-white">
          <p className="mb-2 text-sm">Logged in as: {session.user.email}</p>
          <button
            className="w-full px-4 py-2 text-sm text-white bg-purple-600 rounded hover:bg-purple-700 transition-colors"
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Sign Out'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            className="px-4 py-2 text-sm text-white bg-purple-600 rounded hover:bg-purple-700 transition-colors"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Log In'}
          </button>
          <button
            className="px-4 py-2 text-sm text-white bg-purple-600 rounded hover:bg-purple-700 transition-colors"
            onClick={handleSignUp}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
        </div>
      )}
    </div>
  );
}