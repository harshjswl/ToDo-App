import React from 'react';

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center py-6 m-0">
      <p className="font-semibold text-lg">© 2025 Harsh Jaiswal</p>
      <p className="mt-2 space-x-4">
        <a href="https://www.linkedin.com/in/harshjaiswal04/" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-gray-200">
          LinkedIn
        </a>
        <a href="https://github.com/harshjswl" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-gray-200">
          GitHub
        </a>
        <span className="italic">ITS-ME</span>
      </p>
    </footer>
  );
}

export default Footer;
