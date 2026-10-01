import React from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function ResumeInput({ value, onChange }: Props) {
  return (
    <div className="glass p-4">
      <label className="block text-sm font-medium mb-1" htmlFor="resume">
        Resume (plain text)
      </label>
      <textarea
        id="resume"
        className="w-full h-32 p-2 rounded bg-white/5 text-gray-100 focus:outline-none"
        placeholder="Paste your resume text here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
