import { useState } from 'react';

const AUTHOR_KEY = 'chat_author';

type UseAuthorReturn = {
  author: string | null;
  setAuthor: (name: string) => void;
  clearAuthor: () => void;
};

/**
 * Persists the current user's display name in localStorage.
 * Reads synchronously on init to avoid a flash of the name prompt
 * on page reload when a name is already stored.
 */
export function useAuthor(): UseAuthorReturn {
  const [author, setAuthorState] = useState<string | null>(() => {
    // useState initializer runs once on mount — safe to read localStorage here
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTHOR_KEY);
  });

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