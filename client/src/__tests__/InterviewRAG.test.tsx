import { render, screen, fireEvent } from '@testing-library/react';
import InterviewRAG from '../pages/InterviewRAG';
import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      success: true,
      questions: [
        {
          question: 'What is a linked list?',
          topic: 'Data Structures',
          difficulty: 'easy',
          type: 'technical',
          expectedAnswer: ['It is a collection of nodes', 'Each node points to next'],
          followUps: ['Explain singly vs doubly', 'How to reverse it'],
          citations: [{ sourceFile: 'linkedlist.md', heading: 'Linked List Overview' }],
        },
      ],
      meta: {}
    }),
  })
) as jest.Mock;

describe('InterviewRAG integration', () => {
  test('generates questions on button click', async () => {
    render(<InterviewRAG />);
    const resumeInput = screen.getByLabelText(/Resume/i) as HTMLTextAreaElement;
    const jdInput = screen.getByLabelText(/Job Description/i) as HTMLTextAreaElement;
    fireEvent.change(resumeInput, { target: { value: 'sample resume' } });
    fireEvent.change(jdInput, { target: { value: 'sample jd' } });
    const generateBtn = screen.getByRole('button', { name: /Generate/i });
    fireEvent.click(generateBtn);
    // wait for question to appear
    const question = await screen.findByText(/What is a linked list\?/i);
    expect(question).toBeInTheDocument();
  });
});
