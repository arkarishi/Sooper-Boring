import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileHeader({ profile, canEdit }) {
  const navigate = useNavigate();

  return (
    <div className="flex p-3 sm:p-4">
      <div className="flex w-full flex-col gap-3 sm:gap-4 items-center">
        <div className="flex gap-3 sm:gap-4 flex-col items-center">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-24 w-24 sm:min-h-28 sm:w-28 md:min-h-32 md:w-32"
            style={{
              backgroundImage: `url("${profile.profile_photo_url || 'https://via.placeholder.com/128x128/e6e9f4/0d0f1c?text=No+Photo'}")`,
              backgroundColor: "#e6e9f4"
            }}
          />
          
          <div className="flex flex-col items-center justify-center px-2">
            <p className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">
              {profile.name || 'No Name Set'}
            </p>
            <p className="text-[#47579e] text-sm sm:text-base font-normal leading-normal text-center mt-1">
              {profile.title || 'No Title Set'}
            </p>
            <p className="text-[#47579e] text-sm sm:text-base font-normal leading-normal text-center mt-1">
              {profile.location || 'No Location Set'}
            </p>
          </div>
        </div>
        
        {canEdit ? (
          <button
            onClick={() => navigate('/edit-profile')}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 sm:h-12 px-4 sm:px-6 bg-[#e6e9f4] text-[#0d0f1c] text-sm sm:text-base font-bold leading-normal tracking-[0.015em] w-full max-w-[320px] sm:max-w-[480px]"
          >
            <span className="truncate">Edit Profile</span>
          </button>
        ) : (
          <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 sm:h-12 px-4 sm:px-6 bg-[#e6e9f4] text-[#0d0f1c] text-sm sm:text-base font-bold leading-normal tracking-[0.015em] w-full max-w-[320px] sm:max-w-[480px]">
            <span className="truncate">Ask For Referral</span>
          </button>
        )}
      </div>
    </div>
  );
}