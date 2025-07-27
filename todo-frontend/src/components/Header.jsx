import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, ClipboardList } from 'lucide-react'; // using lucide-react icons

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex justify-center items-center gap-6 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 shadow-inner">
      {/* User Button */}
      <button
        onClick={() => navigate('/user')}
        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-md ${
          isActive('/user')
            ? 'bg-purple-600 text-white'
            : 'bg-white text-purple-700 hover:bg-purple-100'
        }`}
      >
        <User size={18} />
        User
      </button>

      {/* Task Button */}
      <button
        onClick={() => navigate('/task')}
        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-md ${
          isActive('/task')
            ? 'bg-purple-600 text-white'
            : 'bg-white text-purple-700 hover:bg-purple-100'
        }`}
      >
        <ClipboardList size={18} />
        Task
      </button>
    </div>
  );
}

export default Header;
