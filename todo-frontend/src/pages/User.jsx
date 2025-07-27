import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Edit, Trash2, Save, XCircle } from 'lucide-react';

// A simple JWT decoder function
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};


function UserProfile() {
  const navigate = useNavigate();
  
  // State for user data, editing mode, and messages
  const [user, setUser] = useState(null);
  // The editData state now includes email
  const [editData, setEditData] = useState({ name: '', number: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get token from localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const decodedToken = decodeToken(token);
    if (!decodedToken || !decodedToken.sub) {
      setError('Invalid token. Please log in again.');
      localStorage.removeItem('token');
      navigate('/login');
      setIsLoading(false);
      return;
    }
    
    const userEmail = decodedToken.sub; // 'sub' is standard for subject, which is the email here

    // --- Fetch User Data ---
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:9090/api/users/${userEmail}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUser(response.data);
        // Populate all fields in editData, including email
        setEditData({ name: response.data.name, number: response.data.number, email: response.data.email });
      } catch (err) {
        setError('Failed to fetch user data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // --- Update User Data ---
  const handleUpdate = async () => {
    setError('');
    setMessage('');
    if (!user || !user.email) return;

    const originalEmail = user.email; // Store the original email to check for changes

    try {
      // The PUT request now sends the full editData object, including the email
      const response = await axios.put(`http://localhost:9090/api/users/${originalEmail}`, editData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // After a successful update, check if the email was changed
      if (originalEmail !== response.data.email) {
        // If email changed, the old token is invalid. Force re-login.
        localStorage.removeItem('token');
        // Redirect to login with a message
        navigate('/login', { state: { message: 'Profile updated successfully! Please log in with your new email.' } });
      } else {
        // If email is the same, just update the UI
        setUser(response.data);
        setIsEditing(false);
        setMessage('Profile updated successfully!');
      }

    } catch (err) {
      // Use the error message from the backend if available
      const errorMessage = err.response?.data?.error || 'Failed to update profile. Please check your input.';
      setError(errorMessage);
      console.error(err);
    }
  };

  // --- Delete User Account ---
  const handleDelete = async () => {
    setError('');
    setMessage('');
    if (!user || !user.email) return;

    try {
      await axios.delete(`http://localhost:9090/api/users/${user.email}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // On successful deletion, log out the user
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      setError('Failed to delete account. Please try again.');
      console.error(err);
      setShowDeleteConfirm(false); // Close the modal on error
    }
  };
  
  // --- UI Render Logic ---
  if (isLoading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 flex items-center justify-center">
            <div className="text-xl font-semibold text-gray-700">Loading your profile...</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 pb-2">
          User Profile
        </h1>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg p-8">
          {/* --- Message and Error Display --- */}
          {error && <div className="bg-red-100 text-red-800 font-semibold p-4 rounded-lg text-center mb-6 shadow-md">{error}</div>}
          {message && <div className="bg-green-100 text-green-800 font-semibold p-4 rounded-lg text-center mb-6 shadow-md">{message}</div>}

          {user && (
            <div className="space-y-6">
              {/* --- Display or Edit Form --- */}
              {isEditing ? (
                // --- EDITING VIEW ---
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" name="name" value={editData.name} onChange={handleInputChange} className="w-full p-3 bg-white/80 border-2 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value={editData.email} onChange={handleInputChange} className="w-full p-3 bg-white/80 border-2 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="text" name="number" value={editData.number} onChange={handleInputChange} className="w-full p-3 bg-white/80 border-2 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
                  </div>
                  <div className="flex justify-end gap-4 pt-4">
                    <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold transition"> <XCircle size={18} /> Cancel</button>
                    <button onClick={handleUpdate} className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 font-semibold transition"> <Save size={18} /> Save Changes</button>
                  </div>
                </div>
              ) : (
                // --- DISPLAY VIEW ---
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-lg border border-gray-200">
                    <User className="text-purple-600" size={24} />
                    <span className="text-lg text-gray-800 font-medium">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-lg border border-gray-200">
                    <Mail className="text-purple-600" size={24} />
                    <span className="text-lg text-gray-800 font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-lg border border-gray-200">
                    <Phone className="text-purple-600" size={24} />
                    <span className="text-lg text-gray-800 font-medium">{user.number || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:scale-[1.02] transform transition-all duration-200 shadow-md"> <Edit size={18} /> Edit Profile </button>
                  </div>
                </div>
              )}
              
              <hr className="my-8 border-gray-200"/>

              {/* --- Delete Account Section --- */}
              <div className="bg-red-50/70 border-l-4 border-red-500 p-4 rounded-r-lg">
                <h3 className="text-xl font-semibold text-red-800">Delete Account</h3>
                <p className="text-red-700 mt-1">Once you delete your account, there is no going back. Please be certain.</p>
                <div className="text-right mt-4">
                  <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition shadow-md hover:shadow-lg hover:scale-[1.02] transform duration-200"> <Trash2 size={18} /> Delete My Account </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Delete Confirmation Modal --- */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full transform transition-all scale-100">
            <h3 className="text-2xl font-bold text-center text-gray-800">Confirm Deletion</h3>
            <p className="text-center text-gray-600 my-4">This action cannot be undone. All your tasks and user data will be permanently deleted.</p>
            <div className="flex justify-center gap-4 mt-6">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-6 py-2 rounded-md bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition">Cancel</button>
              <button onClick={handleDelete} className="px-6 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-md">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
