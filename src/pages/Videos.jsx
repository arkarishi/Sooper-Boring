// Videos.jsx
import React from "react";

const Videos = () => {
  return (
    <div className="p-8 w-screen mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Explore Our Videos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <iframe
          className="w-full h-64"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="YouTube video"
          allowFullScreen
        ></iframe>
        <iframe
          className="w-full h-64"
          src="https://www.youtube.com/embed/3fumBcKC6RE"
          title="YouTube video"
          allowFullScreen
        ></iframe>
        <iframe
          className="w-full h-64"
          src="https://www.youtube.com/embed/tgbNymZ7vqY"
          title="YouTube video"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default Videos;
