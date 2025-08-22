// filepath: /Users/arkaprovosarkar/Desktop/sooper-boring-vite/src/components/edit-profile/skills/PopularSkills.jsx
import React from 'react';

export default function PopularSkills({ skillsData, selectedSkills, onSkillSelect }) {
  // Check if skillsData has popularSkills structure
  const popularSkills = skillsData.popularSkills || {};
  
  if (Object.keys(popularSkills).length === 0) {
    return null;
  }

  return (
    <div className="px-3 sm:px-4 py-3">
      <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-3">
        Popular Skills by Category
      </p>
      {Object.entries(popularSkills).map(([category, skills]) => (
        <div key={category} className="mb-4">
          <h4 className="text-[#47579e] text-xs sm:text-sm font-medium mb-2">
            {category}
          </h4>
          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {skills
              .filter(skill => !selectedSkills.includes(skill))
              .map((skill, index) => (
                <button
                  key={index}
                  onClick={() => onSkillSelect(skill)}
                  className="flex items-center justify-center rounded-full border border-[#ced3e9] bg-white hover:bg-[#f8f9fc] hover:border-[#4264fa] px-2 sm:px-3 py-1 sm:py-1.5 transition-all duration-200"
                >
                  <span className="text-[#47579e] text-xs font-medium leading-normal">
                    + {skill}
                  </span>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}