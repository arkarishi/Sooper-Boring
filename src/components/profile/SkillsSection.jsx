import React from 'react';

export default function SkillsSection({ profile }) {
  return (
    <section id="skills" className="px-3 sm:px-4 scroll-mt-24">
      <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-1">
        Skills
      </h2>
      {profile.skills && profile.skills.length > 0 ? (
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          {profile.skills.map((skill, index) => (
            <div key={index} className="flex h-7 sm:h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#e6e9f4] pl-3 sm:pl-4 pr-3 sm:pr-4">
              <p className="text-[#0d0f1c] text-xs sm:text-sm font-medium leading-normal">
                {skill}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#47579e] text-sm sm:text-base italic">
          No skills added yet.
        </p>
      )}
    </section>
  );
}