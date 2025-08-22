import React from 'react';
import EducationCard from './EducationCard';

export default function EducationSection({ profile, expandedExperience, toggleExperienceExpansion }) {
  return (
    <section id="education" className="px-3 sm:px-4 scroll-mt-24 pb-8 sm:pb-12">
      <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-1">Education</h2>
      <div className="space-y-3 sm:space-y-4">
        {profile.education && profile.education.length > 0 ? (
          profile.education
            .filter(education => education.degree || education.institution) // Only show education with content
            .map((education) => (
              <EducationCard
                key={education.id}
                education={education}
                isExpanded={expandedExperience[education.id]}
                onToggleExpansion={toggleExperienceExpansion}
              />
            ))
        ) : (
          <p className="text-[#47579e] text-sm sm:text-base italic">No education added yet.</p>
        )}
      </div>
    </section>
  );
}