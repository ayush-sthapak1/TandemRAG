import React from 'react';

interface Props {
  message: string;
}

export default function ErrorAlert({ message }: Props) {
  return (
    <div className="bg-red-600/20 border border-red-600 text-red-200 p-4 rounded">
      <p className="font-medium">Error: {message}</p>
    </div>
  );
}
