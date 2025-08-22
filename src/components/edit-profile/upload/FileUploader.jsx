import React from 'react';
import UploadProgress from '../shared/UploadProgress';

export default function FileUploader({ 
  title, 
  description, 
  accept, 
  onFileUpload, 
  uploadState, 
  disabled = false, 
  icon = "📄",
  buttonText = "Add File",
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
          accept={accept}
          onChange={(e) => onFileUpload(e.target.files[0])}
          className="hidden"
          id={uploadKey}
          disabled={disabled || uploadState?.uploading}
        />
        <label
          htmlFor={uploadKey}
          className={`flex min-w-[84px] max-w-[320px] sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-bold leading-normal tracking-[0.015em] ${
            uploadState?.uploading || disabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-[#e6e9f4] text-[#0d0f1c] hover:bg-[#d1d6ed]'
          }`}
        >
          <span className="truncate">
            {uploadState?.uploading ? 'Uploading...' : `${icon} ${buttonText}`}
          </span>
        </label>
      </div>
      {renderUploadProgress()}
    </div>
  );
}