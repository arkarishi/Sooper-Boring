import React from 'react';
import ExperienceCard from './ExperienceCard';

export default function ExperienceSection({ profile, expandedExperience, toggleExperienceExpansion }) {
  return (
    <section id="experience" className="px-3 sm:px-4 scroll-mt-24 pb-8 sm:pb-12">
      <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-1">
        Experience
      </h2>
      <div className="space-y-3 sm:space-y-4">
        {profile.experiences && profile.experiences.length > 0 ? (
          profile.experiences
            .filter(experience => experience.title || experience.company)
            .map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                isExpanded={expandedExperience[experience.id]}
                onToggleExpansion={toggleExperienceExpansion}
              />
            ))
        ) : (
          <p className="text-[#47579e] text-sm sm:text-base italic">
            No experience added yet.
          </p>
        )}
      </div>
    </section>
  );
}