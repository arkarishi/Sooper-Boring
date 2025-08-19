import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import skillsData from '../data/skills.json';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker.css";

export default function EditProfile({ session }) {
  const [user, setUser] = useState(session?.user || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Update the profile state to include the new fields
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
    project1_folder_url: '',    // For e-Learning
    project1_pdf_url: '',       // For Storyboard - NEW
    project1_thumbnail_url: '',
    
    // Project 2
    project2_title: '',
    project2_description: '',
    project2_type: '',
    project2_folder_url: '',    // For e-Learning
    project2_pdf_url: '',       // For Storyboard - NEW
    project2_thumbnail_url: '',
    
    // Skills
    skills: [],
    
    // Experience - Now with additional fields
    experience1_title: '',
    experience1_company: '',
    experience1_location: '',
    experience1_description: '',
    experience1_start_date: null,
    experience1_end_date: null,
    experience1_current: false,
    experience2_title: '',
    experience2_company: '',
    experience2_location: '',
    experience2_description: '',
    experience2_start_date: null,
    experience2_end_date: null,
    experience2_current: false,
    experience3_title: '',
    experience3_company: '',
    experience3_location: '',
    experience3_description: '',
    experience3_start_date: null,
    experience3_end_date: null,
    experience3_current: false
  });
  
  const [activeTab, setActiveTab] = useState('about');
  const [skillsInput, setSkillsInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const skillsInputRef = useRef(null);
  const [error, setError] = useState(null);
  
  // Add state for form persistence
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialProfile, setInitialProfile] = useState(null);
  
  // Upload states
  const [uploadStates, setUploadStates] = useState({
    profile_photo: { uploading: false, progress: 0 },
    project1_folder: { uploading: false, progress: 0, files: [] },
    project1_pdf: { uploading: false, progress: 0 },      // NEW
    project1_thumbnail: { uploading: false, progress: 0 },
    project2_folder: { uploading: false, progress: 0, files: [] },
    project2_pdf: { uploading: false, progress: 0 },      // NEW
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

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
      fetchProfile(session.user);
    } else {
      navigate('/auth');
    }
  }, [session]);

  // Add effect to track unsaved changes
  useEffect(() => {
    if (initialProfile && profile) {
      const hasChanges = JSON.stringify(profile) !== JSON.stringify(initialProfile);
      setHasUnsavedChanges(hasChanges);
    }
  }, [profile, initialProfile]);

  // Add beforeunload event listener to warn about unsaved changes
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
        // Parse dates when loading profile
        const parsedProfile = {
          ...data,
          experience1_start_date: parseDate(data.experience1_start_date),
          experience1_end_date: parseDate(data.experience1_end_date),
          experience2_start_date: parseDate(data.experience2_start_date),
          experience2_end_date: parseDate(data.experience2_end_date),
          experience3_start_date: parseDate(data.experience3_start_date),
          experience3_end_date: parseDate(data.experience3_end_date)
        };
        
        setProfile(parsedProfile);
        setInitialProfile(JSON.parse(JSON.stringify(parsedProfile))); // Deep copy for comparison
        
        if (data.skills && Array.isArray(data.skills)) {
          setSelectedSkills(data.skills);
        }
      } else {
        // Set initial profile as empty profile for new users
        setInitialProfile(JSON.parse(JSON.stringify(profile)));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(`Failed to load profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Mark as having unsaved changes
    setHasUnsavedChanges(true);
  };

  // Add auto-save functionality (optional)
  const autoSaveProfile = async () => {
    if (!user || !hasUnsavedChanges) return;
    
    try {
      const profileData = {
        ...profile,
        skills: selectedSkills,
        id: user.id,
        email: user.email,
        updated_at: new Date().toISOString(),
        // Format dates for storage
        experience1_start_date: formatDateForStorage(profile.experience1_start_date),
        experience1_end_date: formatDateForStorage(profile.experience1_end_date),
        experience2_start_date: formatDateForStorage(profile.experience2_start_date),
        experience2_end_date: formatDateForStorage(profile.experience2_end_date),
        experience3_start_date: formatDateForStorage(profile.experience3_start_date),
        experience3_end_date: formatDateForStorage(profile.experience3_end_date)
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

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      const autoSaveTimer = setTimeout(autoSaveProfile, 30000);
      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, profile]);

  const updateUploadState = (field, updates) => {
    setUploadStates(prev => ({
      ...prev,
      [field]: { ...prev[field], ...updates }
    }));
  };

  const handleFileUpload = async (file, bucketName, field) => {
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

 /* const handleFolderUpload = async (files, bucketName, field) => {
    if (!files || files.length === 0 || !user) return;

    const uploadKey = field.replace('_url', '');
    const fileList = Array.from(files);
    
    updateUploadState(uploadKey, { 
      uploading: true, 
      progress: 0, 
      files: fileList.map(f => ({ name: f.name, status: 'pending' }))
    });

    const folderName = `${user.id}/${Date.now()}_folder`;
    let completedFiles = 0;

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const fileName = `${folderName}/${file.webkitRelativePath || file.name}`;
        
        // Update current file status
        updateUploadState(uploadKey, { 
          files: uploadStates[uploadKey].files.map((f, index) => 
            index === i ? { ...f, status: 'uploading' } : f
          )
        });

        const { error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file);

        if (error) throw error;

        // Update file status to completed
        completedFiles++;
        const progress = (completedFiles / fileList.length) * 100;
        
        updateUploadState(uploadKey, { 
          progress,
          files: uploadStates[uploadKey].files.map((f, index) => 
            index === i ? { ...f, status: 'completed' } : f
          )
        });
      }

      // Set folder URL (you might want to store the folder path instead)
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(folderName);

      handleInputChange(field, urlData.publicUrl);
      updateUploadState(uploadKey, { uploading: false, progress: 100 });

      setTimeout(() => {
        updateUploadState(uploadKey, { progress: 0, files: [] });
      }, 3000);

    } catch (error) {
      console.error('Error uploading folder:', error);
      updateUploadState(uploadKey, { uploading: false, progress: 0, files: [] });
      alert('Error uploading folder. Please try again.');
    }
  };
*/

  const handleFolderUpload = async (e, field = 'project1_folder_url') => {
    const files = Array.from(e.target.files);
    const projectFolder = `project-${Date.now()}`;

    let rootFolder = ''; // we'll detect this from the first file

    for (const file of files) {
      const relativePath = file.webkitRelativePath || file.name;

      // Get root folder only once (before first /)
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

    // ✅ Use root folder name to point to correct index.html path
    const liveUrl = `http://localhost:5000/uploads/${projectFolder}/${rootFolder}`;
    //handleInputChange('project1_folder_url', liveUrl);
    handleInputChange(field, liveUrl);
  };
  
  
  // Skills handling functions
  const handleSkillsInputChange = (e) => {
    const value = e.target.value;
    setSkillsInput(value);
    
    if (value.trim() === '') {
      setShowSkillsDropdown(false);
      setFilteredSkills([]);
      return;
    }

    // Filter skills based on input
    const filtered = predefinedSkills.filter(skill => 
      skill.toLowerCase().includes(value.toLowerCase()) && 
      !selectedSkills.includes(skill)
    );
    
    setFilteredSkills(filtered);
    setShowSkillsDropdown(filtered.length > 0);
  };

  const handleSkillSelect = (skill) => {
    if (!selectedSkills.includes(skill)) {
      const newSkills = [...selectedSkills, skill];
      setSelectedSkills(newSkills);
      handleInputChange('skills', newSkills);
    }
    setSkillsInput('');
    setShowSkillsDropdown(false);
    setFilteredSkills([]);
  };

  const handleSkillRemove = (skillToRemove) => {
    const newSkills = selectedSkills.filter(skill => skill !== skillToRemove);
    setSelectedSkills(newSkills);
    handleInputChange('skills', newSkills);
  };

  const handleSkillsInputKeyDown = (e) => {
    if (e.key === 'Enter' && skillsInput.trim()) {
      e.preventDefault();
      const trimmedSkill = skillsInput.trim();
      
      // Check if it's an exact match from filtered skills
      const exactMatch = filteredSkills.find(skill => 
        skill.toLowerCase() === trimmedSkill.toLowerCase()
      );
      
      if (exactMatch) {
        handleSkillSelect(exactMatch);
      } else if (!selectedSkills.includes(trimmedSkill)) {
        // Add custom skill if it doesn't exist
        const newSkills = [...selectedSkills, trimmedSkill];
        setSelectedSkills(newSkills);
        handleInputChange('skills', newSkills);
        setSkillsInput('');
        setShowSkillsDropdown(false);
      }
    } else if (e.key === 'Escape') {
      setShowSkillsDropdown(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (skillsInputRef.current && !skillsInputRef.current.contains(event.target)) {
        setShowSkillsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper function to parse date strings to Date objects
  const parseDate = (dateString) => {
    if (!dateString) return null;
    if (dateString instanceof Date) return dateString;
    
    // Handle different date formats
    if (typeof dateString === 'string') {
      // If it's already in ISO format
      if (dateString.includes('T') || dateString.includes('-')) {
        return new Date(dateString);
      }
      // If it's in "Month Year" format
      const monthYearRegex = /^(\w+)\s+(\d{4})$/;
      const match = dateString.match(monthYearRegex);
      if (match) {
        const [, month, year] = match;
        return new Date(`${month} 1, ${year}`);
      }
    }
    
    return null;
  };

  // Helper function to format date for display and storage
  const formatDateForStorage = (date) => {
    if (!date) return null;
    return date.toISOString();
  };

  const formatDateForDisplay = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Update the saveProfile function to handle date formatting
  const saveProfile = async () => {
    if (!user) return;
    try {
      const profileData = {
        ...profile,
        skills: selectedSkills,
        id: user.id,
        email: user.email,
        updated_at: new Date().toISOString(),
        // Format dates for storage
        experience1_start_date: formatDateForStorage(profile.experience1_start_date),
        experience1_end_date: formatDateForStorage(profile.experience1_end_date),
        experience2_start_date: formatDateForStorage(profile.experience2_start_date),
        experience2_end_date: formatDateForStorage(profile.experience2_end_date),
        experience3_start_date: formatDateForStorage(profile.experience3_start_date),
        experience3_end_date: formatDateForStorage(profile.experience3_end_date)
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) throw error;
      
      // Update initial profile state and clear unsaved changes
      setInitialProfile(JSON.parse(JSON.stringify(profile)));
      setHasUnsavedChanges(false);
      
      alert('Profile saved successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(`Failed to save profile: ${error.message}`);
    }
  };

  // Enhanced tab switching with unsaved changes warning
  const handleTabSwitch = (newTab) => {
    if (hasUnsavedChanges) {
      const confirmSwitch = window.confirm(
        'You have unsaved changes. Do you want to switch tabs? Your changes will be auto-saved.'
      );
      if (confirmSwitch) {
        autoSaveProfile(); // Auto-save before switching
        setActiveTab(newTab);
      }
    } else {
      setActiveTab(newTab);
    }
  };

  // Upload progress renderer
  const renderUploadProgress = (uploadKey) => {
    const state = uploadStates[uploadKey];
    
    if (!state.uploading && state.progress === 0) return null;

    return (
      <div className="px-3 sm:px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-medium text-[#0d0f1c]">
            {state.uploading ? 'Uploading...' : 'Upload Complete'}
          </span>
          <span className="text-xs sm:text-sm text-[#47579e]">{Math.round(state.progress)}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-[#ced3e9] rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              state.progress === 100 ? 'bg-green-500' : 'bg-[#4264fa]'
            }`}
            style={{ width: `${state.progress}%` }}
          />
        </div>

        {/* File List for Folder Uploads */}
        {state.files && state.files.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-[#47579e] mb-2">Files ({state.files.length}):</p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {state.files.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-[#0d0f1c] truncate flex-1 mr-2">{file.name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    file.status === 'completed' ? 'bg-green-100 text-green-800' :
                    file.status === 'uploading' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {file.status === 'completed' ? '✓' : 
                     file.status === 'uploading' ? '⟳' : '○'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {state.progress === 100 && !state.uploading && (
          <div className="flex items-center gap-2 mt-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs sm:text-sm text-green-600 font-medium">Upload successful!</span>
          </div>
        )}
      </div>
    );
  };

  // Custom DatePicker component with styling
  const CustomDatePicker = ({ 
    selected, 
    onChange, 
    placeholderText, 
    disabled = false,
    maxDate = null,
    minDate = null
  }) => (
    <div className="relative">
      <DatePicker
        selected={selected}
        onChange={onChange}
        dateFormat="MMMM yyyy"
        showMonthYearPicker
        placeholderText={placeholderText}
        maxDate={maxDate}
        minDate={minDate}
        disabled={disabled}
        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#4264fa] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal cursor-pointer"
        wrapperClassName="w-full"
        calendarClassName="custom-datepicker"
        popperClassName="custom-datepicker-popper"
      />
      <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#47579e]">
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  );

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
            
            {/* Unsaved Changes Indicator */}
            {hasUnsavedChanges && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-yellow-800 text-sm">You have unsaved changes. They will be auto-saved in 30 seconds.</span>
              </div>
            )}

            {/* Profile Header */}
            <div className="flex p-3 sm:p-4">
              <div className="flex w-full flex-col gap-3 sm:gap-4 items-center">
                <div className="flex gap-3 sm:gap-4 flex-col items-center">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-24 w-24 sm:min-h-28 sm:w-28 md:min-h-32 md:w-32"
                    style={{backgroundImage: `url("${profile.profile_photo_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBENKwH5nxkytSSvv9toA494x-gAePUj0MlHpaEoRNu-6u_LkhO7frHlxdTZtB-RDN91ClkxwhxLCKSuc0DGiCASQpdsKUgErw98KJxZHMVWhaHKyUmskZzRk-OShdv-uHb4okA-_yrwS2qshQDp7iJrQusoYRbd87JF-01zdeKwzKDuG-aMbLYrNWjXcqAFxq-ACDXoNhoavNiJVXs8dtDM3AureQYuWelAgCJK7Xr3zlcda9WrJs8pQ_DsJVwNdF79VTIjG2XhbE'}")`}}
                  />
                  <div className="flex flex-col items-center justify-center px-2">
                    <p className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">
                      {profile.name || 'Your Name'}
                    </p>
                    <p className="text-[#47579e] text-sm sm:text-base font-normal leading-normal text-center">
                      {profile.title || 'Your Title'}
                    </p>
                    <p className="text-[#47579e] text-sm sm:text-base font-normal leading-normal text-center">
                      {profile.location || 'Your Location'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={saveProfile}
                  className={`flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-bold leading-normal tracking-[0.015em] w-full max-w-[320px] sm:max-w-[480px] ${
                    hasUnsavedChanges 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-[#e6e9f4] text-[#0d0f1c] hover:bg-[#d1d6ed]'
                  }`}
                >
                  <span className="truncate">
                    {hasUnsavedChanges ? 'Save Changes' : 'Save Profile'}
                  </span>
                </button>
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div className="flex flex-col p-3 sm:p-4">
              <div className="flex flex-col items-center gap-4 sm:gap-6 rounded-xl border-2 border-dashed border-[#ced3e9] px-4 sm:px-6 py-10 sm:py-14">
                <div className="flex max-w-[480px] flex-col items-center gap-2">
                  <p className="text-[#0d0f1c] text-base sm:text-lg font-bold leading-tight tracking-[-0.015em] text-center">Upload Profile Photo</p>
                  <p className="text-[#0d0f1c] text-sm font-normal leading-normal text-center">Click to select a JPG or PNG image</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'profile-photos', 'profile_photo_url')}
                  className="hidden"
                  id="profile-photo"
                  disabled={uploadStates.profile_photo.uploading}
                />
                <label
                  htmlFor="profile-photo"
                  className={`flex min-w-[84px] max-w-[320px] sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-bold leading-normal tracking-[0.015em] ${
                    uploadStates.profile_photo.uploading 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#e6e9f4] text-[#0d0f1c] hover:bg-[#d1d6ed]'
                  }`}
                >
                  <span className="truncate">
                    {uploadStates.profile_photo.uploading ? 'Uploading...' : 'Add Image'}
                  </span>
                </label>
              </div>
              {renderUploadProgress('profile_photo')}
            </div>

            {/* Basic Info Fields */}
            <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Name</p>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your name"
                />
              </label>
            </div>

            <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Title</p>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                  value={profile.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Instructional Designer"
                />
              </label>
            </div>

            <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Location</p>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                  value={profile.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., New York, NY"
                />
              </label>
            </div>

            {/* Tab Navigation - Updated with enhanced tab switching */}
            <div className="pb-3">
              <div className="flex border-b border-[#ced3e9] px-3 sm:px-4 gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-hide">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabSwitch('about');
                  }}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-2 sm:px-3 transition-colors duration-200 whitespace-nowrap ${
                    activeTab === 'about' 
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
                    handleTabSwitch('projects');
                  }}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-2 sm:px-3 transition-colors duration-200 whitespace-nowrap ${
                    activeTab === 'projects' 
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
                    handleTabSwitch('skills');
                  }}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-2 sm:px-3 transition-colors duration-200 whitespace-nowrap ${
                    activeTab === 'skills' 
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
                    handleTabSwitch('experience');
                  }}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-2 sm:px-3 transition-colors duration-200 whitespace-nowrap ${
                    activeTab === 'experience' 
                    ? 'border-b-[#4264fa] text-[#0d0f1c]' 
                    : 'border-b-transparent text-[#47579e] hover:text-[#0d0f1c]'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-bold leading-normal tracking-[0.015em]">Experience</p>
                </a>
              </div>
            </div>

            {/* Tab Content - All existing content remains the same */}
            {activeTab === 'about' && (
              <>
                <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] px-3 sm:px-4 pb-3 pt-5">About Me</h2>
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Edit About Me</p>
                    <textarea
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] min-h-32 sm:min-h-36 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={profile.about_me}
                      onChange={(e) => handleInputChange('about_me', e.target.value)}
                      placeholder="Tell us more about yourself, your background, and what drives you in instructional design..."
                    />
                  </label>
                </div>
              </>
            )}

            {activeTab === 'projects' && (
              <>
                <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] px-3 sm:px-4 pb-3 pt-5">Projects</h2>
                
                {/* Project 1 */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Project 1 Title</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={profile.project1_title}
                      onChange={(e) => handleInputChange('project1_title', e.target.value)}
                      placeholder="Enter project title"
                    />
                  </label>
                </div>

                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Project 1 Description</p>
                    <textarea
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] min-h-32 sm:min-h-36 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={profile.project1_description}
                      onChange={(e) => handleInputChange('project1_description', e.target.value)}
                      placeholder="Describe your project..."
                    />
                  </label>
                </div>

                {/* Project 1 Type Selection - Updated */}
                <div className="flex flex-wrap gap-2 sm:gap-3 p-3 sm:p-4">
                  <label className={`text-xs sm:text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-3 sm:px-4 h-10 sm:h-11 relative cursor-pointer ${
                    profile.project1_type === 'Storyboard' ? 'border-[3px] border-[#4264fa] px-2.5 sm:px-3.5' : 'border border-[#ced3e9]'
                  } text-[#0d0f1c]`}>
                    📄 Storyboard (PDF)
                    <input
                      type="radio"
                      className="invisible absolute"
                      name="project1_type"
                      checked={profile.project1_type === 'Storyboard'}
                      onChange={() => {
                        handleInputChange('project1_type', 'Storyboard');
                        // Clear the opposite field when type changes
                        handleInputChange('project1_folder_url', '');//////////
                      }}
                    />
                  </label>
                  <label className={`text-xs sm:text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-3 sm:px-4 h-10 sm:h-11 relative cursor-pointer ${
                    profile.project1_type === 'e-Learning' ? 'border-[3px] border-[#4264fa] px-2.5 sm:px-3.5' : 'border border-[#ced3e9]'
                  } text-[#0d0f1c]`}>
                    💻 e-Learning (Folder)
                    <input
                      type="radio"
                      className="invisible absolute"
                      name="project1_type"
                      checked={profile.project1_type === 'e-Learning'}
                      onChange={() => {
                        handleInputChange('project1_type', 'e-Learning');
                        // Clear the opposite field when type changes
                        handleInputChange('project1_pdf_url', '');
                      }}
                    />
                  </label>
                </div>

                {/* Conditional Upload Section for Project 1 */}
                {profile.project1_type === 'e-Learning' && (
                  <div className="flex flex-col p-3 sm:p-4">
                    <div className="flex flex-col items-center gap-4 sm:gap-6 rounded-xl border-2 border-dashed border-[#ced3e9] px-4 sm:px-6 py-10 sm:py-14">
                      <div className="flex max-w-[480px] flex-col items-center gap-2">
                        <p className="text-[#0d0f1c] text-base sm:text-lg font-bold leading-tight tracking-[-0.015em] text-center">Upload e-Learning Project Folder</p>
                        <p className="text-[#0d0f1c] text-sm font-normal leading-normal text-center">Select the entire project folder containing HTML, CSS, JS files</p>
                      </div>
                      <input
                        type="file"
                        webkitdirectory="true"
						directory=""
						multiple
                        //onChange={(e) => handleFolderUpload(e.target.files, 'project-folders', 'project1_folder_url')}//////18
						onChange={e => handleFolderUpload(e, 'project1_folder_url')} //////////////
						disabled={uploadStates.project1_folder.uploading}
                        className="hidden"
                        id="project1-folder"
                        //disabled={uploadStates.project1_folder.uploading}
						ref={el => (window.project1FolderInput = el)} // Add a ref for programmatic click
                      />
                     <button
                    type="button"
                    onClick={() => window.project1FolderInput && window.project1FolderInput.click()}
                    className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] ${uploadStates.project1_folder.uploading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#e6e9f4] text-[#0d0f1c] hover:bg-[#d1d6ed]'
                      }`}
                    disabled={uploadStates.project1_folder.uploading}
                  >
                      
                        <span className="truncate">
                          {uploadStates.project1_folder.uploading ? 'Uploading...' : '📁 Add e-Learning Folder'}
                        </span>
                  
					  </button>
                    </div>
                    {renderUploadProgress('project1_folder')}
                  </div>
                )}

                {profile.project1_type === 'Storyboard' && (
                  <div className="flex flex-col p-3 sm:p-4">
                    <div className="flex flex-col items-center gap-4 sm:gap-6 rounded-xl border-2 border-dashed border-[#ced3e9] px-4 sm:px-6 py-10 sm:py-14">
                      <div className="flex max-w-[480px] flex-col items-center gap-2">
                        <p className="text-[#0d0f1c] text-base sm:text-lg font-bold leading-tight tracking-[-0.015em] text-center">Upload Storyboard PDF</p>
                        <p className="text-[#0d0f1c] text-sm font-normal leading-normal text-center">Select a PDF file containing your storyboard</p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload(e.target.files[0], 'project-pdfs', 'project1_pdf_url')}
                        className="hidden"
                        id="project1-pdf"
                        disabled={uploadStates.project1_pdf?.uploading}
                      />
                      <label
                        htmlFor="project1-pdf"
                        className={`flex min-w-[84px] max-w-[320px] sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-bold leading-normal tracking-[0.015em] ${
                          uploadStates.project1_pdf?.uploading 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#e6e9f4] text-[#0d0f1c] hover:bg-[#d1d6ed]'
                        }`}
                      >
                        <span className="truncate">
                          {uploadStates.project1_pdf?.uploading ? 'Uploading...' : '📄 Add PDF Storyboard'}
                        </span>
                      </label>
                    </div>
                    {renderUploadProgress('project1_pdf')}
                  </div>
                )}

                {/* Project 1 Thumbnail Upload - Always show */}
                <div className="flex flex-col p-3 sm:p-4">
                  <div className="flex flex-col items-center gap-4 sm:gap-6 rounded-xl border-2 border-dashed border-[#ced3e9] px-4 sm:px-6 py-10 sm:py-14">
                    <div className="flex max-w-[480px] flex-col items-center gap-2">
                      <p className="text-[#0d0f1c] text-base sm:text-lg font-bold leading-tight tracking-[-0.015em] text-center">Upload Thumbnail</p>
                      <p className="text-[#0d0f1c] text-sm font-normal leading-normal text-center">Click to select a JPG or PNG image</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'project-thumbnails', 'project1_thumbnail_url')}
                      className="hidden"
                      id="project1-thumbnail"
                      disabled={uploadStates.project1_thumbnail.uploading}
                    />
                    <label
                      htmlFor="project1-thumbnail"
                      className={`flex min-w-[84px] max-w-[320px] sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-bold leading-normal tracking-[0.015em] ${
                        uploadStates.project1_thumbnail.uploading 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-[#e6e9f4] text-[#0d0f1c] hover:bg-[#d1d6ed]'
                      }`}
                    >
                      <span className="truncate">
                        {uploadStates.project1_thumbnail.uploading ? 'Uploading...' : '🖼️ Add Thumbnail'}
                      </span>
                    </label>
                  </div>
                  {renderUploadProgress('project1_thumbnail')}
                </div>

                {/* Project 1 Thumbnail Preview */}
                {profile.project1_thumbnail_url && (
                  <div className="flex w-full grow bg-[#f8f9fc] p-3 sm:p-4">
                    <div className="w-full gap-1 overflow-hidden bg-[#f8f9fc] aspect-[3/2] rounded-xl flex">
                      <div
                        className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none flex-1"
                        style={{backgroundImage: `url("${profile.project1_thumbnail_url}")`}}
                      />
                    </div>
                  </div>
                )}

                {/* File Preview Section for Project 1 */}
                {(profile.project1_pdf_url || profile.project1_folder_url) && (
                  <div className="p-3 sm:p-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-800 font-medium">File uploaded successfully!</span>
                      </div>
                      <p className="text-green-700 text-sm">
                        {profile.project1_type === 'Storyboard' ? '📄 PDF Storyboard' : '📁 e-Learning Project Folder'} uploaded
                      </p>
                    </div>
                  </div>
                )}

                {/* Project 2 - Same structure as Project 1 */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Project 2 Title</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={profile.project2_title}
                      onChange={(e) => handleInputChange('project2_title', e.target.value)}
                      placeholder="Enter project title"
                    />
                  </label>
                </div>

                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Project 2 Description</p>
                    <textarea
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] min-h-32 sm:min-h-36 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={profile.project2_description}
                      onChange={(e) => handleInputChange('project2_description', e.target.value)}
                      placeholder="Describe your project..."
                    />
                  </label>
                </div>

                {/* Project 2 Type Selection */}
                <div className="flex flex-wrap gap-2 sm:gap-3 p-3 sm:p-4">
                  <label className={`text-xs sm:text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-3 sm:px-4 h-10 sm:h-11 relative cursor-pointer ${
                    profile.project2_type === 'Storyboard' ? 'border-[3px] border-[#4264fa] px-2.5 sm:px-3.5' : 'border border-[#ced3e9]'
                  } text-[#0d0f1c]`}>
                    📄 Storyboard (PDF)
                    <input
                      type="radio"
                      className="invisible absolute"
                      name="project2_type"
                      checked={profile.project2_type === 'Storyboard'}
                      onChange={() => {
                        handleInputChange('project2_type', 'Storyboard');
                        handleInputChange('project2_folder_url', '');
                      }}
                    />
                  </label>
                  <label className={`text-xs sm:text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-3 sm:px-4 h-10 sm:h-11 relative cursor-pointer ${
                    profile.project2_type === 'e-Learning' ? 'border-[3px] border-[#4264fa] px-2.5 sm:px-3.5' : 'border border-[#ced3e9]'
                  } text-[#0d0f1c]`}>
                    💻 e-Learning (Folder)
                    <input
                      type="radio"
                      className="invisible absolute"
                      name="project2_type"
                      checked={profile.project2_type === 'e-Learning'}
                      onChange={() => {
                        handleInputChange('project2_type', 'e-Learning');
                        handleInputChange('project2_pdf_url', '');
                      }}
                    />
                  </label>
                </div>

                {/* Conditional Upload Section for Project 2 */}
                {profile.project2_type === 'e-Learning' && (
                  <div className="flex flex-col p-3 sm:p-4">
                    <div className="flex flex-col items-center gap-4 sm:gap-6 rounded-xl border-2 border-dashed border-[#ced3e9] px-4 sm:px-6 py-10 sm:py-14">
                      <div className="flex max-w-[480px] flex-col items-center gap-2">
                        <p className="text-[#0d0f1c] text-base sm:text-lg font-bold leading-tight tracking-[-0.015em] text-center">Upload e-Learning Project Folder</p>
                        <p className="text-[#0d0f1c] text-sm font-normal leading-normal text-center">Select the entire project folder containing HTML, CSS, JS files</p>
                      </div>
                      <input
                        type="file"
                        webkitdirectory="true"
						directory=""
                        multiple
                        //onChange={(e) => handleFolderUpload(e.target.files, 'project-folders', 'project2_folder_url')}
						onChange={e => handleFolderUpload(e, 'project2_folder_url')}
						disabled={uploadStates.project2_folder.uploading}
                        className="hidden"
                        id="project2-folder"
                        //disabled={uploadStates.project2_folder.uploading}
						ref={el => (window.project2FolderInput = el)}
                      />
                    
					    <button
                    type="button"
                    onClick={() => window.project2FolderInput && window.project2FolderInput.click()}
                    className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] ${uploadStates.project2_folder.uploading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#e6e9f4] text-[#0d0f1c] hover:bg-[#d1d6ed]'
                      }`}
                    disabled={uploadStates.project2_folder.uploading}
                  >
                    <span className="truncate">
                      {uploadStates.project2_folder.uploading ? 'Uploading...' : 'Add Folder'}
                    </span>
                  </button>
                    </div>
                    {renderUploadProgress('project2_folder')}
                  </div>
                )}

                {profile.project2_type === 'Storyboard' && (
                  <div className="flex flex-col p-3 sm:p-4">
                    <div className="flex flex-col items-center gap-4 sm:gap-6 rounded-xl border-2 border-dashed border-[#ced3e9] px-4 sm:px-6 py-10 sm:py-14">
                      <div className="flex max-w-[480px] flex-col items-center gap-2">
                        <p className="text-[#0d0f1c] text-base sm:text-lg font-bold leading-tight tracking-[-0.015em] text-center">Upload Storyboard PDF</p>
                        <p className="text-[#0d0f1c] text-sm font-normal leading-normal text-center">Select a PDF file containing your storyboard</p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload(e.target.files[0], 'project-pdfs', 'project2_pdf_url')}
                        className="hidden"
                        id="project2-pdf"
                        disabled={uploadStates.project2_pdf?.uploading}
                      />
                      <label
                        htmlFor="project2-pdf"
                        className={`flex min-w-[84px] max-w-[320px] sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-bold leading-normal tracking-[0.015em] ${
                          uploadStates.project2_pdf?.uploading 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#e6e9f4] text-[#0d0f1c] hover:bg-[#d1d6ed]'
                        }`}
                      >
                        <span className="truncate">
                          {uploadStates.project2_pdf?.uploading ? 'Uploading...' : '📄 Add PDF Storyboard'}
                        </span>
                      </label>
                    </div>
                    {renderUploadProgress('project2_pdf')}
                  </div>
                )}

                {/* Project 2 Thumbnail Upload */}
                <div className="flex flex-col p-3 sm:p-4">
                  <div className="flex flex-col items-center gap-4 sm:gap-6 rounded-xl border-2 border-dashed border-[#ced3e9] px-4 sm:px-6 py-10 sm:py-14">
                    <div className="flex max-w-[480px] flex-col items-center gap-2">
                      <p className="text-[#0d0f1c] text-base sm:text-lg font-bold leading-tight tracking-[-0.015em] text-center">Upload Thumbnail</p>
                      <p className="text-[#0d0f1c] text-sm font-normal leading-normal text-center">Click to select a JPG or PNG image</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'project-thumbnails', 'project2_thumbnail_url')}
                      className="hidden"
                      id="project2-thumbnail"
                      disabled={uploadStates.project2_thumbnail.uploading}
                    />
                    <label
                      htmlFor="project2-thumbnail"
                      className={`flex min-w-[84px] max-w-[320px] sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-bold leading-normal tracking-[0.015em] ${
                        uploadStates.project2_thumbnail.uploading 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-[#e6e9f4] text-[#0d0f1c] hover:bg-[#d1d6ed]'
                      }`}
                    >
                      <span className="truncate">
                        {uploadStates.project2_thumbnail.uploading ? 'Uploading...' : '🖼️ Add Thumbnail'}
                      </span>
                    </label>
                  </div>
                  {renderUploadProgress('project2_thumbnail')}
                </div>

                {/* Project 2 Thumbnail Preview */}
                {profile.project2_thumbnail_url && (
                  <div className="flex w-full grow bg-[#f8f9fc] p-3 sm:p-4">
                    <div className="w-full gap-1 overflow-hidden bg-[#f8f9fc] aspect-[3/2] rounded-xl flex">
                      <div
                        className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none flex-1"
                        style={{backgroundImage: `url("${profile.project2_thumbnail_url}")`}}
                      />
                    </div>
                  </div>
                )}

                {/* File Preview Section for Project 2 */}
                {(profile.project2_pdf_url || profile.project2_folder_url) && (
                  <div className="p-3 sm:p-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-800 font-medium">File uploaded successfully!</span>
                      </div>
                      <p className="text-green-700 text-sm">
                        {profile.project2_type === 'Storyboard' ? '📄 PDF Storyboard' : '📁 e-Learning Project Folder'} uploaded
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'skills' && (
              <>
                <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] px-3 sm:px-4 pb-3 pt-5">Skills</h2>
                
                {/* Skills Input with Dropdown */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1 relative" ref={skillsInputRef}>
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Add Skills</p>
                    <input
                      type="text"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={skillsInput}
                      onChange={handleSkillsInputChange}
                      onKeyDown={handleSkillsInputKeyDown}
                      placeholder="Type to search skills (e.g., React, Python, AWS, Machine Learning...)"
                      autoComplete="off"
                    />
                    
                    {/* Enhanced Dropdown */}
                    {showSkillsDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-[#ced3e9] rounded-xl shadow-lg max-h-64 overflow-y-auto z-10 mt-1">
                        {filteredSkills.slice(0, 20).map((skill, index) => (
                          <div
                            key={index}
                            className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-[#f8f9fc] cursor-pointer text-xs sm:text-sm text-[#0d0f1c] border-b border-[#ced3e9] last:border-b-0 flex items-center justify-between"
                            onClick={() => handleSkillSelect(skill)}
                          >
                            <span>{skill}</span>
                            <span className="text-xs text-[#47579e] opacity-60">Click to add</span>
                          </div>
                        ))}
                        {filteredSkills.length > 20 && (
                          <div className="px-3 sm:px-4 py-2 text-xs text-[#47579e] italic bg-[#f8f9fc]">
                            {filteredSkills.length - 20} more results... Keep typing to narrow down
                          </div>
                        )}
                        {filteredSkills.length === 0 && skillsInput.trim() && (
                          <div className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#47579e] italic">
                            Press Enter to add "{skillsInput.trim()}" as a custom skill
                          </div>
                        )}
                      </div>
                    )}
                  </label>
                </div>

                {/* Selected Skills Display */}
                {selectedSkills.length > 0 && (
                  <div className="px-3 sm:px-4 py-3">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-3">Selected Skills ({selectedSkills.length})</p>
                    <div className="flex gap-2 flex-wrap max-h-48 overflow-y-auto">
                      {selectedSkills.map((skill, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-center gap-x-2 rounded-full bg-[#e6e9f4] pl-3 sm:pl-4 pr-2 py-1.5 sm:py-2 group hover:bg-[#d1d6ed] transition-colors"
                        >
                          <p className="text-[#0d0f1c] text-xs sm:text-sm font-medium leading-normal">{skill}</p>
                          <button
                            onClick={() => handleSkillRemove(skill)}
                            className="ml-1 text-[#47579e] hover:text-[#0d0f1c] focus:outline-none p-1 rounded-full hover:bg-[#ced3e9] transition-colors"
                            aria-label={`Remove ${skill}`}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categorized Popular Skills */}
                <div className="px-3 sm:px-4 py-3">
                  <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-3">Popular Skills by Category</p>
                  {Object.entries(skillsData.popularSkills).map(([category, skills]) => (
                    <div key={category} className="mb-4">
                      <h4 className="text-[#47579e] text-xs sm:text-sm font-medium mb-2">{category}</h4>
                      <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                        {skills.filter(skill => !selectedSkills.includes(skill)).map((skill, index) => (
                          <button
                            key={index}
                            onClick={() => handleSkillSelect(skill)}
                            className="flex items-center justify-center rounded-full border border-[#ced3e9] bg-white hover:bg-[#f8f9fc] hover:border-[#4264fa] px-2 sm:px-3 py-1 sm:py-1.5 transition-all duration-200"
                          >
                            <span className="text-[#47579e] text-xs font-medium leading-normal">+ {skill}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skills Help Text */}
                <div className="px-3 sm:px-4 py-2">
                  <p className="text-[#47579e] text-sm leading-normal">
                    💡 <strong>Pro tip:</strong> Start typing to search from our database of {predefinedSkills.length}+ skills including programming languages, 
                    frameworks, cloud platforms, databases, and more. You can also add custom skills by pressing Enter.
                  </p>
                </div>
              </>
            )}

            {activeTab === 'experience' && (
              <>
                <h2 className="text-[#0d0f1c] text-lg sm:text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em] px-3 sm:px-4 pb-3 pt-5">Experience</h2>
                
                {/* Experience 1 */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Experience 1 Title</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={profile.experience1_title}
                      onChange={(e) => handleInputChange('experience1_title', e.target.value)}
                      placeholder="e.g., Senior Instructional Designer"
                    />
                  </label>
                </div>

                {/* Experience 1 - Designation */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Company/Organization</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={profile.experience1_company}
                      onChange={(e) => handleInputChange('experience1_company', e.target.value)}
                      placeholder="e.g., ABC Corp, XYZ University"
                    />
                  </label>
                </div>

                {/* Experience 1 - Location */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Location</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={profile.experience1_location}
                      onChange={(e) => handleInputChange('experience1_location', e.target.value)}
                      placeholder="e.g., New York, NY"
                    />
                  </label>
                </div>

                {/* Experience 1 - About Me */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">About this Role</p>
                    <textarea
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] min-h-24 sm:min-h-28 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={profile.experience1_description}
                      onChange={(e) => handleInputChange('experience1_description', e.target.value)}
                      placeholder="Describe your responsibilities, achievements, and key projects in this role..."
                    />
                  </label>
                </div>

                {/* Experience 1 - Dates */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Start Date</p>
                    <CustomDatePicker
                      selected={profile.experience1_start_date}
                      onChange={(date) => handleInputChange('experience1_start_date', date)}
                      placeholderText="Start Date"
                      maxDate={profile.experience1_end_date || new Date()}
                    />
                  </label>
                  {!profile.experience1_current && (
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">End Date</p>
                      <CustomDatePicker
                        selected={profile.experience1_end_date}
                        onChange={(date) => handleInputChange('experience1_end_date', date)}
                        placeholderText="End Date"
                        minDate={profile.experience1_start_date}
                        maxDate={new Date()}
                      />
                    </label>
                  )}
                </div>
                <div className="max-w-[480px] px-3 sm:px-4 pb-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={profile.experience1_current || false}
                      onChange={(e) => {
                        handleInputChange('experience1_current', e.target.checked);
                        if (e.target.checked) {
                          handleInputChange('experience1_end_date', null);
                        }
                      }}
                      className="w-4 h-4 bg-white border-2 border-[#ced3e9] rounded appearance-none checked:bg-[#4264fa] checked:border-[#4264fa] transition-all duration-200 relative"
                      style={{
                        backgroundColor: profile.experience1_current ? '#4264fa' : '#fff',
                        borderColor: profile.experience1_current ? '#4264fa' : '#ced3e9'
                      }}
                    />
                    <span className="text-[#47579e] text-sm sm:text-base font-medium">Currently working here</span>
                  </label>
                </div>

                {/* Experience 2 */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Experience 2 Title</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={profile.experience2_title}
                      onChange={(e) => handleInputChange('experience2_title', e.target.value)}
                      placeholder="Enter position title"
                    />
                  </label>
                </div>

                {/* Experience 2 - Company */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Company/Organization</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={profile.experience2_company}
                      onChange={(e) => handleInputChange('experience2_company', e.target.value)}
                      placeholder="e.g., ABC Corp, XYZ University"
                    />
                  </label>
                </div>

                {/* Experience 2 - Location */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Location</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={profile.experience2_location}
                      onChange={(e) => handleInputChange('experience2_location', e.target.value)}
                      placeholder="e.g., New York, NY"
                    />
                  </label>
                </div>

                {/* Experience 2 - Description */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">About this Role</p>
                    <textarea
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] min-h-24 sm:min-h-28 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={profile.experience2_description}
                      onChange={(e) => handleInputChange('experience2_description', e.target.value)}
                      placeholder="Describe your responsibilities, achievements, and key projects in this role..."
                    />
                  </label>
                </div>

                {/* Experience 2 - Dates */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Start Date</p>
                    <CustomDatePicker
                      selected={profile.experience2_start_date}
                      onChange={(date) => handleInputChange('experience2_start_date', date)}
                      placeholderText="Start Date"
                      maxDate={profile.experience2_end_date || new Date()}
                    />
                  </label>
                  {!profile.experience2_current && (
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">End Date</p>
                      <CustomDatePicker
                        selected={profile.experience2_end_date}
                        onChange={(date) => handleInputChange('experience2_end_date', date)}
                        placeholderText="End Date"
                        minDate={profile.experience2_start_date}
                        maxDate={new Date()}
                      />
                    </label>
                  )}
                </div>
                <div className="max-w-[480px] px-3 sm:px-4 pb-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={profile.experience2_current || false}
                      onChange={(e) => {
                        handleInputChange('experience2_current', e.target.checked);
                        if (e.target.checked) {
                          handleInputChange('experience2_end_date', null);
                        }
                      }}
                      className="w-4 h-4 bg-white border-2 border-[#ced3e9] rounded appearance-none checked:bg-[#4264fa] checked:border-[#4264fa] transition-all duration-200 relative"
                      style={{
                        backgroundColor: profile.experience2_current ? '#4264fa' : '#fff',
                        borderColor: profile.experience2_current ? '#4264fa' : '#ced3e9'
                      }}
                    />
                    <span className="text-[#47579e] text-sm sm:text-base font-medium">Currently working here</span>
                  </label>
                </div>

                {/* Experience 3 */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Experience 3 Title</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={profile.experience3_title}
                      onChange={(e) => handleInputChange('experience3_title', e.target.value)}
                      placeholder="Enter position title"
                    />
                  </label>
                </div>

                {/* Experience 3 - Company */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Company/Organization</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={profile.experience3_company}
                      onChange={(e) => handleInputChange('experience3_company', e.target.value)}
                      placeholder="e.g., ABC Corp, XYZ University"
                    />
                  </label>
                </div>

                {/* Experience 3 - Location */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Location</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={profile.experience3_location}
                      onChange={(e) => handleInputChange('experience3_location', e.target.value)}
                      placeholder="e.g., New York, NY"
                    />
                  </label>
                </div>

                {/* Experience 3 - Description */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">About this Role</p>
                    <textarea
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] min-h-24 sm:min-h-28 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
                      value={profile.experience3_description}
                      onChange={(e) => handleInputChange('experience3_description', e.target.value)}
                      placeholder="Describe your responsibilities, achievements, and key projects in this role..."
                    />
                  </label>
                </div>

                {/* Experience 3 - Dates */}
                <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 px-3 sm:px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">Start Date</p>
                    <CustomDatePicker
                      selected={profile.experience3_start_date}
                      onChange={(date) => handleInputChange('experience3_start_date', date)}
                      placeholderText="Start Date"
                      maxDate={profile.experience3_end_date || new Date()}
                    />
                  </label>
                  {!profile.experience3_current && (
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">End Date</p>
                      <CustomDatePicker
                        selected={profile.experience3_end_date}
                        onChange={(date) => handleInputChange('experience3_end_date', date)}
                        placeholderText="End Date"
                        minDate={profile.experience3_start_date}
                        maxDate={new Date()}
                      />
                    </label>
                  )}
                </div>
                <div className="max-w-[480px] px-3 sm:px-4 pb-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={profile.experience3_current || false}
                      onChange={(e) => {
                        handleInputChange('experience3_current', e.target.checked);
                        if (e.target.checked) {
                          handleInputChange('experience3_end_date', null);
                        }
                      }}
                      className="w-4 h-4 bg-white border-2 border-[#ced3e9] rounded appearance-none checked:bg-[#4264fa] checked:border-[#4264fa] transition-all duration-200 relative"
                      style={{
                        backgroundColor: profile.experience3_current ? '#4264fa' : '#fff',
                        borderColor: profile.experience3_current ? '#4264fa' : '#ced3e9'
                      }}
                    />
                    <span className="text-[#47579e] text-sm sm:text-base font-medium">Currently working here</span>
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}