import { useState, useCallback } from 'react';
import { GenerateRequest, GenerateResponse } from '../types/api';

interface HookReturn {
  data?: GenerateResponse;
  loading: boolean;
  error?: string;
  generate: (payload: GenerateRequest) => Promise<void>;
  reset: () => void;
}

export default function useGenerateQuestions(): HookReturn {
  const [data, setData] = useState<GenerateResponse | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const generate = useCallback(async (payload: GenerateRequest) => {
    setLoading(true);
    setError(undefined);
    try {
      const resp = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || 'Failed to generate questions');
      }
      const json: GenerateResponse = await resp.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(undefined);
    setError(undefined);
    setLoading(false);
  }, []);

  return { data, loading, error, generate, reset };
}
