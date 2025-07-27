import React from 'react';
import images from '../assets/images.png'
function Content() {
  return (
    <div className="text-center py-20 px-4 bg-gradient-to-br from-purple-100 to-indigo-100 min-h-[60vh]">
      <h1 className="text-5xl font-extrabold text-purple-800 mb-4">Master Your Day</h1>
      <p className="text-xl text-gray-700 mb-6">Create. Organize. Complete. Repeat.</p>
      <img
        src={images}
        alt="todo app preview"
        className="mx-auto w-full max-w-md"
      />
    </div>
  );
}

export default Content;
