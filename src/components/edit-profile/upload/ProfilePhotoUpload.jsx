import React from 'react';
import UploadProgress from '../shared/UploadProgress';

export default function ProfilePhotoUpload({ profile, uploadStates, onFileUpload }) {
  const renderUploadProgress = (uploadKey) => {
    const uploadState = uploadStates[uploadKey];
    if (!uploadState || (!uploadState.uploading && uploadState.progress === 0)) {
      return null;
    }
    return <UploadProgress uploadState={uploadState} />;
  };

  return (
    <div className="flex flex-col p-3 sm:p-4">
      <div className="flex flex-col items-center gap-4 sm:gap-6 rounded-xl border-2 border-dashed border-[#ced3e9] px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex max-w-[480px] flex-col items-center gap-2">
          <p className="text-[#0d0f1c] text-base sm:text-lg font-bold leading-tight tracking-[-0.015em] text-center">Upload Profile Photo</p>
          <p className="text-[#0d0f1c] text-sm font-normal leading-normal text-center">Click to select a JPG or PNG image</p>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFileUpload(e.target.files[0], 'profile-photos', 'profile', 'profile_photo_url')}
          className="hidden"
          id="profile-photo-upload"
          disabled={uploadStates.profile_photo?.uploading}
        />
        <label
          htmlFor="profile-photo-upload"
          className={`flex min-w-[84px] max-w-[320px] sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-bold leading-normal tracking-[0.015em] ${
            uploadStates.profile_photo?.uploading 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-[#e6e9f4] text-[#0d0f1c] hover:bg-[#d1d6ed]'
          }`}
        >
          <span className="truncate">
            {uploadStates.profile_photo?.uploading ? 'Uploading...' : '🖼️ Add Profile Photo'}
          </span>
        </label>
      </div>
      {renderUploadProgress('profile_photo')}
      
      {profile.profile_photo_url && (
        <div className="flex w-full grow bg-[#f8f9fc] p-3 sm:p-4">
          <div className="w-full gap-1 overflow-hidden bg-[#f8f9fc] aspect-square rounded-xl flex max-w-[200px] mx-auto">
            <div
              className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none flex-1"
              style={{backgroundImage: `url("${profile.profile_photo_url}")`}}
            />
          </div>
        </div>
      )}
    </div>
  );
}