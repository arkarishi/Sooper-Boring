import React from 'react';

export default function UnsavedChangesIndicator({ hasUnsavedChanges }) {
  if (!hasUnsavedChanges) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center gap-2">
      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <span className="text-yellow-800 text-sm">You have unsaved changes. They will be auto-saved in 30 seconds.</span>
    </div>
  );
}