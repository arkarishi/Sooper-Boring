UploadProgress.jsx
import React from 'react';

export default function UploadProgress({ uploadState }) {
  if (!uploadState.uploading && uploadState.progress === 0) return null;

  return (
    <div className="px-3 sm:px-4 py-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm font-medium text-[#0d0f1c]">
          {uploadState.uploading ? 'Uploading...' : 'Upload Complete'}
        </span>
        <span className="text-xs sm:text-sm text-[#47579e]">{Math.round(uploadState.progress)}%</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-[#ced3e9] rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            uploadState.progress === 100 ? 'bg-green-500' : 'bg-[#4264fa]'
          }`}
          style={{ width: `${uploadState.progress}%` }}
        />
      </div>

      {/* File List for Folder Uploads */}
      {uploadState.files && uploadState.files.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-[#47579e] mb-2">Files ({uploadState.files.length}):</p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {uploadState.files.map((file, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-[#0d0f1c] truncate flex-1 mr-2">{file.name}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  file.status === 'completed' ? 'bg-green-100 text-green-800' :
                  file.status === 'uploading' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {file.status === 'completed' ? '✓' : 
                   file.status === 'uploading' ? '⟳' : '○'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadState.progress === 100 && !uploadState.uploading && (
        <div className="flex items-center gap-2 mt-2">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs sm:text-sm text-green-600 font-medium">Upload successful!</span>
        </div>
      )}
    </div>
  );
}