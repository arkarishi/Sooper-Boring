import React from 'react';
import EducationForm from '../forms/EducationForm';

export default function EducationSection({ 
  profile, 
  onAddEducation, 
  onRemoveEducation, 
  onUpdateEducation 
}) {
  return (
    <>
      <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] px-3 sm:px-4 pb-3 pt-5">
        Education
      </h2>
      
      <div className="px-3 sm:px-4 py-3 space-y-4">
        {profile.education && profile.education.map((education, index) => (
          <EducationForm
            key={education.id}
            education={education}
            educationIndex={index}
            totalEducation={profile.education.length}
            onUpdateEducation={onUpdateEducation}
            onRemoveEducation={onRemoveEducation}
          />
        ))}
        
        <button
          onClick={onAddEducation}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 sm:h-12 px-4 sm:px-6 bg-[#4264fa] text-white text-sm sm:text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#3651e8] transition-colors"
        >
          <span className="truncate">+ Add Another Education</span>
        </button>
      </div>

      {profile.education.length === 0 && (
        <div className="px-3 sm:px-4 py-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              <div>
                <p className="text-blue-800 text-sm font-medium">Add your educational background</p>
                <p className="text-blue-700 text-xs mt-1">
                  Include your degrees, certifications, and relevant coursework.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}