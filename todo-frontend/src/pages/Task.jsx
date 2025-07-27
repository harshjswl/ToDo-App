import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Save, XCircle, CheckCircle, Circle } from 'lucide-react';

function TaskPage() {
  const navigate = useNavigate();

  // State management
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for the creation form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  
  // State for editing
  const [editingTask, setEditingTask] = useState(null); // Holds the entire task object being edited
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // Holds the task object to be deleted

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Memoized function to create auth headers
  const getAuthHeaders = useCallback(() => {
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  }, [token]);

  // --- Fetch all tasks for the user ---
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:9090/api/tasks/all', getAuthHeaders());
        // Sort tasks to show incomplete ones first
        const sortedTasks = response.data.sort((a, b) => a.completed - b.completed);
        setTasks(sortedTasks);
      } catch (err) {
        setError('Failed to fetch tasks. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [token, navigate, getAuthHeaders]);

  // --- Handle Task Creation ---
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setError('Task title is required.');
      return;
    }
    setError('');

    const taskData = {
      title: newTaskTitle,
      description: newTaskDescription,
      completed: false
    };

    try {
      const response = await axios.post('http://localhost:9090/api/tasks/create', taskData, getAuthHeaders());
      setTasks(prevTasks => [response.data, ...prevTasks]); // Add new task to the top
      setNewTaskTitle('');
      setNewTaskDescription('');
    } catch (err) {
      setError('Failed to create task.');
      console.error(err);
    }
  };

  // --- Handle Task Deletion ---
  const handleDeleteTask = async (taskToDelete) => {
    try {
      await axios.delete(`http://localhost:9090/api/tasks/${taskToDelete.id}`, getAuthHeaders());
      setTasks(tasks.filter(task => task.id !== taskToDelete.id));
      setShowDeleteConfirm(null); // Close modal
    } catch (err) {
      setError('Failed to delete task.');
      console.error(err);
    }
  };

  // --- Handle Task Update ---
  const handleUpdateTask = async () => {
    if (!editingTask || !editingTask.title.trim()) {
      setError("Title cannot be empty.");
      return;
    }
    setError('');

    const taskData = {
      title: editingTask.title,
      description: editingTask.description,
      completed: editingTask.completed
    };

    try {
      const response = await axios.put(`http://localhost:9090/api/tasks/${editingTask.id}`, taskData, getAuthHeaders());
      setTasks(tasks.map(task => (task.id === editingTask.id ? response.data : task)));
      setEditingTask(null); // Exit editing mode
    } catch (err) {
      setError('Failed to update task.');
      console.error(err);
    }
  };

  // --- Handle Toggling Completion Status ---
  const handleToggleComplete = async (taskToToggle) => {
    const updatedTask = { ...taskToToggle, completed: !taskToToggle.completed };
    
    const taskData = {
      title: updatedTask.title,
      description: updatedTask.description,
      completed: updatedTask.completed
    };

    try {
      const response = await axios.put(`http://localhost:9090/api/tasks/${taskToToggle.id}`, taskData, getAuthHeaders());
      const updatedTasks = tasks.map(task => (task.id === taskToToggle.id ? response.data : task));
      // Re-sort after updating completion status
      setTasks(updatedTasks.sort((a, b) => a.completed - b.completed));
    } catch (err) {
      setError('Failed to update task status.');
      console.error(err);
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 flex items-center justify-center">
            <div className="text-xl font-semibold text-gray-700">Loading your tasks...</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 pb-2">
          My Tasks
        </h1>

        {/* --- Create Task Form --- */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
            Add a New Task
          </h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What's your next task?"
              className="w-full p-3 bg-white/80 border-2 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Add a little more detail..."
              rows="3"
              className="w-full p-3 bg-white/80 border-2 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg hover:shadow-lg hover:scale-[1.02] transform transition-all duration-200 shadow-md">
              <Plus size={24} /> Add Task
            </button>
          </form>
        </div>

        {error && <div className="bg-red-100 text-red-800 font-semibold p-4 rounded-lg text-center mb-6 shadow-md">{error}</div>}

        {/* --- Task List --- */}
        <div className="space-y-4">
          {tasks.length > 0 ? tasks.map(task => (
            <div key={task.id} className={`
              bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4 transition-all duration-300 
              border-l-4 ${task.completed ? 'border-green-500' : 'border-purple-500'}
              hover:shadow-xl hover:scale-[1.02] transform
            `}>
              {editingTask && editingTask.id === task.id ? (
                // --- Editing View ---
                <div className="space-y-3">
                  <input type="text" value={editingTask.title} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <textarea value={editingTask.description} onChange={(e) => setEditingTask({...editingTask, description: e.target.value})} rows="2" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <div className="flex justify-end gap-3 mt-2">
                    <button onClick={() => setEditingTask(null)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold transition"><XCircle size={18} /> Cancel</button>
                    <button onClick={handleUpdateTask} className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 font-semibold transition"><Save size={18} /> Save</button>
                  </div>
                </div>
              ) : (
                // --- Display View ---
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-grow">
                    <button onClick={() => handleToggleComplete(task)} className="p-1">
                      {task.completed ? <CheckCircle size={28} className="text-green-500 cursor-pointer" /> : <Circle size={28} className="text-gray-400 hover:text-purple-500 cursor-pointer transition-colors" />}
                    </button>
                    <div className={`flex-grow ${task.completed ? 'text-gray-500' : ''}`}>
                      <h3 className={`text-xl font-semibold text-gray-800 ${task.completed ? 'line-through' : ''}`}>{task.title}</h3>
                      {task.description && <p className={`text-gray-600 mt-1 ${task.completed ? 'line-through' : ''}`}>{task.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setEditingTask(task)} className="p-2 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"><Edit size={20} /></button>
                    <button onClick={() => setShowDeleteConfirm(task)} className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"><Trash2 size={20} /></button>
                  </div>
                </div>
              )}
            </div>
          )) : (
            <div className="text-center text-gray-500 py-16 bg-white/50 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold">All tasks completed!</h3>
              <p className="mt-2">Ready to add a new one?</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Delete Confirmation Modal --- */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full transform transition-all scale-100">
            <h3 className="text-2xl font-bold text-center text-gray-800">Confirm Deletion</h3>
            <p className="text-center text-gray-600 my-4">Are you sure you want to delete this task? This action cannot be undone.</p>
            <p className="text-center font-semibold text-purple-700 bg-purple-100 rounded-md p-2 my-4">"{showDeleteConfirm.title}"</p>
            <div className="flex justify-center gap-4 mt-6">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-6 py-2 rounded-md bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition">Cancel</button>
              <button onClick={() => handleDeleteTask(showDeleteConfirm)} className="px-6 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-md">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskPage;
