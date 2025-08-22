import React from 'react';

export default function SkillsDisplay({ selectedSkills, onSkillRemove }) {
  if (selectedSkills.length === 0) {
    return (
      <div className="text-[#47579e] text-sm italic">
        No skills added yet. Start typing to add skills.
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap max-h-48 overflow-y-auto">
      {selectedSkills.map((skill, index) => (
        <div 
          key={index} 
          className="flex items-center justify-center gap-x-2 rounded-full bg-[#e6e9f4] pl-3 sm:pl-4 pr-2 py-1.5 sm:py-2 group hover:bg-[#d1d6ed] transition-colors"
        >
          <p className="text-[#0d0f1c] text-xs sm:text-sm font-medium leading-normal">
            {skill}
          </p>
          <button
            onClick={() => onSkillRemove(skill)}
            className="ml-1 text-[#47579e] hover:text-[#0d0f1c] focus:outline-none p-1 rounded-full hover:bg-[#ced3e9] transition-colors"
            aria-label={`Remove ${skill}`}
            title="Remove skill"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}