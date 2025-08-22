import React from 'react';
import CustomDatePicker from '../shared/CustomDatePicker';

export default function ExperienceForm({ 
  experience, 
  experienceIndex, 
  totalExperiences, 
  onUpdateExperience, 
  onRemoveExperience 
}) {
  const handleFieldChange = (field, value) => {
    onUpdateExperience(experience.id, field, value);
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  return (
    <div className="border border-[#ced3e9] rounded-xl p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[#0d0f1c] text-base font-bold">
          Experience {experienceIndex + 1}
        </h3>
        {totalExperiences > 1 && (
          <button
            onClick={() => onRemoveExperience(experience.id)}
            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-full hover:bg-red-50"
            title="Remove this experience"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Job Title */}
      <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">
            Job Title
          </p>
          <input
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#4264fa] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
            value={experience.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="e.g., Senior Instructional Designer"
          />
        </label>
      </div>

      {/* Company */}
      <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">
            Company
          </p>
          <input
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#4264fa] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
            value={experience.company || ''}
            onChange={(e) => handleFieldChange('company', e.target.value)}
            placeholder="e.g., Tech Solutions Inc."
          />
        </label>
      </div>

      {/* Location */}
      <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">
            Location
          </p>
          <input
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#4264fa] h-12 sm:h-14 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
            value={experience.location || ''}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            placeholder="e.g., San Francisco, CA"
          />
        </label>
      </div>

      {/* Current Job Checkbox */}
      <div className="flex items-center gap-3 py-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={experience.current || false}
            onChange={(e) => {
              handleFieldChange('current', e.target.checked);
              if (e.target.checked) {
                handleFieldChange('end_date', null);
              }
            }}
            className="form-checkbox h-4 w-4 text-[#4264fa] focus:ring-[#4264fa] border-[#ced3e9] rounded"
          />
          <span className="text-[#0d0f1c] text-sm font-medium">
            I currently work here
          </span>
        </label>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-3">
        <label className="flex flex-col">
          <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">
            Start Date
          </p>
          <CustomDatePicker
            selected={parseDate(experience.start_date)}
            onChange={(date) => handleFieldChange('start_date', date)}
            placeholderText="Select start date"
            maxDate={experience.current ? new Date() : parseDate(experience.end_date) || new Date()}
          />
        </label>

        <label className="flex flex-col">
          <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">
            End Date
          </p>
          <CustomDatePicker
            selected={parseDate(experience.end_date)}
            onChange={(date) => handleFieldChange('end_date', date)}
            placeholderText={experience.current ? "Present" : "Select end date"}
            disabled={experience.current}
            minDate={parseDate(experience.start_date)}
            maxDate={new Date()}
          />
        </label>
      </div>

      {/* Description */}
      <div className="flex max-w-full flex-wrap items-end gap-3 sm:gap-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0d0f1c] text-sm sm:text-base font-medium leading-normal pb-2">
            Description
          </p>
          <textarea
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border border-[#ced3e9] bg-[#f8f9fc] focus:border-[#4264fa] min-h-32 sm:min-h-36 placeholder:text-[#47579e] p-3 sm:p-[15px] text-sm sm:text-base font-normal leading-normal"
            value={experience.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Describe your responsibilities and achievements..."
          />
        </label>
      </div>
    </div>
  );
}