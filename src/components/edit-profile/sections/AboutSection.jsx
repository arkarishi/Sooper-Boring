import React from 'react';

export default function AboutSection({ profile, onInputChange }) {
  return (
    <>
      <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] px-3 sm:px-4 pb-3 pt-5">About Me</h2>
      <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Edit About Me</p>
          <textarea
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] min-h-32 sm:min-h-36 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
            value={profile.about_me}
            onChange={(e) => onInputChange('about_me', e.target.value)}
            placeholder="Tell us more about yourself, your background, and what drives you in instructional design..."
          />
        </label>
      </div>
    </>
  );
}