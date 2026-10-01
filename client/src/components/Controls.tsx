import React from 'react';

interface Props {
  number: number;
  setNumber: (n: number) => void;
  difficulty: 'easy' | 'medium' | 'hard' | 'any';
  setDifficulty: (d: typeof difficulty) => void;
  topic: string;
  setTopic: (t: string) => void;
  disabled: boolean;
  onGenerate: () => void;
  onReset: () => void;
}

export default function Controls({
  number,
  setNumber,
  difficulty,
  setDifficulty,
  topic,
  setTopic,
  disabled,
  onGenerate,
  onReset,
}: Props) {
  return (
    <div className="glass p-4 flex flex-col space-y-3">
      <div className="flex items-center space-x-2">
        <label className="w-32">Number of Questions</label>
        <input
          type="range"
          min={1}
          max={10}
          value={number}
          disabled={disabled}
          onChange={(e) => setNumber(Number(e.target.value))}
          className="flex-1"
        />
        <span>{number}</span>
      </div>
      <div className="flex items-center space-x-2">
        <label className="w-32">Difficulty</label>
        <select
          value={difficulty}
          disabled={disabled}
          onChange={(e) => setDifficulty(e.target.value as any)}
          className="flex-1"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="any">Any</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <label className="w-32">Topic filter (optional)</label>
        <input
          type="text"
          placeholder="e.g. Data Structures"
          value={topic}
          disabled={disabled}
          onChange={(e) => setTopic(e.target.value)}
          className="flex-1 p-1 rounded bg-white/5"
        />
      </div>
      <div className="flex space-x-2">
        <button
          className="flex-1 py-2 bg-primary text-white rounded disabled:opacity-50"
          onClick={onGenerate}
          disabled={disabled}
        >
          Generate
        </button>
        <button
          className="flex-1 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
          onClick={onReset}
          disabled={disabled}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
