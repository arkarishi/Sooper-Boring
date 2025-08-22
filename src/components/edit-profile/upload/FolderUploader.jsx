import React from 'react';
import UploadProgress from '../shared/UploadProgress';

export default function FolderUploader({ 
  title, 
  description, 
  onFolderUpload, 
  uploadState, 
  disabled = false,
  uploadKey
}) {
  const renderUploadProgress = () => {
    if (!uploadState || (!uploadState.uploading && uploadState.progress === 0)) {
      return null;
    }
    return <UploadProgress uploadState={uploadState} />;
  };

  return (
    <div className="flex flex-col p-3 sm:p-4">
      <div className="flex flex-col items-center gap-4 sm:gap-6 rounded-xl border-2 border-dashed border-[#ced3e9] px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex max-w-[480px] flex-col items-center gap-2">
          <p className="text-[#0d0f1c] text-base sm:text-lg font-bold leading-tight tracking-[-0.015em] text-center">{title}</p>
          <p className="text-[#0d0f1c] text-sm font-normal leading-normal text-center">{description}</p>
        </div>
        <input
          type="file"
          webkitdirectory="true"
          directory=""
          multiple
          onChange={onFolderUpload}
          disabled={disabled || uploadState?.uploading}
          className="hidden"
          id={uploadKey}
        />
        <button
          type="button"
          onClick={() => document.getElementById(uploadKey)?.click()}
          className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] ${
            uploadState?.uploading || disabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#e6e9f4] text-[#0d0f1c] hover:bg-[#d1d6ed]'
          }`}
          disabled={disabled || uploadState?.uploading}
        >
          <span className="truncate">
            {uploadState?.uploading ? 'Uploading...' : '📁 Add e-Learning Folder'}
          </span>
        </button>
      </div>
      {renderUploadProgress()}
    </div>
  );
}