import React from 'react';

export default function ProjectCard({ project, projectNumber }) {
  const title = project.title || `Project ${projectNumber}`;
  const description = project.description || 'No description provided.';
  
  const handleViewProject = () => {
    const url = project.type === 'Storyboard' ? project.pdf_url : project.folder_url;
    if (url) window.open(url, '_blank');
  };

  const hasViewableContent = (
    (project.type === 'e-Learning' && project.folder_url) || 
    (project.type === 'Storyboard' && project.pdf_url)
  );

  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 border border-[#ced3e9] rounded-xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-start justify-between gap-4 lg:gap-6">
        <div className="flex flex-1 flex-col gap-3 sm:gap-4 min-w-0">
          <div className="flex flex-col gap-1 sm:gap-2">
            <p className="text-[#0d0f1c] text-sm sm:text-base font-bold leading-tight">
              {title}
            </p>
            <p className="text-[#47579e] text-xs sm:text-sm font-normal leading-normal">
              {description}
            </p>
            {project.type && (
              <span className="inline-block bg-[#e6e9f4] text-[#0d0f1c] px-2 sm:px-3 py-1 rounded-full text-xs font-medium mt-1 sm:mt-2 w-fit">
                {project.type === 'Storyboard' ? '📄 Storyboard' : '💻 e-Learning'}
              </span>
            )}
          </div>
          
          {hasViewableContent && (
            <button 
              onClick={handleViewProject}
              className="flex min-w-[84px] max-w-[200px] sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 sm:h-10 px-3 sm:px-4 bg-[#e6e9f4] text-[#0d0f1c] text-xs sm:text-sm font-medium leading-normal w-fit"
            >
              <span className="truncate">
                {project.type === 'Storyboard' ? '📄 View PDF' : '💻 View Project'}
              </span>
            </button>
          )}
        </div>
        
        {project.thumbnail_url && (
          <div className="w-full lg:w-auto flex-shrink-0 max-w-full lg:max-w-[300px] xl:max-w-[350px]">
            <img
              src={project.thumbnail_url}
              alt={`${title} thumbnail`}
              className="w-full h-48 sm:h-52 lg:h-44 xl:h-48 object-cover rounded-xl border border-[#ced3e9]"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-full h-48 sm:h-52 lg:h-44 xl:h-48 bg-gray-100 rounded-xl border border-[#ced3e9] items-center justify-center hidden">
              <span className="text-gray-500 text-sm">Image not available</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}