import React from 'react';

export default function AboutSection({ profile }) {
  return (
    <section id="about" className="px-3 sm:px-4 scroll-mt-24">
      <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] mb-3 sm:mb-4">
        About Me
      </h2>
      {profile.about_me ? (
        <p className="text-[#47579e] text-sm sm:text-base font-normal leading-normal whitespace-pre-wrap">
          {profile.about_me}
        </p>
      ) : (
        <p className="text-[#47579e] text-sm sm:text-base italic">
          No information provided yet.
        </p>
      )}
    </section>
  );
}