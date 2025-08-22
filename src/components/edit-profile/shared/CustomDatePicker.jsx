import React from 'react';
import DatePicker from 'react-datepicker';

export default function CustomDatePicker({ 
  selected, 
  onChange, 
  placeholderText, 
  disabled = false,
  maxDate = null,
  minDate = null
}) {
  return (
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
}