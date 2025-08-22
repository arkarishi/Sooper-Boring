import React from 'react';
import ProjectCard from './ProjectCard';

export default function ProjectsSection({ profile }) {
  const hasProjects = profile.project1_title || profile.project2_title;

  return (
    <section id="projects" className="px-3 sm:px-4 scroll-mt-24">
      <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-1">
        Projects
      </h2>
      
      {(profile.project1_title || profile.project1_description) && (
        <ProjectCard 
          project={{
            title: profile.project1_title,
            description: profile.project1_description,
            type: profile.project1_type,
            folder_url: profile.project1_folder_url,
            pdf_url: profile.project1_pdf_url,
            thumbnail_url: profile.project1_thumbnail_url
          }}
          projectNumber={1}
        />
      )}

      {(profile.project2_title || profile.project2_description) && (
        <ProjectCard 
          project={{
            title: profile.project2_title,
            description: profile.project2_description,
            type: profile.project2_type,
            folder_url: profile.project2_folder_url,
            pdf_url: profile.project2_pdf_url,
            thumbnail_url: profile.project2_thumbnail_url
          }}
          projectNumber={2}
        />
      )}

      {!hasProjects && (
        <p className="text-[#47579e] text-sm sm:text-base italic">
          No projects added yet.
        </p>
      )}
    </section>
  );
}