import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

export default function DetailProfile({ session }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('about');
  const navigate = useNavigate();
  const { id } = useParams();
  
  // If no ID in params, use current user's profile
  const profileId = id || session?.user?.id;

  useEffect(() => {
    if (profileId) {
      fetchProfile(profileId);
    } else {
      navigate('/auth');
    }
  }, [profileId]);

  // Scroll to section and update active state
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      setActiveSection(sectionId);
    }
  };

  // Track which section is currently in view
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'projects', 'skills', 'experience'];
      const scrollPosition = window.scrollY + 100; // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProfile = async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found
          // If it's the current user's profile (no ID in params), redirect to edit
          if (!id && session?.user?.id === userId) {
            navigate('/edit-profile');
            return;
          } else {
            setError('Profile not found');
          }
        } else {
          setError(`Error loading profile: ${error.message}`);
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      setError(`Failed to load profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = session?.user?.id === profileId;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="text-lg text-[#0d0f1c]">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-[#0d0f1c] mb-4">{error || 'Profile not found'}</div>
          {canEdit ? (
            <button
              onClick={() => navigate('/edit-profile')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
            >
              Create Profile
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go Home
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f8f9fc] group/design-root overflow-x-hidden" style={{fontFamily: '"Work Sans", "Noto Sans", sans-serif'}}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-8 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            
            {/* Profile Header */}
            <div className="flex p-4">
              <div className="flex w-full flex-col gap-4 items-center">
                <div className="flex gap-4 flex-col items-center">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32"
                    style={{
                      backgroundImage: `url("${profile.profile_photo_url || 'https://via.placeholder.com/128x128/e6e9f4/0d0f1c?text=No+Photo'}")`,
                      backgroundColor: "#e6e9f4"
                    }}
                  />
                  
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-[#0d0f1c] text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">
                      {profile.name || 'No Name Set'}
                    </p>
                    <p className="text-[#47579e] text-base font-normal leading-normal text-center">
                      {profile.title || 'No Title Set'}
                    </p>
                    <p className="text-[#47579e] text-base font-normal leading-normal text-center">
                      {profile.bio || 'No Bio Set'}
                    </p>
                  </div>
                </div>
                
                {canEdit && (
                  <button
                    onClick={() => navigate('/edit-profile')}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e6e9f4] text-[#0d0f1c] text-sm font-bold leading-normal tracking-[0.015em] w-full max-w-[480px]"
                  >
                    <span className="truncate">Edit Profile</span>
                  </button>
                )}
                
                {!canEdit && (
                  <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e6e9f4] text-[#0d0f1c] text-sm font-bold leading-normal tracking-[0.015em] w-full max-w-[480px]">
                    <span className="truncate">Ask For Referral</span>
                  </button>
                )}
              </div>
            </div>

            {/* Your Original Tab Navigation - Kept Exactly the Same */}
            <div className="pb-3">
                <div className="flex border-b border-[#ced3e9] px-4 gap-8">
                    <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        scrollToSection('about');
                    }}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-3 transition-colors duration-200 ${
                        activeSection === 'about' 
                        ? 'border-b-[#4264fa] text-[#0d0f1c]' 
                        : 'border-b-transparent text-[#47579e] hover:text-[#0d0f1c]'
                    }`}
                    >
                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">About Me</p>
                    </a>
                    <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        scrollToSection('projects');
                    }}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-3 transition-colors duration-200 ${
                        activeSection === 'projects' 
                        ? 'border-b-[#4264fa] text-[#0d0f1c]' 
                        : 'border-b-transparent text-[#47579e] hover:text-[#0d0f1c]'
                    }`}
                    >
                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Projects</p>
                    </a>
                    <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        scrollToSection('skills');
                    }}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-3 transition-colors duration-200 ${
                        activeSection === 'skills' 
                        ? 'border-b-[#4264fa] text-[#0d0f1c]' 
                        : 'border-b-transparent text-[#47579e] hover:text-[#0d0f1c]'
                    }`}
                    >
                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Skills</p>
                    </a>
                    <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        scrollToSection('experience');
                    }}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-3 transition-colors duration-200 ${
                        activeSection === 'experience' 
                        ? 'border-b-[#4264fa] text-[#0d0f1c]' 
                        : 'border-b-transparent text-[#47579e] hover:text-[#0d0f1c]'
                    }`}
                    >
                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Experience</p>
                    </a>
                </div>
            </div>

            {/* Single Scrollable Content */}
            <div className="space-y-12">
              
              {/* About Me Section */}
              <section id="about" className="px-4 scroll-mt-24">
                <h2 className="text-[#0d0f1c] text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">About Me</h2>
                <p className="text-[#47579e] text-sm font-normal leading-normal">
                  {profile.about_me || 'No information provided yet.'}
                </p>
              </section>

              {/* Projects Section */}
              <section id="projects" className="px-4 scroll-mt-24">
                <h2 className="text-[#0d0f1c] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-1">Projects</h2>
                
                {/* Project 1 */}
                {(profile.project1_title || profile.project1_description) && (
                  <div className="mb-6 p-4 border border-[#ced3e9] rounded-xl">
                    <div className="flex items-stretch justify-between gap-4">
                      <div className="flex flex-[2_2_0px] flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-[#0d0f1c] text-base font-bold leading-tight">
                            {profile.project1_title || 'Project 1'}
                          </p>
                          <p className="text-[#47579e] text-sm font-normal leading-normal">
                            {profile.project1_description || 'No description provided.'}
                          </p>
                          {profile.project1_type && (
                            <span className="inline-block bg-[#e6e9f4] text-[#0d0f1c] px-3 py-1 rounded-full text-xs font-medium mt-2 w-fit">
                              {profile.project1_type}
                            </span>
                          )}
                        </div>
                        {profile.project1_folder_url && (
                          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#e6e9f4] text-[#0d0f1c] text-sm font-medium leading-normal w-fit">
                            <span className="truncate">View Project</span>
                          </button>
                        )}
                      </div>
                      {profile.project1_thumbnail_url && (
                        <div
                          className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1 max-w-[200px]"
                          style={{backgroundImage: `url("${profile.project1_thumbnail_url}")`}}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Project 2 */}
                {(profile.project2_title || profile.project2_description) && (
                  <div className="mb-6 p-4 border border-[#ced3e9] rounded-xl">
                    <div className="flex items-stretch justify-between gap-4">
                      <div className="flex flex-[2_2_0px] flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-[#0d0f1c] text-base font-bold leading-tight">
                            {profile.project2_title || 'Project 2'}
                          </p>
                          <p className="text-[#47579e] text-sm font-normal leading-normal">
                            {profile.project2_description || 'No description provided.'}
                          </p>
                          {profile.project2_type && (
                            <span className="inline-block bg-[#e6e9f4] text-[#0d0f1c] px-3 py-1 rounded-full text-xs font-medium mt-2 w-fit">
                              {profile.project2_type}
                            </span>
                          )}
                        </div>
                        {profile.project2_folder_url && (
                          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#e6e9f4] text-[#0d0f1c] text-sm font-medium leading-normal w-fit">
                            <span className="truncate">View Project</span>
                          </button>
                        )}
                      </div>
                      {profile.project2_thumbnail_url && (
                        <div
                          className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1 max-w-[200px]"
                          style={{backgroundImage: `url("${profile.project2_thumbnail_url}")`}}
                        />
                      )}
                    </div>
                  </div>
                )}

                {!profile.project1_title && !profile.project2_title && (
                  <p className="text-[#47579e] text-base italic">No projects added yet.</p>
                )}
              </section>

              {/* Skills Section */}
              <section id="skills" className="px-4 scroll-mt-24">
                <h2 className="text-[#0d0f1c] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-1">Skills</h2>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex gap-3 flex-wrap">
                    {profile.skills.map((skill, index) => (
                      <div key={index} className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#e6e9f4] pl-4 pr-4">
                        <p className="text-[#0d0f1c] text-sm font-medium leading-normal">{skill}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#47579e] text-base italic">No skills added yet.</p>
                )}
              </section>

              {/* Experience Section */}
              <section id="experience" className="px-4 scroll-mt-24 pb-12">
                <h2 className="text-[#0d0f1c] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-1">Experience</h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((num) => {
                    const title = profile[`experience${num}_title`];
                    const startDate = profile[`experience${num}_start_date`];
                    const endDate = profile[`experience${num}_end_date`];
                    
                    if (!title && !startDate && !endDate) return null;
                    
                    return (
                      <div key={num} className="flex gap-4 p-4 border border-[#ced3e9] rounded-xl">
                        <div className="flex flex-col items-center gap-1 pt-1">
                          <div className="text-[#0d0f1c]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                              <path d="M216,56H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48v8H40A16,16,0,0,0,24,72V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V72A16,16,0,0,0,216,56ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM216,72v41.61A184,184,0,0,1,128,136a184.07,184.07,0,0,1-88-22.38V72Zm0,128H40V131.64A200.19,200.19,0,0,0,128,152a200.25,200.25,0,0,0,88-20.37V200ZM104,112a8,8,0,0,1,8-8h32a8,8,0,0,1,0,16H112A8,8,0,0,1,104,112Z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col">
                          <p className="text-[#0d0f1c] text-base font-medium leading-normal">
                            {title || 'No title provided'}
                          </p>
                          <p className="text-[#47579e] text-base font-normal leading-normal">
                            {startDate || endDate ? `${startDate || 'Unknown'} - ${endDate || 'Present'}` : 'No dates provided'}
                          </p>
                          </div>
                      </div>
                    );
                  })}
                  
                  {!profile.experience1_title && !profile.experience2_title && !profile.experience3_title && (
                    <p className="text-[#47579e] text-base italic">No experience added yet.</p>
                  )}
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}