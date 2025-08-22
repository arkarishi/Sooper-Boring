import React from 'react';

export default function EducationCard({ education, isExpanded, onToggleExpansion }) {
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const startFormatted = formatDisplayDate(education.start_date);
  const endFormatted = education.current ? 'Present' : formatDisplayDate(education.end_date);

  return (
    <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 border border-[#ced3e9] rounded-xl bg-white">
      <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
        <div className="text-[#0d0f1c]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" className="sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 256 256">
            <path d="M251.76,88.94l-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87v48.42a15.91,15.91,0,0,0,4.06,10.65C49.16,191.53,78.51,216,128,216s78.84-24.47,91.94-39.06A15.91,15.91,0,0,0,224,166.29V117.87l27.76-14.81a8,8,0,0,0,0-14.12ZM128,200c-43.27,0-68.72-21.14-80-33.71V126.4l76.24,40.66a8,8,0,0,0,7.52,0L208,126.4v39.89C196.72,178.86,171.27,200,128,200Zm0-33.87L57.3,128,128,89.87,198.7,128Z"/>
          </svg>
        </div>
      </div>
      <div className="flex flex-1 flex-col min-w-0">
        <p className="text-[#0d0f1c] text-sm sm:text-base font-bold leading-normal">
          {education.degree || 'No degree provided'}
        </p>
        {education.institution && (
          <p className="text-[#47579e] text-xs sm:text-sm font-medium leading-normal">
            {education.institution}
          </p>
        )}
        {education.field_of_study && (
          <p className="text-[#47579e] text-xs sm:text-sm font-normal leading-normal">
            📚 {education.field_of_study}
          </p>
        )}
        {education.location && (
          <p className="text-[#47579e] text-xs sm:text-sm font-normal leading-normal">
            📍 {education.location}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[#47579e] text-xs sm:text-sm font-normal leading-normal">
            {startFormatted || endFormatted ? `${startFormatted || 'Unknown'} - ${endFormatted || 'Unknown'}` : 'No dates provided'}
          </p>
          {education.gpa && (
            <span className="bg-[#e6e9f4] text-[#0d0f1c] px-2 py-1 rounded-full text-xs font-medium">
              GPA: {education.gpa}
            </span>
          )}
        </div>
        
        {education.description && isExpanded && (
          <div className="mt-2">
            <p className="text-[#0d0f1c] text-xs sm:text-sm font-normal leading-normal whitespace-pre-wrap">
              {education.description}
            </p>
          </div>
        )}
        
        {education.description && (
          <button
            onClick={() => onToggleExpansion(education.id)}
            className="flex min-w-[84px] max-w-[200px] sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 sm:h-10 px-3 sm:px-4 bg-[#e6e9f4] text-[#0d0f1c] text-xs sm:text-sm font-medium leading-normal w-fit mt-2"
          >
            <span className="truncate">{isExpanded ? 'Read Less' : 'Read More'}</span>
          </button>
        )}
      </div>
    </div>
  );
}