import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

// Import profile components
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import AboutSection from '../components/profile/AboutSection';
import ProjectsSection from '../components/profile/ProjectsSection';
import SkillsSection from '../components/profile/SkillsSection';
import ExperienceSection from '../components/profile/ExperienceSection';
import EducationSection from '../components/profile/EducationSection';

export default function DetailProfile({ session }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('about');
  const [expandedExperience, setExpandedExperience] = useState({});
  const navigate = useNavigate();
  
  const { slug } = useParams();
  const profileIdentifier = slug || session?.user?.id;
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
      const sections = ['about', 'projects', 'skills', 'experience', 'education'];
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

  const fetchProfile = async (identifier) => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase.from('profiles').select('*');
      
      if (slug) {
        query = query.eq('slug', identifier);
      } else {
        query = query.eq('id', identifier);
      }
      
      const { data, error } = await query.single();

      if (error) {
        console.error('Profile fetch error:', error);
        if (error.code === 'PGRST116') {
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
            
            <ProfileHeader profile={profile} canEdit={canEdit} />
            <ProfileTabs activeSection={activeSection} scrollToSection={scrollToSection} />

            <div className="space-y-8 sm:space-y-12">
              <AboutSection profile={profile} />
              <ProjectsSection profile={profile} />
              <SkillsSection profile={profile} />
              <ExperienceSection 
                profile={profile} 
                expandedExperience={expandedExperience} 
                toggleExperienceExpansion={toggleExperienceExpansion} 
              />
              <EducationSection 
                profile={profile} 
                expandedExperience={expandedExperience} 
                toggleExperienceExpansion={toggleExperienceExpansion} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}