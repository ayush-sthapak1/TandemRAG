import React from 'react';
import InterviewRAG from './pages/InterviewRAG';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <header className="p-4 shadow-md bg-gray-800">
        <h1 className="text-2xl font-semibold text-center">TandemRAG – Interview Preparation</h1>
      </header>
      <main className="flex-grow p-4">
        <InterviewRAG />
      </main>
      <footer className="p-2 text-center text-xs text-gray-500 bg-gray-800">
        © 2026 TandemRAG – Built for CS students
      </footer>
    </div>
  );
}
