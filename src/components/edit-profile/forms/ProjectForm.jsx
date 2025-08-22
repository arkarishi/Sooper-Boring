import React from 'react';
import FileUploader from '../upload/FileUploader';
import FolderUploader from '../upload/FolderUploader';

export default function ProjectForm({ 
  projectNumber, 
  profile, 
  uploadStates, 
  onInputChange, 
  onFileUpload, 
  onFolderUpload 
}) {
  const prefix = `project${projectNumber}`;
  
  return (
    <div className="border border-[#ced3e9] rounded-xl p-4 bg-white">
      <h3 className="text-[#0d0f1c] text-base font-bold mb-4">Project {projectNumber}</h3>
      
      {/* Project Title */}
      <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Project Title</p>
          <input
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
            value={profile[`${prefix}_title`]}
            onChange={(e) => onInputChange(`${prefix}_title`, e.target.value)}
            placeholder="Enter project title"
          />
        </label>
      </div>

      {/* Project Description */}
      <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Project Description</p>
          <textarea
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] min-h-32 sm:min-h-36 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
            value={profile[`${prefix}_description`]}
            onChange={(e) => onInputChange(`${prefix}_description`, e.target.value)}
            placeholder="Describe your project..."
          />
        </label>
      </div>

      {/* Project Type Selection */}
      <div className="flex flex-wrap gap-2 sm:gap-3 p-3 sm:p-4">
        <label className={`text-xs sm:text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-3 sm:px-4 h-10 sm:h-11 relative cursor-pointer ${
          profile[`${prefix}_type`] === 'Storyboard' ? 'border-[3px] border-[#4264fa] px-2.5 sm:px-3.5' : 'border border-[#ced3e9]'
        } text-[#0d0f1c]`}>
          📄 Storyboard (PDF)
          <input
            type="radio"
            className="invisible absolute"
            name={`${prefix}_type`}
            checked={profile[`${prefix}_type`] === 'Storyboard'}
            onChange={() => {
              onInputChange(`${prefix}_type`, 'Storyboard');
              onInputChange(`${prefix}_folder_url`, '');
            }}
          />
        </label>
        <label className={`text-xs sm:text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-3 sm:px-4 h-10 sm:h-11 relative cursor-pointer ${
          profile[`${prefix}_type`] === 'e-Learning' ? 'border-[3px] border-[#4264fa] px-2.5 sm:px-3.5' : 'border border-[#ced3e9]'
        } text-[#0d0f1c]`}>
          💻 e-Learning (Folder)
          <input
            type="radio"
            className="invisible absolute"
            name={`${prefix}_type`}
            checked={profile[`${prefix}_type`] === 'e-Learning'}
            onChange={() => {
              onInputChange(`${prefix}_type`, 'e-Learning');
              onInputChange(`${prefix}_pdf_url`, '');
            }}
          />
        </label>
      </div>

      {/* Conditional Upload Section for e-Learning */}
      {profile[`${prefix}_type`] === 'e-Learning' && (
        <FolderUploader
          title="Upload e-Learning Project Folder"
          description="Select the entire project folder containing HTML, CSS, JS files"
          onFolderUpload={(e) => onFolderUpload(e, projectNumber, 'folder_url')}
          uploadState={uploadStates[`${prefix}_folder`]}
          uploadKey={`${prefix}_folder`}
        />
      )}

      {/* Conditional Upload Section for Storyboard */}
      {profile[`${prefix}_type`] === 'Storyboard' && (
        <FileUploader
          title="Upload Storyboard PDF"
          description="Select a PDF file containing your storyboard"
          accept=".pdf"
          onFileUpload={(file) => onFileUpload(file, 'project-pdfs', projectNumber, `${prefix}_pdf_url`)}
          uploadState={uploadStates[`${prefix}_pdf`]}
          icon="📄"
          buttonText="Add PDF Storyboard"
          uploadKey={`${prefix}_pdf`}
        />
      )}

      {/* Thumbnail Upload - Always show */}
      <FileUploader
        title="Upload Thumbnail"
        description="Click to select a JPG or PNG image"
        accept="image/*"
        onFileUpload={(file) => onFileUpload(file, 'project-thumbnails', projectNumber, `${prefix}_thumbnail_url`)}
        uploadState={uploadStates[`${prefix}_thumbnail`]}
        icon="🖼️"
        buttonText="Add Thumbnail"
        uploadKey={`${prefix}_thumbnail`}
      />

      {/* Thumbnail Preview */}
      {profile[`${prefix}_thumbnail_url`] && (
        <div className="flex w-full grow bg-[#f8f9fc] p-3 sm:p-4">
          <div className="w-full gap-1 overflow-hidden bg-[#f8f9fc] aspect-[3/2] rounded-xl flex">
            <div
              className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none flex-1"
              style={{backgroundImage: `url("${profile[`${prefix}_thumbnail_url`]}")`}}
            />
          </div>
        </div>
      )}

      {/* File Preview Section */}
      {(profile[`${prefix}_pdf_url`] || profile[`${prefix}_folder_url`]) && (
        <div className="p-3 sm:p-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800 font-medium">File uploaded successfully!</span>
            </div>
            <p className="text-green-700 text-sm">
              {profile[`${prefix}_type`] === 'Storyboard' ? '📄 PDF Storyboard' : '📁 e-Learning Project Folder'} uploaded
            </p>
          </div>
        </div>
      )}
    </div>
  );
}