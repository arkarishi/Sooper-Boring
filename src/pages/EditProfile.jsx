import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import skillsData from '../data/skills.json';

export default function EditProfile({ session }) {
  const [user, setUser] = useState(session?.user || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    bio: '',
    about_me: '',
    profile_photo_url: '',
    
    // Project 1
    project1_title: '',
    project1_description: '',
    project1_type: '',
    project1_folder_url: '',
    project1_thumbnail_url: '',
    
    // Project 2
    project2_title: '',
    project2_description: '',
    project2_type: '',
    project2_folder_url: '',
    project2_thumbnail_url: '',
    
    // Skills
    skills: [],
    
    // Experience
    experience1_title: '',
    experience1_start_date: '',
    experience1_end_date: '',
    experience2_title: '',
    experience2_start_date: '',
    experience2_end_date: '',
    experience3_title: '',
    experience3_start_date: '',
    experience3_end_date: ''
  });
  
  const [activeTab, setActiveTab] = useState('about');
  const [skillsInput, setSkillsInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const skillsInputRef = useRef(null);
  const [error, setError] = useState(null);
  
  // Upload states
  const [uploadStates, setUploadStates] = useState({
    profile_photo: { uploading: false, progress: 0 },
    project1_folder: { uploading: false, progress: 0, files: [] },
    project1_thumbnail: { uploading: false, progress: 0 },
    project2_folder: { uploading: false, progress: 0, files: [] },
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
        setProfile(data);
        if (data.skills && Array.isArray(data.skills)) {
          setSelectedSkills(data.skills);
        }
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
  };

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

  const handleFolderUpload = async (files, bucketName, field) => {
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

  const saveProfile = async () => {
    if (!user) return;
    try {
      const profileData = {
        ...profile,
        skills: selectedSkills,
        id: user.id,
        email: user.email,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) throw error;
      
      alert('Profile saved successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(`Failed to save profile: ${error.message}`);
    }
  };

  const renderUploadProgress = (uploadKey) => {
    const state = uploadStates[uploadKey];
    if (!state.uploading && state.progress === 0) return null;

    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
        {state.uploading && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-800">Uploading... {Math.round(state.progress)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${state.progress}%` }}
              ></div>
            </div>
          </>
        )}
        
        {state.files && state.files.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-blue-800 mb-2">Files ({state.files.length}):</p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {state.files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  {file.status === 'pending' && <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
                  {file.status === 'uploading' && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                  {file.status === 'completed' && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                  <span className={`${file.status === 'completed' ? 'text-green-700' : 'text-gray-600'}`}>
                    {file.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!state.uploading && state.progress === 100 && (
          <div className="flex items-center gap-2 text-green-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">Upload completed!</span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="text-lg text-[#0d0f1c]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="text-lg text-[#0d0f1c]">Please log in to continue...</div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f8f9fc] group/design-root overflow-x-hidden" style={{fontFamily: '"Work Sans", "Noto Sans", sans-serif'}}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Profile Header */}
            <div className="flex p-4">
              <div className="flex w-full flex-col gap-4 items-center">
                <div className="flex gap-4 flex-col items-center">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32"
                    style={{backgroundImage: `url("${profile.profile_photo_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBENKwH5nxkytSSvv9toA494x-gAePUj0MlHpaEoRNu-6u_LkhO7frHlxdTZtB-RDN91ClkxwhxLCKSuc0DGiCASQpdsKUgErw98KJxZHMVWhaHKyUmskZzRk-OShdv-uHb4okA-_yrwS2qshQDp7iJrQusoYRbd87JF-01zdeKwzKDuG-aMbLYrNWjXcqAFxq-ACDXoNhoavNiJVXs8dtDM3AureQYuWelAgCJK7Xr3zlcda9WrJs8pQ_DsJVwNdF79VTIjG2XhbE'}")`}}
                  />
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-[#0d0f1c] text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">
                      {profile.name || 'Your Name'}
                    </p>
                    <p className="text-[#47579e] text-base font-normal leading-normal text-center">
                      {profile.title || 'Your Title'}
                    </p>
                    <p className="text-[#47579e] text-base font-normal leading-normal text-center">
                      {profile.bio || 'Your Bio'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={saveProfile}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e6e9f4] text-[#0d0f1c] text-sm font-bold leading-normal tracking-[0.015em] w-full max-w-[480px]"
                >
                  <span className="truncate">Save Profile</span>
                </button>
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div className="flex flex-col p-4">
              <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#ced3e9] px-6 py-14">
                <div className="flex max-w-[480px] flex-col items-center gap-2">
                  <p className="text-[#0d0f1c] text-lg font-bold leading-tight tracking-[-0.015em] text-center">Upload Profile Photo</p>
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
                  className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] ${
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
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">Name</p>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-14 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your name"
                />
              </label>
            </div>

            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">Title</p>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-14 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
                  value={profile.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Instructional Designer"
                />
              </label>
            </div>

            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">Bio</p>
                <textarea
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] min-h-36 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
                  value={profile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Creating engaging and effective learning experiences"
                />
              </label>
            </div>

            {/* Tab Navigation */}
            <div className="pb-3">
                <div className="flex border-b border-[#ced3e9] px-4 gap-8">
                    <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        setActiveTab('about');
                    }}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-3 transition-colors duration-200 ${
                        activeTab === 'about' 
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
                        setActiveTab('projects');
                    }}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-3 transition-colors duration-200 ${
                        activeTab === 'projects' 
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
                        setActiveTab('skills');
                    }}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-3 transition-colors duration-200 ${
                        activeTab === 'skills' 
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
                        setActiveTab('experience');
                    }}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-3 transition-colors duration-200 ${
                        activeTab === 'experience' 
                        ? 'border-b-[#4264fa] text-[#0d0f1c]' 
                        : 'border-b-transparent text-[#47579e] hover:text-[#0d0f1c]'
                    }`}
                    >
                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Experience</p>
                    </a>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'about' && (
              <>
                <h2 className="text-[#0d0f1c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">About Me</h2>
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">Edit About Me</p>
                    <textarea
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] min-h-36 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
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
                <h2 className="text-[#0d0f1c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Projects</h2>
                
                {/* Project 1 */}
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">Project 1 Title</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-14 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
                      value={profile.project1_title}
                      onChange={(e) => handleInputChange('project1_title', e.target.value)}
                      placeholder="Enter project title"
                    />
                  </label>
                </div>

                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">Project 1 Description</p>
                    <textarea
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] min-h-36 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
                      value={profile.project1_description}
                      onChange={(e) => handleInputChange('project1_description', e.target.value)}
                      placeholder="Describe your project..."
                    />
                  </label>
                </div>

                {/* Project Type Selection */}
                <div className="flex flex-wrap gap-3 p-4">
                  <label className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-4 h-11 relative cursor-pointer ${
                    profile.project1_type === 'Storyboard' ? 'border-[3px] border-[#4264fa] px-3.5' : 'border border-[#ced3e9]'
                  } text-[#0d0f1c]`}>
                    Storyboard
                    <input
                      type="radio"
                      className="invisible absolute"
                      name="project1_type"
                      checked={profile.project1_type === 'Storyboard'}
                      onChange={() => handleInputChange('project1_type', 'Storyboard')}
                    />
                  </label>
                  <label className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-4 h-11 relative cursor-pointer ${
                    profile.project1_type === 'e-Learning' ? 'border-[3px] border-[#4264fa] px-3.5' : 'border border-[#ced3e9]'
                  } text-[#0d0f1c]`}>
                    e-Learning
                    <input
                      type="radio"
                      className="invisible absolute"
                      name="project1_type"
                      checked={profile.project1_type === 'e-Learning'}
                      onChange={() => handleInputChange('project1_type', 'e-Learning')}
                    />
                  </label>
                </div>

                {/* Project 1 Folder Upload */}
                <div className="flex flex-col p-4">
                  <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#ced3e9] px-6 py-14">
                    <div className="flex max-w-[480px] flex-col items-center gap-2">
                      <p className="text-[#0d0f1c] text-lg font-bold leading-tight tracking-[-0.015em] text-center">Upload Project Folder</p>
                      <p className="text-[#0d0f1c] text-sm font-normal leading-normal text-center">Click to select a folder</p>
                    </div>
                    <input
                      type="file"
                      webkitdirectory=""
                      onChange={(e) => handleFolderUpload(e.target.files, 'project-folders', 'project1_folder_url')}
                      className="hidden"
                      id="project1-folder"
                      disabled={uploadStates.project1_folder.uploading}
                    />
                    <label
                      htmlFor="project1-folder"
                      className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] ${
                        uploadStates.project1_folder.uploading 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-[#e6e9f4] text-[#0d0f1c] hover:bg-[#d1d6ed]'
                      }`}
                    >
                      <span className="truncate">
                        {uploadStates.project1_folder.uploading ? 'Uploading...' : 'Add Folder'}
                      </span>
                    </label>
                  </div>
                  {renderUploadProgress('project1_folder')}
                </div>

                {/* Project 1 Thumbnail Upload */}
                <div className="flex flex-col p-4">
                  <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#ced3e9] px-6 py-14">
                    <div className="flex max-w-[480px] flex-col items-center gap-2">
                      <p className="text-[#0d0f1c] text-lg font-bold leading-tight tracking-[-0.015em] text-center">Upload Thumbnail</p>
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
                      className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] ${
                        uploadStates.project1_thumbnail.uploading 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-[#e6e9f4] text-[#0d0f1c] hover:bg-[#d1d6ed]'
                      }`}
                    >
                      <span className="truncate">
                        {uploadStates.project1_thumbnail.uploading ? 'Uploading...' : 'Add Image'}
                      </span>
                    </label>
                  </div>
                  {renderUploadProgress('project1_thumbnail')}
                </div>

                {/* Project 1 Thumbnail Preview */}
                {profile.project1_thumbnail_url && (
                  <div className="flex w-full grow bg-[#f8f9fc] p-4">
                    <div className="w-full gap-1 overflow-hidden bg-[#f8f9fc] aspect-[3/2] rounded-xl flex">
                      <div
                        className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none flex-1"
                        style={{backgroundImage: `url("${profile.project1_thumbnail_url}")`}}
                      />
                    </div>
                  </div>
                )}

                {/* Project 2 - Same structure as Project 1 */}
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">Project 2 Title</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-14 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
                      value={profile.project2_title}
                      onChange={(e) => handleInputChange('project2_title', e.target.value)}
                      placeholder="Enter project title"
                    />
                  </label>
                </div>

                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">Project 2 Description</p>
                    <textarea
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] min-h-36 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
                      value={profile.project2_description}
                      onChange={(e) => handleInputChange('project2_description', e.target.value)}
                      placeholder="Describe your project..."
                    />
                  </label>
                </div>

                {/* Project 2 Type Selection */}
                <div className="flex flex-wrap gap-3 p-4">
                  <label className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-4 h-11 relative cursor-pointer ${
                    profile.project2_type === 'Storyboard' ? 'border-[3px] border-[#4264fa] px-3.5' : 'border border-[#ced3e9]'
                  } text-[#0d0f1c]`}>
                    Storyboard
                    <input
                      type="radio"
                      className="invisible absolute"
                      name="project2_type"
                      checked={profile.project2_type === 'Storyboard'}
                      onChange={() => handleInputChange('project2_type', 'Storyboard')}
                    />
                  </label>
                  <label className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-4 h-11 relative cursor-pointer ${
                    profile.project2_type === 'e-Learning' ? 'border-[3px] border-[#4264fa] px-3.5' : 'border border-[#ced3e9]'
                  } text-[#0d0f1c]`}>
                    e-Learning
                    <input
                      type="radio"
                      className="invisible absolute"
                      name="project2_type"
                      checked={profile.project2_type === 'e-Learning'}
                      onChange={() => handleInputChange('project2_type', 'e-Learning')}
                    />
                  </label>
                </div>

                {/* Project 2 Uploads - Similar to Project 1 */}
                <div className="flex flex-col p-4">
                  <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#ced3e9] px-6 py-14">
                    <div className="flex max-w-[480px] flex-col items-center gap-2">
                      <p className="text-[#0d0f1c] text-lg font-bold leading-tight tracking-[-0.015em] text-center">Upload Project Folder</p>
                      <p className="text-[#0d0f1c] text-sm font-normal leading-normal text-center">Click to select a folder</p>
                    </div>
                    <input
                      type="file"
                      webkitdirectory=""
                      onChange={(e) => handleFolderUpload(e.target.files, 'project-folders', 'project2_folder_url')}
                      className="hidden"
                      id="project2-folder"
                      disabled={uploadStates.project2_folder.uploading}
                    />
                    <label
                      htmlFor="project2-folder"
                      className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] ${
                        uploadStates.project2_folder.uploading 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-[#e6e9f4] text-[#0d0f1c] hover:bg-[#d1d6ed]'
                      }`}
                    >
                      <span className="truncate">
                        {uploadStates.project2_folder.uploading ? 'Uploading...' : 'Add Folder'}
                      </span>
                    </label>
                  </div>
                  {renderUploadProgress('project2_folder')}
                </div>

                <div className="flex flex-col p-4">
                  <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#ced3e9] px-6 py-14">
                    <div className="flex max-w-[480px] flex-col items-center gap-2">
                      <p className="text-[#0d0f1c] text-lg font-bold leading-tight tracking-[-0.015em] text-center">Upload Thumbnail</p>
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
                      className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] ${
                        uploadStates.project2_thumbnail.uploading 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-[#e6e9f4] text-[#0d0f1c] hover:bg-[#d1d6ed]'
                      }`}
                    >
                      <span className="truncate">
                        {uploadStates.project2_thumbnail.uploading ? 'Uploading...' : 'Add Image'}
                      </span>
                    </label>
                  </div>
                  {renderUploadProgress('project2_thumbnail')}
                </div>

                {/* Project 2 Thumbnail Preview */}
                {profile.project2_thumbnail_url && (
                  <div className="flex w-full grow bg-[#f8f9fc] p-4">
                    <div className="w-full gap-1 overflow-hidden bg-[#f8f9fc] aspect-[3/2] rounded-xl flex">
                      <div
                        className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none flex-1"
                        style={{backgroundImage: `url("${profile.project2_thumbnail_url}")`}}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'skills' && (
              <>
                <h2 className="text-[#0d0f1c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Skills</h2>
                
                {/* Skills Input with Dropdown */}
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1 relative" ref={skillsInputRef}>
                    <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">Add Skills</p>
                    <input
                      type="text"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-14 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
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
                            className="px-4 py-3 hover:bg-[#f8f9fc] cursor-pointer text-sm text-[#0d0f1c] border-b border-[#ced3e9] last:border-b-0 flex items-center justify-between"
                            onClick={() => handleSkillSelect(skill)}
                          >
                            <span>{skill}</span>
                            <span className="text-xs text-[#47579e] opacity-60">Click to add</span>
                          </div>
                        ))}
                        {filteredSkills.length > 20 && (
                          <div className="px-4 py-2 text-xs text-[#47579e] italic bg-[#f8f9fc]">
                            {filteredSkills.length - 20} more results... Keep typing to narrow down
                          </div>
                        )}
                        {filteredSkills.length === 0 && skillsInput.trim() && (
                          <div className="px-4 py-3 text-sm text-[#47579e] italic">
                            Press Enter to add "{skillsInput.trim()}" as a custom skill
                          </div>
                        )}
                      </div>
                    )}
                  </label>
                </div>

                {/* Selected Skills Display */}
                {selectedSkills.length > 0 && (
                  <div className="px-4 py-3">
                    <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-3">Selected Skills ({selectedSkills.length})</p>
                    <div className="flex gap-2 flex-wrap max-h-48 overflow-y-auto">
                      {selectedSkills.map((skill, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-center gap-x-2 rounded-full bg-[#e6e9f4] pl-4 pr-2 py-2 group hover:bg-[#d1d6ed] transition-colors"
                        >
                          <p className="text-[#0d0f1c] text-sm font-medium leading-normal">{skill}</p>
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
                <div className="px-4 py-3">
                  <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-3">Popular Skills by Category</p>
                  {Object.entries(skillsData.popularSkills).map(([category, skills]) => (
                    <div key={category} className="mb-4">
                      <h4 className="text-[#47579e] text-sm font-medium mb-2">{category}</h4>
                      <div className="flex gap-2 flex-wrap">
                        {skills.filter(skill => !selectedSkills.includes(skill)).map((skill, index) => (
                          <button
                            key={index}
                            onClick={() => handleSkillSelect(skill)}
                            className="flex items-center justify-center rounded-full border border-[#ced3e9] bg-white hover:bg-[#f8f9fc] hover:border-[#4264fa] px-3 py-1.5 transition-all duration-200"
                          >
                            <span className="text-[#47579e] text-xs font-medium leading-normal">+ {skill}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Browse All Categories */}
                <div className="px-4 py-3">
                  <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-3">Browse All Categories</p>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(skillsData.categories).map(([category, skills]) => (
                      <div key={category} className="p-3 border border-[#ced3e9] rounded-xl hover:bg-[#f8f9fc] cursor-pointer">
                        <h4 className="text-[#0d0f1c] text-sm font-medium mb-1">{category}</h4>
                        <p className="text-[#47579e] text-xs">{skills.length} skills available</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills Help Text */}
                <div className="px-4 py-2">
                  <p className="text-[#47579e] text-sm leading-normal">
                    💡 <strong>Pro tip:</strong> Start typing to search from our database of {predefinedSkills.length}+ skills including programming languages, 
                    frameworks, cloud platforms, databases, and more. You can also add custom skills by pressing Enter.
                  </p>
                </div>
              </>
            )}

            {activeTab === 'experience' && (
              <>
                <h2 className="text-[#0d0f1c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Experience</h2>
                
                {/* Experience 1 */}
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">Experience 1 Title</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-14 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
                      value={profile.experience1_title}
                      onChange={(e) => handleInputChange('experience1_title', e.target.value)}
                      placeholder="e.g., Senior Instructional Designer"
                    />
                  </label>
                </div>

                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">Start Date</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-14 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
                      value={profile.experience1_start_date}
                      onChange={(e) => handleInputChange('experience1_start_date', e.target.value)}
                      placeholder="e.g., January 2020"
                    />
                  </label>
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">End Date</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-14 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
                      value={profile.experience1_end_date}
                      onChange={(e) => handleInputChange('experience1_end_date', e.target.value)}
                      placeholder="e.g., Present"
                    />
                  </label>
                </div>

                {/* Experience 2 */}
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">Experience 2 Title</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-14 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
                      value={profile.experience2_title}
                      onChange={(e) => handleInputChange('experience2_title', e.target.value)}
                      placeholder="Enter position title"
                    />
                  </label>
                </div>

                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">Start Date</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-14 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
                      value={profile.experience2_start_date}
                      onChange={(e) => handleInputChange('experience2_start_date', e.target.value)}
                      placeholder="Enter start date"
                    />
                  </label>
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">End Date</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-14 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
                      value={profile.experience2_end_date}
                      onChange={(e) => handleInputChange('experience2_end_date', e.target.value)}
                      placeholder="Enter end date"
                    />
                  </label>
                </div>

                {/* Experience 3 */}
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">Experience 3 Title</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-14 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
                      value={profile.experience3_title}
                      onChange={(e) => handleInputChange('experience3_title', e.target.value)}
                      placeholder="Enter position title"
                    />
                  </label>
                </div>

                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">Start Date</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-14 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
                      value={profile.experience3_start_date}
                      onChange={(e) => handleInputChange('experience3_start_date', e.target.value)}
                      placeholder="Enter start date"
                    />
                  </label>
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">End Date</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] h-14 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
                      value={profile.experience3_end_date}
                      onChange={(e) => handleInputChange('experience3_end_date', e.target.value)}
                      placeholder="Enter end date"
                    />
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