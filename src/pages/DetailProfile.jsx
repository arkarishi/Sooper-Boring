import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

export default function DetailProfile({ session }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('about');
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [expandedExperience, setExpandedExperience] = useState({}); // Track expanded state for each experience
  const navigate = useNavigate();
  
  // ✅ Change from id to slug for public profiles
  const { slug } = useParams();
  
  // ✅ If no slug in params, use current user's profile, otherwise use slug
  const profileIdentifier = slug || session?.user?.id;
  
  // ✅ Can edit only if no slug (current user profile) and user is logged in
  const canEdit = !slug && session?.user?.id === profileIdentifier;

  useEffect(() => {
    if (profileIdentifier) {
      fetchProfile(profileIdentifier);
    } else {
      navigate('/auth');
    }
  }, [profileIdentifier]);

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
      const sections = ['about', 'projects', 'skills', 'experience', 'education']; // ✅ Add 'education'
      const scrollPosition = window.scrollY + 100;

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

  // ✅ Updated fetchProfile to handle both slug and ID
  const fetchProfile = async (identifier) => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase.from('profiles').select('*');
      
      // If we have a slug parameter, query by slug, otherwise by id
      if (slug) {
        query = query.eq('slug', identifier);
      } else {
        query = query.eq('id', identifier);
      }
      
      const { data, error } = await query.single();

      if (error) {
        console.error('Profile fetch error:', error);
        if (error.code === 'PGRST116') {
          // Profile not found
          if (!slug && session?.user?.id === identifier) {
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
      console.error('Failed to load profile:', err);
      setError(`Failed to load profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to truncate text
  const truncateText = (text, wordLimit = 30) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  // Toggle experience description expansion
  const toggleExperienceExpansion = (experienceNum) => {
    setExpandedExperience(prev => ({
      ...prev,
      [experienceNum]: !prev[experienceNum]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4">
        <div className="text-base sm:text-lg text-[#0d0f1c]">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-base sm:text-lg text-[#0d0f1c] mb-4">{error || 'Profile not found'}</div>
          {canEdit ? (
            <button
              onClick={() => navigate('/edit-profile')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2 text-sm sm:text-base"
            >
              Create Profile
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base"
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
        <div className="px-4 sm:px-6 md:px-8 lg:px-16 xl:px-40 flex flex-1 justify-center py-4 sm:py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1 w-full">
            
            {/* Profile Header */}
            <div className="flex p-3 sm:p-4">
              <div className="flex w-full flex-col gap-3 sm:gap-4 items-center">
                <div className="flex gap-3 sm:gap-4 flex-col items-center">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-24 w-24 sm:min-h-28 sm:w-28 md:min-h-32 md:w-32"
                    style={{
                      backgroundImage: `url("${profile.profile_photo_url || 'https://via.placeholder.com/128x128/e6e9f4/0d0f1c?text=No+Photo'}")`,
                      backgroundColor: "#e6e9f4"
                    }}
                  />
                  
                  <div className="flex flex-col items-center justify-center px-2">
                    <p className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">
                      {profile.name || 'No Name Set'}
                    </p>
                    <p className="text-[#47579e] text-sm sm:text-base font-normal leading-normal text-center mt-1">
                      {profile.title || 'No Title Set'}
                    </p>
                    <p className="text-[#47579e] text-sm sm:text-base font-normal leading-normal text-center mt-1">
                      {profile.location || 'No Location Set'}
                    </p>
                  </div>
                </div>
                
                {canEdit && (
                  <button
                    onClick={() => navigate('/edit-profile')}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 sm:h-12 px-4 sm:px-6 bg-[#e6e9f4] text-[#0d0f1c] text-sm sm:text-base font-bold leading-normal tracking-[0.015em] w-full max-w-[320px] sm:max-w-[480px]"
                  >
                    <span className="truncate">Edit Profile</span>
                  </button>
                )}
                
                {!canEdit && (
                  <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 sm:h-12 px-4 sm:px-6 bg-[#e6e9f4] text-[#0d0f1c] text-sm sm:text-base font-bold leading-normal tracking-[0.015em] w-full max-w-[320px] sm:max-w-[480px]">
                    <span className="truncate">Ask For Referral</span>
                  </button>
                )}

                {/* ✅ Share Profile Section - only show if profile has slug AND user can edit (own profile) */}
                {profile.slug && canEdit && (
                  <div className="w-full max-w-[480px] bg-white border border-[#ced3e9] rounded-xl p-3 sm:p-4 mt-2">
                    <div className="flex flex-col gap-2">
                      <p className="text-[#0d0f1c] text-sm font-medium text-center">
                        🔗 Share Your Profile
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={`${window.location.origin}/profile/${profile.slug}`}
                          readOnly
                          className="flex-1 px-3 py-2 border border-[#ced3e9] rounded-lg bg-[#f8f9fc] text-[#47579e] text-xs sm:text-sm font-mono"
                          onClick={(e) => e.target.select()}
                        />
                        <button
                          onClick={async (event) => {
                            const url = `${window.location.origin}/profile/${profile.slug}`;
                            const button = event.target;
                            const originalText = button.textContent;
                            
                            try {
                              if (navigator.clipboard && navigator.clipboard.writeText) {
                                await navigator.clipboard.writeText(url);
                                button.textContent = '✓';
                                button.style.backgroundColor = '#22c55e';
                                setTimeout(() => {
                                  button.textContent = originalText;
                                  button.style.backgroundColor = '';
                                }, 1500);
                              } else {
                                const input = event.target.parentElement.querySelector('input');
                                input.select();
                                input.setSelectionRange(0, 99999);
                                const successful = document.execCommand('copy');
                                if (successful) {
                                  button.textContent = '✓';
                                  button.style.backgroundColor = '#22c55e';
                                  setTimeout(() => {
                                    button.textContent = originalText;
                                    button.style.backgroundColor = '';
                                  }, 1500);
                                } else {
                                  throw new Error('Copy failed');
                                }
                              }
                            } catch (err) {
                              button.textContent = 'Select URL';
                              button.style.backgroundColor = '#f59e0b';
                              const input = event.target.parentElement.querySelector('input');
                              input.focus();
                              input.select();
                              setTimeout(() => {
                                button.textContent = originalText;
                                button.style.backgroundColor = '';
                              }, 2000);
                            }
                          }}
                          className="px-3 py-2 bg-[#4264fa] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#3651e8] transition-colors flex-shrink-0"
                        >
                          Copy
                        </button>
                      </div>
                      
                      <p className="text-[#47579e] text-xs text-center mt-1">
                        Share this link so others can view your profile
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Responsive Tab Navigation */}
            <div className="pb-3">
              <div className="flex border-b border-[#ced3e9] px-2 sm:px-4 gap-2 sm:gap-4 md:gap-8 overflow-x-auto scrollbar-hide">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('about');
                  }}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-2 sm:px-3 transition-colors duration-200 whitespace-nowrap ${
                    activeSection === 'about' 
                    ? 'border-b-[#4264fa] text-[#0d0f1c]' 
                    : 'border-b-transparent text-[#47579e] hover:text-[#0d0f1c]'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-bold leading-normal tracking-[0.015em]">About Me</p>
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('projects');
                  }}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-2 sm:px-3 transition-colors duration-200 whitespace-nowrap ${
                    activeSection === 'projects' 
                    ? 'border-b-[#4264fa] text-[#0d0f1c]' 
                    : 'border-b-transparent text-[#47579e] hover:text-[#0d0f1c]'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-bold leading-normal tracking-[0.015em]">Projects</p>
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('skills');
                  }}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-2 sm:px-3 transition-colors duration-200 whitespace-nowrap ${
                    activeSection === 'skills' 
                    ? 'border-b-[#4264fa] text-[#0d0f1c]' 
                    : 'border-b-transparent text-[#47579e] hover:text-[#0d0f1c]'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-bold leading-normal tracking-[0.015em]">Skills</p>
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('experience');
                  }}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-2 sm:px-3 transition-colors duration-200 whitespace-nowrap ${
                    activeSection === 'experience' 
                    ? 'border-b-[#4264fa] text-[#0d0f1c]' 
                    : 'border-b-transparent text-[#47579e] hover:text-[#0d0f1c]'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-bold leading-normal tracking-[0.015em]">Experience</p>
                </a>
                {/* Add Education tab */}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('education');
                  }}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-2 sm:px-3 transition-colors duration-200 whitespace-nowrap ${
                    activeSection === 'education' 
                    ? 'border-b-[#4264fa] text-[#0d0f1c]' 
                    : 'border-b-transparent text-[#47579e] hover:text-[#0d0f1c]'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-bold leading-normal tracking-[0.015em]">Education</p>
                </a>
              </div>
            </div>

            {/* Single Scrollable Content */}
            <div className="space-y-8 sm:space-y-12">
              
              {/* About Me Section - Removed Read More functionality */}
              <section id="about" className="px-3 sm:px-4 scroll-mt-24">
                <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] mb-3 sm:mb-4">About Me</h2>
                {profile.about_me ? (
                  <p className="text-[#47579e] text-sm sm:text-base font-normal leading-normal whitespace-pre-wrap">
                    {profile.about_me}
                  </p>
                ) : (
                  <p className="text-[#47579e] text-sm sm:text-base italic">No information provided yet.</p>
                )}
              </section>

              {/* Projects Section - Using img tags for better reliability */}
              <section id="projects" className="px-3 sm:px-4 scroll-mt-24">
                <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-1">Projects</h2>
                
                {/* Project 1 */}
                {(profile.project1_title || profile.project1_description) && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 border border-[#ced3e9] rounded-xl">
                    <div className="flex flex-col lg:flex-row items-start lg:items-start justify-between gap-4 lg:gap-6">
                      <div className="flex flex-1 flex-col gap-3 sm:gap-4 min-w-0">
                        <div className="flex flex-col gap-1 sm:gap-2">
                          <p className="text-[#0d0f1c] text-sm sm:text-base font-bold leading-tight">
                            {profile.project1_title || 'Project 1'}
                          </p>
                          <p className="text-[#47579e] text-xs sm:text-sm font-normal leading-normal">
                            {profile.project1_description || 'No description provided.'}
                          </p>
                          {profile.project1_type && (
                            <span className="inline-block bg-[#e6e9f4] text-[#0d0f1c] px-2 sm:px-3 py-1 rounded-full text-xs font-medium mt-1 sm:mt-2 w-fit">
                              {profile.project1_type === 'Storyboard' ? '📄 Storyboard' : '💻 e-Learning'}
                            </span>
                          )}
                        </div>
                        
                        {/* Updated View Project Button Logic */}
                        {((profile.project1_type === 'e-Learning' && profile.project1_folder_url) || 
                          (profile.project1_type === 'Storyboard' && profile.project1_pdf_url)) && (
                          <button 
                            onClick={() => {
                              const url = profile.project1_type === 'Storyboard' 
                                ? profile.project1_pdf_url 
                                : profile.project1_folder_url;
                              window.open(url, '_blank');
                            }}
                            className="flex min-w-[84px] max-w-[200px] sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 sm:h-10 px-3 sm:px-4 bg-[#e6e9f4] text-[#0d0f1c] text-xs sm:text-sm font-medium leading-normal w-fit"
                          >
                            <span className="truncate">
                              {profile.project1_type === 'Storyboard' ? '📄 View PDF' : '💻 View Project'}
                            </span>
                          </button>
                        )}
                      </div>
                      
                      {/* Project 1 Image using img tag */}
                      {profile.project1_thumbnail_url && (
                        <div className="w-full lg:w-auto flex-shrink-0 max-w-full lg:max-w-[300px] xl:max-w-[350px]">
                          <img
                            src={profile.project1_thumbnail_url}
                            alt={`${profile.project1_title || 'Project 1'} thumbnail`}
                            className="w-full h-48 sm:h-52 lg:h-44 xl:h-48 object-cover rounded-xl border border-[#ced3e9]"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          {/* Fallback placeholder */}
                          <div className="w-full h-48 sm:h-52 lg:h-44 xl:h-48 bg-gray-100 rounded-xl border border-[#ced3e9] items-center justify-center hidden">
                            <span className="text-gray-500 text-sm">Image not available</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Project 2 - Same structure */}
                {(profile.project2_title || profile.project2_description) && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 border border-[#ced3e9] rounded-xl">
                    <div className="flex flex-col lg:flex-row items-start lg:items-start justify-between gap-4 lg:gap-6">
                      <div className="flex flex-1 flex-col gap-3 sm:gap-4 min-w-0">
                        <div className="flex flex-col gap-1 sm:gap-2">
                          <p className="text-[#0d0f1c] text-sm sm:text-base font-bold leading-tight">
                            {profile.project2_title || 'Project 2'}
                          </p>
                          <p className="text-[#47579e] text-xs sm:text-sm font-normal leading-normal">
                            {profile.project2_description || 'No description provided.'}
                          </p>
                          {profile.project2_type && (
                            <span className="inline-block bg-[#e6e9f4] text-[#0d0f1c] px-2 sm:px-3 py-1 rounded-full text-xs font-medium mt-1 sm:mt-2 w-fit">
                              {profile.project2_type === 'Storyboard' ? '📄 Storyboard' : '💻 e-Learning'}
                            </span>
                          )}
                        </div>
                        {/* Updated View Project Logic */}
                        {((profile.project2_type === 'e-Learning' && profile.project2_folder_url) || 
                          (profile.project2_type === 'Storyboard' && profile.project2_pdf_url)) && (
                          <button 
                            onClick={() => {
                              const url = profile.project2_type === 'Storyboard' 
                                ? profile.project2_pdf_url 
                                : profile.project2_folder_url;
                              window.open(url, '_blank');
                            }}
                            className="flex min-w-[84px] max-w-[200px] sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 sm:h-10 px-3 sm:px-4 bg-[#e6e9f4] text-[#0d0f1c] text-xs sm:text-sm font-medium leading-normal w-fit"
                          >
                            <span className="truncate">
                              {profile.project2_type === 'Storyboard' ? '📄 View PDF' : '💻 View Project'}
                            </span>
                          </button>
                        )}
                      </div>
                      
                      {/* Project 2 Image using img tag */}
                      {profile.project2_thumbnail_url && (
                        <div className="w-full lg:w-auto flex-shrink-0 max-w-full lg:max-w-[300px] xl:max-w-[350px]">
                          <img
                            src={profile.project2_thumbnail_url}
                            alt={`${profile.project2_title || 'Project 2'} thumbnail`}
                            className="w-full h-48 sm:h-52 lg:h-44 xl:h-48 object-cover rounded-xl border border-[#ced3e9]"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          {/* Fallback placeholder */}
                          <div className="w-full h-48 sm:h-52 lg:h-44 xl:h-48 bg-gray-100 rounded-xl border border-[#ced3e9] items-center justify-center hidden">
                            <span className="text-gray-500 text-sm">Image not available</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!profile.project1_title && !profile.project2_title && (
                  <p className="text-[#47579e] text-sm sm:text-base italic">No projects added yet.</p>
                )}
              </section>

              {/* Skills Section - remains the same */}
              <section id="skills" className="px-3 sm:px-4 scroll-mt-24">
                <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-1">Skills</h2>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex gap-2 sm:gap-3 flex-wrap">
                    {profile.skills.map((skill, index) => (
                      <div key={index} className="flex h-7 sm:h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#e6e9f4] pl-3 sm:pl-4 pr-3 sm:pr-4">
                        <p className="text-[#0d0f1c] text-xs sm:text-sm font-medium leading-normal">{skill}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#47579e] text-sm sm:text-base italic">No skills added yet.</p>
                )}
              </section>

              {/* Experience Section */}
              <section id="experience" className="px-3 sm:px-4 scroll-mt-24 pb-8 sm:pb-12">
                <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-1">Experience</h2>
                <div className="space-y-3 sm:space-y-4">
                  {profile.experiences && profile.experiences.length > 0 ? (
                    profile.experiences
                      .filter(experience => experience.title || experience.company) // Only show experiences with content
                      .map((experience) => {
                        const isExpanded = expandedExperience[experience.id];
                        
                        // Format dates for display
                        const formatDisplayDate = (dateString) => {
                          if (!dateString) return '';
                          const date = new Date(dateString);
                          return date.toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          });
                        };
                        
                        const startFormatted = formatDisplayDate(experience.start_date);
                        const endFormatted = experience.current ? 'Present' : formatDisplayDate(experience.end_date);
                        
                        return (
                          <div key={experience.id} className="flex gap-3 sm:gap-4 p-3 sm:p-4 border border-[#ced3e9] rounded-xl bg-white">
                            <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
                              <div className="text-[#0d0f1c]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" className="sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 256 256">
                                  <path d="M216,56H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48v8H40A16,16,0,0,0,24,72V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V72A16,16,0,0,0,216,56ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM216,72v41.61A184,184,0,0,1,128,136a184.07,184.07,0,0,1-88-22.38V72Zm0,128H40V131.64A200.19,200.19,0,0,0,128,152a200.25,200.25,0,0,0,88-20.37V200ZM104,112a8,8,0,0,1,8-8h32a8,8,0,0,1,0,16H112A8,8,0,0,1,104,112Z" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex flex-1 flex-col min-w-0">
                              <p className="text-[#0d0f1c] text-sm sm:text-base font-bold leading-normal">
                                {experience.title || 'No title provided'}
                              </p>
                              {experience.company && (
                                <p className="text-[#47579e] text-xs sm:text-sm font-medium leading-normal">
                                  {experience.company}
                                </p>
                              )}
                              {experience.location && (
                                <p className="text-[#47579e] text-xs sm:text-sm font-normal leading-normal">
                                  📍 {experience.location}
                                </p>
                              )}
                              <p className="text-[#47579e] text-xs sm:text-sm font-normal leading-normal">
                                {startFormatted || endFormatted ? `${startFormatted || 'Unknown'} - ${endFormatted || 'Unknown'}` : 'No dates provided'}
                              </p>
                              
                              {/* Show description only when expanded */}
                              {experience.description && isExpanded && (
                                <div className="mt-2">
                                  <p className="text-[#0d0f1c] text-xs sm:text-sm font-normal leading-normal whitespace-pre-wrap">
                                    {experience.description}
                                  </p>
                                </div>
                              )}
                              
                              {/* Read More button */}
                              {experience.description && (
                                <button
                                  onClick={() => toggleExperienceExpansion(experience.id)}
                                  className="flex min-w-[84px] max-w-[200px] sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 sm:h-10 px-3 sm:px-4 bg-[#e6e9f4] text-[#0d0f1c] text-xs sm:text-sm font-medium leading-normal w-fit mt-2"
                                >
                                  <span className="truncate">{isExpanded ? 'Read Less' : 'Read More'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-[#47579e] text-sm sm:text-base italic">No experience added yet.</p>
                  )}
                </div>
              </section>

              {/* Education Section - New section added */}
              <section id="education" className="px-3 sm:px-4 scroll-mt-24 pb-8 sm:pb-12">
                <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-1">Education</h2>
                <div className="space-y-3 sm:space-y-4">
                  {profile.education && profile.education.length > 0 ? (
                    profile.education
                      .filter(education => education.degree || education.institution) // Only show education with content
                      .map((education) => {
                        const isExpanded = expandedExperience[education.id];
                        
                        // Format dates for display
                        const formatDisplayDate = (dateString) => {
                          if (!dateString) return '';
                          const date = new Date(dateString);
                          return date.toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          });
                        };
                        
                        const startFormatted = formatDisplayDate(education.start_date);
                        const endFormatted = education.current ? 'Present' : formatDisplayDate(education.end_date);
                        
                        return (
                          <div key={education.id} className="flex gap-3 sm:gap-4 p-3 sm:p-4 border border-[#ced3e9] rounded-xl bg-white">
                            <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
                              <div className="text-[#0d0f1c]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" className="sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 256 256">
                                  <path d="M251.76,88.94l-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87v48.42a15.91,15.91,0,0,0,4.06,10.65C49.16,191.53,78.51,216,128,216s78.84-24.47,91.94-39.06A15.91,15.91,0,0,0,224,166.29V117.87l27.76-14.81a8,8,0,0,0,0-14.12ZM128,200c-43.27,0-68.72-21.14-80-33.71V126.4l76.24,40.66a8,8,0,0,0,7.52,0L208,126.4v39.89C196.72,178.86,171.27,200,128,200Zm0-33.87L57.3,128,128,89.87,198.7,128Z"/>
                                </svg>
                              </div>
                            </div>
                            <div className="flex flex-1 flex-col min-w-0">
                              <p className="text-[#0d0f1c] text-sm sm:text-base font-bold leading-normal">
                                {education.degree || 'No degree provided'}
                              </p>
                              {education.institution && (
                                <p className="text-[#47579e] text-xs sm:text-sm font-medium leading-normal">
                                  {education.institution}
                                </p>
                              )}
                              {education.field_of_study && (
                                <p className="text-[#47579e] text-xs sm:text-sm font-normal leading-normal">
                                  📚 {education.field_of_study}
                                </p>
                              )}
                              {education.location && (
                                <p className="text-[#47579e] text-xs sm:text-sm font-normal leading-normal">
                                  📍 {education.location}
                                </p>
                              )}
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-[#47579e] text-xs sm:text-sm font-normal leading-normal">
                                  {startFormatted || endFormatted ? `${startFormatted || 'Unknown'} - ${endFormatted || 'Unknown'}` : 'No dates provided'}
                                </p>
                                {education.gpa && (
                                  <span className="bg-[#e6e9f4] text-[#0d0f1c] px-2 py-1 rounded-full text-xs font-medium">
                                    GPA: {education.gpa}
                                  </span>
                                )}
                              </div>
                              
                              {/* Show description only when expanded */}
                              {education.description && isExpanded && (
                                <div className="mt-2">
                                  <p className="text-[#0d0f1c] text-xs sm:text-sm font-normal leading-normal whitespace-pre-wrap">
                                    {education.description}
                                  </p>
                                </div>
                              )}
                              
                              {/* Read More button */}
                              {education.description && (
                                <button
                                  onClick={() => toggleExperienceExpansion(education.id)}
                                  className="flex min-w-[84px] max-w-[200px] sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 sm:h-10 px-3 sm:px-4 bg-[#e6e9f4] text-[#0d0f1c] text-xs sm:text-sm font-medium leading-normal w-fit mt-2"
                                >
                                  <span className="truncate">{isExpanded ? 'Read Less' : 'Read More'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-[#47579e] text-sm sm:text-base italic">No education added yet.</p>
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