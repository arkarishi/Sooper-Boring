import React from 'react';
import SkillsInput from '../skills/SkillsInput';
import SkillsDisplay from '../skills/SkillsDisplay';
import PopularSkills from '../skills/PopularSkills';

export default function SkillsSection({ 
  profile, 
  selectedSkills, 
  setSelectedSkills, 
  onInputChange, 
  skillsData,
  predefinedSkills = [] 
}) {
  const handleSkillsChange = (newSkills) => {
    setSelectedSkills(newSkills);
    onInputChange('skills', newSkills);
  };

  const handleSkillRemove = (skillToRemove) => {
    const updatedSkills = selectedSkills.filter(skill => skill !== skillToRemove);
    handleSkillsChange(updatedSkills);
  };

  const handleSkillSelect = (skill) => {
    if (!selectedSkills.includes(skill)) {
      const newSkills = [...selectedSkills, skill];
      handleSkillsChange(newSkills);
    }
  };

  return (
    <>
      <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] px-3 sm:px-4 pb-3 pt-5">
        Skills
      </h2>
      
      {/* Skills Input with Dropdown */}
      <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">
            Add Skills
          </p>
          <SkillsInput
            skillsData={predefinedSkills} // Change this - use predefinedSkills for the search
            selectedSkills={selectedSkills}
            onSkillsChange={handleSkillsChange}
            onInputChange={onInputChange}
          />
        </label>
      </div>

      {/* Selected Skills Display */}
      {selectedSkills.length > 0 && (
        <div className="px-3 sm:px-4 py-3">
          <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-3">
            Selected Skills ({selectedSkills.length})
          </p>
          <SkillsDisplay
            selectedSkills={selectedSkills}
            onSkillRemove={handleSkillRemove}
          />
        </div>
      )}

      {/* Categorized Popular Skills */}
      <PopularSkills
        skillsData={skillsData} // This should be the full object with popularSkills
        selectedSkills={selectedSkills}
        onSkillSelect={handleSkillSelect}
      />

      {/* Skills Help Text */}
      <div className="px-3 sm:px-4 py-2">
        <p className="text-[#47579e] text-sm leading-normal">
          💡 <strong>Pro tip:</strong> Start typing to search from our database of {predefinedSkills.length}+ skills including programming languages, 
          frameworks, cloud platforms, databases, and more. You can also add custom skills by pressing Enter.
        </p>
      </div>

      {selectedSkills.length === 0 && (
        <div className="px-3 sm:px-4 py-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-blue-800 text-sm font-medium">Add your skills</p>
                <p className="text-blue-700 text-xs mt-1">
                  Start typing to search from our skill database or add your own custom skills.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}