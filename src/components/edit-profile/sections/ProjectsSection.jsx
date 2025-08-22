import React from 'react';
import ProjectForm from '../forms/ProjectForm';

export default function ProjectsSection({ 
  profile, 
  uploadStates, 
  onInputChange, 
  onFileUpload, 
  onFolderUpload 
}) {
  return (
    <>
      <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] px-3 sm:px-4 pb-3 pt-5">
        Projects
      </h2>
      
      <div className="px-3 sm:px-4 py-3 space-y-6">
        <ProjectForm
          projectNumber={1}
          profile={profile}
          uploadStates={uploadStates}
          onInputChange={onInputChange}
          onFileUpload={onFileUpload}
          onFolderUpload={onFolderUpload}
        />
        
        <ProjectForm
          projectNumber={2}
          profile={profile}
          uploadStates={uploadStates}
          onInputChange={onInputChange}
          onFileUpload={onFileUpload}
          onFolderUpload={onFolderUpload}
        />
      </div>

      <div className="px-3 sm:px-4 py-2">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-green-800 text-sm font-medium">Project Tips</p>
              <p className="text-green-700 text-xs mt-1">
                • Choose meaningful project titles that showcase your skills<br/>
                • For e-Learning projects, upload the entire project folder<br/>
                • For Storyboards, upload a PDF file<br/>
                • Add attractive thumbnails to make your projects stand out
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}