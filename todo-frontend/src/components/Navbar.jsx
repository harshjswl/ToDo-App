import React from 'react';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  // The token is your indicator of a logged-in user
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    // We should reload to ensure all components re-check localStorage
    window.location.reload(); 
  };

  return (
    <div>
      <nav className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md">
        <div className="text-3xl font-bold tracking-wide cursor-pointer" onClick={() => navigate('/')}>
          📝 TODO
        </div>
        <div className="space-x-4">
          {token ? (
            <button
              className="bg-white text-purple-700 font-semibold px-4 py-2 rounded-md shadow hover:bg-purple-100 transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <>
              <button
                className="bg-white text-purple-700 font-semibold px-4 py-2 rounded-md shadow hover:bg-purple-100 transition"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className="bg-white text-purple-700 font-semibold px-4 py-2 rounded-md shadow hover:bg-purple-100 transition"
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>
      
      {token && <Header />}
    </div>
  );
}

export default Navbar;