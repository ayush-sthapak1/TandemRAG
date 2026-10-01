import React from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function JDInput({ value, onChange }: Props) {
  return (
    <div className="glass p-4">
      <label className="block text-sm font-medium mb-1" htmlFor="jobDesc">
        Job Description (plain text)
      </label>
      <textarea
        id="jobDesc"
        className="w-full h-32 p-2 rounded bg-white/5 text-gray-100 focus:outline-none"
        placeholder="Paste the job description here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
