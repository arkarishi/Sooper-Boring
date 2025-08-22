import React, { useState, useRef, useEffect } from 'react';

export default function SkillsInput({ 
  skillsData, 
  selectedSkills, 
  onSkillsChange,
  onInputChange 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const dropdownRef = useRef(null);

  // Filter skills based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSkills([]);
      return;
    }

    const filtered = skillsData.filter(skill =>
      skill.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedSkills.includes(skill)
    );

    setFilteredSkills(filtered);
  }, [searchTerm, selectedSkills, skillsData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSkillSelect = (skill) => {
    if (!selectedSkills.includes(skill)) {
      const newSkills = [...selectedSkills, skill];
      onSkillsChange(newSkills);
      onInputChange('skills', newSkills);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(value.length > 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim() && !selectedSkills.includes(searchTerm.trim())) {
      e.preventDefault();
      handleSkillSelect(searchTerm.trim());
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(searchTerm.length > 0)}
        placeholder="Type to search skills (e.g., React, Python, AWS, Machine Learning...)"
        autoComplete="off"
        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#4264fa] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
      />

      {/* Enhanced Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-[#ced3e9] rounded-xl shadow-lg max-h-64 overflow-y-auto z-10 mt-1">
          {filteredSkills.slice(0, 20).map((skill, index) => (
            <div
              key={index}
              className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-[#f8f9fc] cursor-pointer text-xs sm:text-sm text-[#0d0f1c] border-b border-[#ced3e9] last:border-b-0 flex items-center justify-between"
              onClick={() => handleSkillSelect(skill)}
            >
              <span>{skill}</span>
              <span className="text-xs text-[#47579e] opacity-60">Click to add</span>
            </div>
          ))}
          {filteredSkills.length > 20 && (
            <div className="px-3 sm:px-4 py-2 text-xs text-[#47579e] italic bg-[#f8f9fc]">
              {filteredSkills.length - 20} more results... Keep typing to narrow down
            </div>
          )}
          {filteredSkills.length === 0 && searchTerm.trim() && (
            <div className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#47579e] italic">
              Press Enter to add "{searchTerm.trim()}" as a custom skill
            </div>
          )}
        </div>
      )}
    </div>
  );
}