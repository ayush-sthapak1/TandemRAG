import React from 'react';
import { GeneratedQuestion } from '../types/api';

interface Props {
  question: GeneratedQuestion;
}

export default function QuestionCard({ question }: Props) {
  return (
    <div className="glass p-4 space-y-2">
      <h3 className="font-medium text-lg">{question.question}</h3>
      <p className="text-sm text-gray-300">Topic: {question.topic} | Difficulty: {question.difficulty}</p>
      <div>
        <strong className="block mb-1">Expected Answer Points:</strong>
        <ul className="list-disc list-inside space-y-1">
          {question.expectedAnswer.map((point, idx) => (
            <li key={idx}>{point}</li>
          ))}
        </ul>
      </div>
      <div>
        <strong className="block mb-1">Follow‑up Questions:</strong>
        <ol className="list-decimal list-inside space-y-1">
          {question.followUps.map((f, idx) => (
            <li key={idx}>{f}</li>
          ))}
        </ol>
      </div>
      <div>
        <strong className="block mb-1">Citations:</strong>
        <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
          {question.citations.map((c, idx) => (
            <li key={idx}>{c.sourceFile} – {c.heading}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
