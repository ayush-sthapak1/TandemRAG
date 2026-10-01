import React, { useState } from 'react';
import ResumeInput from '../components/ResumeInput';
import JDInput from '../components/JDInput';
import Controls from '../components/Controls';
import QuestionCard from '../components/QuestionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';
import useGenerateQuestions from '../hooks/useGenerateQuestions';
import { GeneratedQuestion } from '../types/api';

export default function InterviewRAG() {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium' as const);
  const [topicFilter, setTopicFilter] = useState('');

  const {
    data,
    loading,
    error,
    generate,
    reset,
  } = useGenerateQuestions();

  const handleGenerate = async () => {
    await generate({
      resume,
      jobDescription,
      numberOfQuestions,
      difficulty,
      topicFilter: topicFilter || undefined,
    });
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ResumeInput value={resume} onChange={setResume} />
      <JDInput value={jobDescription} onChange={setJobDescription} />
      <Controls
        number={numberOfQuestions}
        setNumber={setNumberOfQuestions}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        topic={topicFilter}
        setTopic={setTopicFilter}
        disabled={loading}
        onGenerate={handleGenerate}
        onReset={handleReset}
      />
      {loading && <LoadingSpinner />}
      {error && <ErrorAlert message={error} />}
      {data && data.questions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {data.questions.map((q: GeneratedQuestion, idx: number) => (
            <QuestionCard key={idx} question={q} />
          ))}
        </div>
      ) : (
        !loading && !error && <EmptyState />
      )}
    </div>
  );
}
