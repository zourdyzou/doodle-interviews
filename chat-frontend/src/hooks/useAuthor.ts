import { useEffect, useState } from 'react';

const AUTHOR_KEY = 'chat_author';

type UseAuthorReturn = {
  author: string | null;
  setAuthor: (name: string) => void;
  clearAuthor: () => void;
};

/**
 * Persists the current user's display name in localStorage.
 * `author` is null until the user sets a name — the UI should
 * gate the chat input behind a name prompt in that case.
 */
export function useAuthor(): UseAuthorReturn {
  const [author, setAuthorState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTHOR_KEY);
    if (stored) setAuthorState(stored);
  }, []);

  const setAuthor = (name: string) => {
    localStorage.setItem(AUTHOR_KEY, name);
    setAuthorState(name);
  };

  const clearAuthor = () => {
    localStorage.removeItem(AUTHOR_KEY);
    setAuthorState(null);
  };

  return { author, setAuthor, clearAuthor };
}