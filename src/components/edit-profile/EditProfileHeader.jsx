import React from 'react';

export default function EditProfileHeader({ profile, hasUnsavedChanges, onSave }) {
  return (
    <div className="flex p-3 sm:p-4">
      <div className="flex w-full flex-col gap-3 sm:gap-4 items-center">
        <div className="flex gap-3 sm:gap-4 flex-col items-center">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-24 w-24 sm:min-h-28 sm:w-28 md:min-h-32 md:w-32"
            style={{backgroundImage: `url("${profile.profile_photo_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBENKwH5nxkytSSvv9toA494x-gAePUj0MlHpaEoRNu-6u_LkhO7frHlxdTZtB-RDN91ClkxwhxLCKSuc0DGiCASQpdsKUgErw98KJxZHMVWhaHKyUmskZzRk-OShdv-uHb4okA-_yrwS2qshQDp7iJrQusoYRbd87JF-01zdeKwzKDuG-aMbLYrNWjXcqAFxq-ACDXoNhoavNiJVXs8dtDM3AureQYuWelAgCJK7Xr3zlcda9WrJs8pQ_DsJVwNdF79VTIjG2XhbE'}")`}}
          />
          <div className="flex flex-col items-center justify-center px-2">
            <p className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">
              {profile.name || 'Your Name'}
            </p>
            <p className="text-[#47579e] text-sm sm:text-base font-normal leading-normal text-center">
              {profile.title || 'Your Title'}
            </p>
            <p className="text-[#47579e] text-sm sm:text-base font-normal leading-normal text-center">
              {profile.location || 'Your Location'}
            </p>
          </div>
        </div>
        <button
          onClick={onSave}
          className={`flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-bold leading-normal tracking-[0.015em] w-full max-w-[320px] sm:max-w-[480px] ${
            hasUnsavedChanges 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-[#e6e9f4] text-[#0d0f1c] hover:bg-[#d1d6ed]'
          }`}
        >
          <span className="truncate">
            {hasUnsavedChanges ? 'Save Changes' : 'Save Profile'}
          </span>
        </button>
      </div>
    </div>
  );
}