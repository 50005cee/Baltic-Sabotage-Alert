// src/components/usermanagement/UserAccount.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import { Mail } from 'lucide-react';

const UserAccount = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Try to get user but handle potential errors when Supabase isn't properly initialized
    try {
      // With the newer Supabase JavaScript client, use getUser instead of user()
      const getUser = async () => {
        const { data } = await supabase.auth.getUser();
        setUser(data?.user);
      };
      
      getUser();
    } catch (error) {
      console.warn("Unable to get user:", error);
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("Sign out failed:", error);
    }
    setUser(null);
  };

  if (user) {
    return (
      <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-200">{user.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="px-3 py-1 text-xs text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // If no user is present, return null
  return null;
};

export default UserAccount;