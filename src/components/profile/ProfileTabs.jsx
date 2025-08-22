import React from 'react';

const tabs = [
  { id: 'about', label: 'About Me' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' }
];

export default function ProfileTabs({ activeSection, scrollToSection }) {
  return (
    <div className="pb-3">
      <div className="flex border-b border-[#ced3e9] px-2 sm:px-4 gap-2 sm:gap-4 md:gap-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <a
            key={tab.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(tab.id);
            }}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-2 sm:px-3 transition-colors duration-200 whitespace-nowrap ${
              activeSection === tab.id 
              ? 'border-b-[#4264fa] text-[#0d0f1c]' 
              : 'border-b-transparent text-[#47579e] hover:text-[#0d0f1c]'
            }`}
          >
            <p className="text-xs sm:text-sm font-bold leading-normal tracking-[0.015em]">
              {tab.label}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}