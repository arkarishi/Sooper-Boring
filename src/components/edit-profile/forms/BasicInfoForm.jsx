import React from 'react';

export default function BasicInfoForm({ profile, onInputChange }) {
  return (
    <>
      <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Name</p>
          <input
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
            value={profile.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="Enter your name"
          />
        </label>
      </div>

      <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Title</p>
          <input
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
            value={profile.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            placeholder="e.g., Instructional Designer"
          />
        </label>
      </div>

      <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Location</p>
          <input
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
            value={profile.location}
            onChange={(e) => onInputChange('location', e.target.value)}
            placeholder="e.g., New York, NY"
          />
        </label>
      </div>
    </>
  );
}