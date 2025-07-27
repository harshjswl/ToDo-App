import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Content from './components/Contant';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import User from './pages/User';
import Task from './pages/Task';

function App() {

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Content />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={<User />} />
        <Route path="/task" element={<Task />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
