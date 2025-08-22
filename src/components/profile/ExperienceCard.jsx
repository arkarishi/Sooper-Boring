import React from 'react';

export default function ExperienceCard({ experience, isExpanded, onToggleExpansion }) {
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const startFormatted = formatDisplayDate(experience.start_date);
  const endFormatted = experience.current ? 'Present' : formatDisplayDate(experience.end_date);

  return (
    <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 border border-[#ced3e9] rounded-xl bg-white">
      <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
        <div className="text-[#0d0f1c]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" className="sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 256 256">
            <path d="M216,56H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48v8H40A16,16,0,0,0,24,72V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V72A16,16,0,0,0,216,56ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM216,72v41.61A184,184,0,0,1,128,136a184.07,184.07,0,0,1-88-22.38V72Zm0,128H40V131.64A200.19,200.19,0,0,0,128,152a200.25,200.25,0,0,0,88-20.37V200ZM104,112a8,8,0,0,1,8-8h32a8,8,0,0,1,0,16H112A8,8,0,0,1,104,112Z" />
          </svg>
        </div>
      </div>
      <div className="flex flex-1 flex-col min-w-0">
        <p className="text-[#0d0f1c] text-sm sm:text-base font-bold leading-normal">
          {experience.title || 'No title provided'}
        </p>
        {experience.company && (
          <p className="text-[#47579e] text-xs sm:text-sm font-medium leading-normal">
            {experience.company}
          </p>
        )}
        {experience.location && (
          <p className="text-[#47579e] text-xs sm:text-sm font-normal leading-normal">
            📍 {experience.location}
          </p>
        )}
        <p className="text-[#47579e] text-xs sm:text-sm font-normal leading-normal">
          {startFormatted || endFormatted ? `${startFormatted || 'Unknown'} - ${endFormatted || 'Unknown'}` : 'No dates provided'}
        </p>
        
        {experience.description && isExpanded && (
          <div className="mt-2">
            <p className="text-[#0d0f1c] text-xs sm:text-sm font-normal leading-normal whitespace-pre-wrap">
              {experience.description}
            </p>
          </div>
        )}
        
        {experience.description && (
          <button
            onClick={() => onToggleExpansion(experience.id)}
            className="flex min-w-[84px] max-w-[200px] sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 sm:h-10 px-3 sm:px-4 bg-[#e6e9f4] text-[#0d0f1c] text-xs sm:text-sm font-medium leading-normal w-fit mt-2"
          >
            <span className="truncate">{isExpanded ? 'Read Less' : 'Read More'}</span>
          </button>
        )}
      </div>
    </div>
  );
}