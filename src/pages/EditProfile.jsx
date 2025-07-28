import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

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
  const [error, setError] = useState(null);

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
          setSkillsInput(data.skills.join(', '));
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

  const handleFileUpload = async (file, bucketName, field) => {
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      handleInputChange(field, urlData.publicUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    
    try {
      const skillsArray = skillsInput.split(',').map(skill => skill.trim()).filter(Boolean);
      
      const profileData = {
        ...profile,
        skills: skillsArray,
        id: user.id,
        email: user.email,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id'
        });

      if (error) throw error;

      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(`Failed to save profile: ${error.message}`);
    }
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
                />
                <label
                  htmlFor="profile-photo"
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e6e9f4] text-[#0d0f1c] text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Add Image</span>
                </label>
              </div>
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
                      onChange={(e) => handleFileUpload(e.target.files[0], 'project-folders', 'project1_folder_url')}
                      className="hidden"
                      id="project1-folder"
                    />
                    <label
                      htmlFor="project1-folder"
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e6e9f4] text-[#0d0f1c] text-sm font-bold leading-normal tracking-[0.015em]"
                    >
                      <span className="truncate">Add Folder</span>
                    </label>
                  </div>
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
                    />
                    <label
                      htmlFor="project1-thumbnail"
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e6e9f4] text-[#0d0f1c] text-sm font-bold leading-normal tracking-[0.015em]"
                    >
                      <span className="truncate">Add Image</span>
                    </label>
                  </div>
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
                      onChange={(e) => handleFileUpload(e.target.files[0], 'project-folders', 'project2_folder_url')}
                      className="hidden"
                      id="project2-folder"
                    />
                    <label
                      htmlFor="project2-folder"
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e6e9f4] text-[#0d0f1c] text-sm font-bold leading-normal tracking-[0.015em]"
                    >
                      <span className="truncate">Add Folder</span>
                    </label>
                  </div>
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
                    />
                    <label
                      htmlFor="project2-thumbnail"
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e6e9f4] text-[#0d0f1c] text-sm font-bold leading-normal tracking-[0.015em]"
                    >
                      <span className="truncate">Add Image</span>
                    </label>
                  </div>
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
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0d0f1c] text-base font-medium leading-normal pb-2">Select Skills</p>
                    <textarea
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#ced3e9] min-h-36 placeholder:text-[#47579e] p-[15px] text-base font-normal leading-normal"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      placeholder="e.g., e-learning, Articulate Storyline, Instructional Design, Learning Management System"
                    />
                  </label>
                </div>

                {/* Skills Display */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="flex gap-3 p-3 flex-wrap pr-4">
                    {profile.skills.map((skill, index) => (
                      <div key={index} className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#e6e9f4] pl-4 pr-4">
                        <p className="text-[#0d0f1c] text-sm font-medium leading-normal">{skill}</p>
                      </div>
                    ))}
                  </div>
                )}
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