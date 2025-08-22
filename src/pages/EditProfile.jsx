import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import skillsData from '../data/skills.json';
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker.css";

// Import optimized components
import UnsavedChangesIndicator from '../components/edit-profile/shared/UnsavedChangesIndicator';
import EditProfileHeader from '../components/edit-profile/EditProfileHeader';
import EditProfileTabs from '../components/edit-profile/EditProfileTabs';
import BasicInfoForm from '../components/edit-profile/forms/BasicInfoForm';
import AboutSection from '../components/edit-profile/sections/AboutSection';
import ProfilePhotoUpload from '../components/edit-profile/upload/ProfilePhotoUpload';
import ProjectsSection from '../components/edit-profile/sections/ProjectsSection';
import SkillsSection from '../components/edit-profile/sections/SkillsSection';
import ExperienceSection from '../components/edit-profile/sections/ExperienceSection';
import EducationSection from '../components/edit-profile/sections/EducationSection';

export default function EditProfile({ session }) {
  const [user, setUser] = useState(session?.user || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    location: '',
    about_me: '',
    profile_photo_url: '',
    
    // Project 1
    project1_title: '',
    project1_description: '',
    project1_type: '',
    project1_folder_url: '',
    project1_pdf_url: '',
    project1_thumbnail_url: '',
    
    // Project 2
    project2_title: '',
    project2_description: '',
    project2_type: '',
    project2_folder_url: '',
    project2_pdf_url: '',
    project2_thumbnail_url: '',
    
    // Skills
    skills: [],
    
    // Experiences
    experiences: [
      {
        id: 1,
        title: '',
        company: '',
        location: '',
        description: '',
        start_date: null,
        end_date: null,
        current: false
      }
    ],
    
    // Education
    education: [
      {
        id: 1,
        degree: '',
        institution: '',
        field_of_study: '',
        location: '',
        description: '',
        start_date: null,
        end_date: null,
        current: false,
        gpa: ''
      }
    ]
  });
  
  const [activeTab, setActiveTab] = useState('about');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [error, setError] = useState(null);
  
  // Form persistence state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialProfile, setInitialProfile] = useState(null);
  
  // Upload states
  const [uploadStates, setUploadStates] = useState({
    profile_photo: { uploading: false, progress: 0 },
    project1_folder: { uploading: false, progress: 0, files: [] },
    project1_pdf: { uploading: false, progress: 0 },
    project1_thumbnail: { uploading: false, progress: 0 },
    project2_folder: { uploading: false, progress: 0, files: [] },
    project2_pdf: { uploading: false, progress: 0 },
    project2_thumbnail: { uploading: false, progress: 0 }
  });

  // Get all skills from the JSON file
  const getAllSkills = () => {
    const allSkills = [];
    Object.values(skillsData.categories).forEach(categorySkills => {
      allSkills.push(...categorySkills);
    });
    return allSkills;
  };

  const predefinedSkills = getAllSkills();

  // Effects
  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
      fetchProfile(session.user);
    } else {
      navigate('/auth');
    }
  }, [session]);

  useEffect(() => {
    if (initialProfile && profile) {
      const hasChanges = JSON.stringify(profile) !== JSON.stringify(initialProfile);
      setHasUnsavedChanges(hasChanges);
    }
  }, [profile, initialProfile]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      const autoSaveTimer = setTimeout(autoSaveProfile, 30000);
      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, profile]);

  // Helper functions
  const parseDate = (dateString) => {
    if (!dateString) return null;
    if (dateString instanceof Date) return dateString;
    
    if (typeof dateString === 'string') {
      if (dateString.includes('T') || dateString.includes('-')) {
        return new Date(dateString);
      }
      const monthYearRegex = /^(\w+)\s+(\d{4})$/;
      const match = dateString.match(monthYearRegex);
      if (match) {
        const [, month, year] = match;
        return new Date(`${month} 1, ${year}`);
      }
    }
    
    return null;
  };

  const formatDateForStorage = (date) => {
    if (!date) return null;
    return date.toISOString();
  };

  const generateSlug = (name) => {
    if (!name) return null;
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50);
  };

  // Data fetching
  const fetchProfile = async (currentUser) => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        setError(`Database error: ${error.message}`);
      } else if (data) {
        // Handle experiences
        let experiences = [];
        if (data.experiences && Array.isArray(data.experiences) && data.experiences.length > 0) {
          experiences = data.experiences.map(exp => ({
            ...exp,
            start_date: parseDate(exp.start_date),
            end_date: parseDate(exp.end_date)
          }));
        } else {
          experiences = [{
            id: 1,
            title: '',
            company: '',
            location: '',
            description: '',
            start_date: null,
            end_date: null,
            current: false
          }];
        }
        
        // Handle education
        let education = [];
        if (data.education && Array.isArray(data.education) && data.education.length > 0) {
          education = data.education.map(edu => ({
            ...edu,
            start_date: parseDate(edu.start_date),
            end_date: parseDate(edu.end_date)
          }));
        } else {
          education = [{
            id: 1,
            degree: '',
            institution: '',
            field_of_study: '',
            location: '',
            description: '',
            start_date: null,
            end_date: null,
            current: false,
            gpa: ''
          }];
        }
        
        const parsedProfile = {
          ...data,
          experiences,
          education
        };
        
        setProfile(parsedProfile);
        setInitialProfile(JSON.parse(JSON.stringify(parsedProfile)));
        
        if (data.skills && Array.isArray(data.skills)) {
          setSelectedSkills(data.skills);
        }
      } else {
        // Set default profile
        const defaultProfile = {
          ...profile,
          experiences: [{
            id: 1,
            title: '',
            company: '',
            location: '',
            description: '',
            start_date: null,
            end_date: null,
            current: false
          }],
          education: [{
            id: 1,
            degree: '',
            institution: '',
            field_of_study: '',
            location: '',
            description: '',
            start_date: null,
            end_date: null,
            current: false,
            gpa: ''
          }]
        };
        setProfile(defaultProfile);
        setInitialProfile(JSON.parse(JSON.stringify(defaultProfile)));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(`Failed to load profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Input handling
  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  // Tab switching
  const handleTabSwitch = (newTab) => {
    if (hasUnsavedChanges) {
      const confirmSwitch = window.confirm(
        'You have unsaved changes. Do you want to switch tabs? Your changes will be auto-saved.'
      );
      if (confirmSwitch) {
        autoSaveProfile();
        setActiveTab(newTab);
      }
    } else {
      setActiveTab(newTab);
    }
  };

  // Save functions
  const autoSaveProfile = async () => {
    if (!user || !hasUnsavedChanges) return;
    
    try {
      const slug = generateSlug(profile.name);
      
      const profileData = {
        ...profile,
        skills: selectedSkills,
        id: user.id,
        email: user.email,
        slug: slug,
        updated_at: new Date().toISOString(),
        experiences: profile.experiences.map(exp => ({
          ...exp,
          start_date: formatDateForStorage(exp.start_date),
          end_date: formatDateForStorage(exp.end_date)
        })),
        education: profile.education.map(edu => ({
          ...edu,
          start_date: formatDateForStorage(edu.start_date),
          end_date: formatDateForStorage(edu.end_date)
        }))
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (!error) {
        setInitialProfile(JSON.parse(JSON.stringify(profile)));
        setHasUnsavedChanges(false);
        console.log('Auto-saved profile');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    try {
      const slug = generateSlug(profile.name);
      
      const profileData = {
        ...profile,
        skills: selectedSkills,
        id: user.id,
        email: user.email,
        slug: slug,
        updated_at: new Date().toISOString(),
        experiences: profile.experiences.map(exp => ({
          ...exp,
          start_date: formatDateForStorage(exp.start_date),
          end_date: formatDateForStorage(exp.end_date)
        })),
        education: profile.education.map(edu => ({
          ...edu,
          start_date: formatDateForStorage(edu.start_date),
          end_date: formatDateForStorage(edu.end_date)
        }))
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) throw error;
      
      setInitialProfile(JSON.parse(JSON.stringify(profile)));
      setHasUnsavedChanges(false);
      
      alert('Profile saved successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(`Failed to save profile: ${error.message}`);
    }
  };

  // Upload functions
  const updateUploadState = (field, updates) => {
    setUploadStates(prev => ({
      ...prev,
      [field]: { ...prev[field], ...updates }
    }));
  };

  const handleFileUpload = async (file, bucketName, projectNumber, field) => {
    if (!file || !user) return;

    const uploadKey = field.replace('_url', '');
    updateUploadState(uploadKey, { uploading: true, progress: 0 });

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100;
            updateUploadState(uploadKey, { progress: percentage });
          }
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      handleInputChange(field, urlData.publicUrl);
      updateUploadState(uploadKey, { uploading: false, progress: 100 });
      
      setTimeout(() => {
        updateUploadState(uploadKey, { progress: 0 });
      }, 2000);

    } catch (error) {
      console.error('Error uploading file:', error);
      updateUploadState(uploadKey, { uploading: false, progress: 0 });
      alert('Error uploading file. Please try again.');
    }
  };

  const handleFolderUpload = async (e, field = 'project1_folder_url') => {
    const files = Array.from(e.target.files);
    const projectFolder = `project-${Date.now()}`;

    let rootFolder = '';

    for (const file of files) {
      const relativePath = file.webkitRelativePath || file.name;

      if (!rootFolder) {
        const parts = relativePath.split('/');
        if (parts.length > 1) {
          rootFolder = parts[0];
        }
      }

      const uploadPath = `${projectFolder}/${relativePath.replace('story.html', 'index.html')}`;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', uploadPath);

      try {
        const res = await fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: formData,
        });
        const result = await res.json();
        console.log('Uploaded:', result.path);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    const liveUrl = `http://localhost:5000/uploads/${projectFolder}/${rootFolder}`;
    handleInputChange(field, liveUrl);
  };

  // Experience functions
  const addExperience = () => {
    const newExperience = {
      id: Date.now(),
      title: '',
      company: '',
      location: '',
      description: '',
      start_date: null,
      end_date: null,
      current: false
    };
    
    setProfile(prev => ({
      ...prev,
      experiences: [...prev.experiences, newExperience]
    }));
    
    setHasUnsavedChanges(true);
  };

  const removeExperience = (experienceId) => {
    if (profile.experiences.length <= 1) {
      alert("You must have at least one experience entry.");
      return;
    }
    
    const confirmDelete = window.confirm("Are you sure you want to remove this experience?");
    if (confirmDelete) {
      setProfile(prev => ({
        ...prev,
        experiences: prev.experiences.filter(exp => exp.id !== experienceId)
      }));
      setHasUnsavedChanges(true);
    }
  };

  const updateExperience = (experienceId, field, value) => {
    setProfile(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => 
        exp.id === experienceId 
          ? { ...exp, [field]: value }
          : exp
      )
    }));
    setHasUnsavedChanges(true);
  };

  // Education functions
  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      degree: '',
      institution: '',
      field_of_study: '',
      location: '',
      description: '',
      start_date: null,
      end_date: null,
      current: false,
      gpa: ''
    };
    
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
    
    setHasUnsavedChanges(true);
  };

  const removeEducation = (educationId) => {
    if (profile.education.length <= 1) {
      alert("You must have at least one education entry.");
      return;
    }
    
    const confirmDelete = window.confirm("Are you sure you want to remove this education?");
    if (confirmDelete) {
      setProfile(prev => ({
        ...prev,
        education: prev.education.filter(edu => edu.id !== educationId)
      }));
      setHasUnsavedChanges(true);
    }
  };

  const updateEducation = (educationId, field, value) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === educationId 
          ? { ...edu, [field]: value }
          : edu
      )
    }));
    setHasUnsavedChanges(true);
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4">
        <div className="text-base sm:text-lg text-[#0d0f1c]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4">
        <div className="text-base sm:text-lg text-[#0d0f1c]">Please log in to continue...</div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f8f9fc] group/design-root overflow-x-hidden mt-20" style={{fontFamily: '"Work Sans", "Noto Sans", sans-serif'}}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-6 md:px-8 lg:px-16 xl:px-40 flex flex-1 justify-center py-4 sm:py-5">
          <div className="layout-content-container flex flex-col max-w-[480px] sm:max-w-[600px] md:max-w-[720px] lg:max-w-[960px] flex-1 w-full">
            
            <UnsavedChangesIndicator hasUnsavedChanges={hasUnsavedChanges} />
            
            <EditProfileHeader 
              profile={profile} 
              hasUnsavedChanges={hasUnsavedChanges} 
              onSave={saveProfile} 
            />

            <ProfilePhotoUpload 
              profile={profile}
              uploadStates={uploadStates}
              onFileUpload={(file) => handleFileUpload(file, 'profile-photos', null, 'profile_photo_url')}
            />

            <BasicInfoForm 
              profile={profile} 
              onInputChange={handleInputChange} 
            />

            <EditProfileTabs 
              activeTab={activeTab} 
              onTabSwitch={handleTabSwitch} 
            />

            {/* Tab Content */}
            {activeTab === 'about' && (
              <AboutSection 
                profile={profile} 
                onInputChange={handleInputChange} 
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsSection 
                profile={profile}
                uploadStates={uploadStates}
                onInputChange={handleInputChange}
                onFileUpload={handleFileUpload}
                onFolderUpload={handleFolderUpload}
              />
            )}

            {activeTab === 'skills' && (
              <SkillsSection 
                profile={profile}
                selectedSkills={selectedSkills}
                setSelectedSkills={setSelectedSkills}
                onInputChange={handleInputChange}
                skillsData={skillsData} // Change this line - pass the full object instead of predefinedSkills
                predefinedSkills={predefinedSkills}
              />
            )}

            {activeTab === 'experience' && (
              <ExperienceSection 
                profile={profile}
                onAddExperience={addExperience}
                onRemoveExperience={removeExperience}
                onUpdateExperience={updateExperience}
              />
            )}

            {activeTab === 'education' && (
              <EducationSection 
                profile={profile}
                onAddEducation={addEducation}
                onRemoveEducation={removeEducation}
                onUpdateEducation={updateEducation}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}