// src/components/usermanagement/UserAccount.jsx
import React, { useState } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import { Mail } from 'lucide-react';

const UserAccount = () => {
  const [user, setUser] = useState(supabase.auth.user());

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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

  // If no user is present, simply return null (the Auth component will be rendered by SidePanel)
  return null;
};

export default UserAccount;
