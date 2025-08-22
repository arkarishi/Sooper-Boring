import React from 'react';
import ExperienceForm from '../forms/ExperienceForm';

export default function ExperienceSection({ 
  profile, 
  onAddExperience, 
  onRemoveExperience, 
  onUpdateExperience 
}) {
  return (
    <>
      <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] px-3 sm:px-4 pb-3 pt-5">
        Experience
      </h2>
      
      <div className="px-3 sm:px-4 py-3 space-y-4">
        {profile.experiences && profile.experiences.map((experience, index) => (
          <ExperienceForm
            key={experience.id}
            experience={experience}
            experienceIndex={index}
            totalExperiences={profile.experiences.length}
            onUpdateExperience={onUpdateExperience}
            onRemoveExperience={onRemoveExperience}
          />
        ))}
        
        <button
          onClick={onAddExperience}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 sm:h-12 px-4 sm:px-6 bg-[#4264fa] text-white text-sm sm:text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#3651e8] transition-colors"
        >
          <span className="truncate">+ Add Another Experience</span>
        </button>
      </div>

      {profile.experiences.length === 0 && (
        <div className="px-3 sm:px-4 py-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
              <div>
                <p className="text-blue-800 text-sm font-medium">Add your work experience</p>
                <p className="text-blue-700 text-xs mt-1">
                  Include your current and previous roles to showcase your professional journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}