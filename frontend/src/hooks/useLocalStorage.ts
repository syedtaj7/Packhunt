import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

export function useStarredPackages() {
  const { user } = useAuth();
  const storageKey = user ? `packhunt-starred-${user.uid}` : 'packhunt-starred-guest';
  const [starred, setStarred] = useLocalStorage<string[]>(storageKey, []);
  
  const toggleStar = useCallback((packageId: string) => {
    if (!user) {
      return false; // Return false to indicate auth required
    }
    setStarred(prev => 
      prev.includes(packageId) 
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
    return true;
  }, [setStarred, user]);
  
  const isStarred = useCallback((packageId: string) => {
    return starred.includes(packageId);
  }, [starred]);
  
  return { starred, toggleStar, isStarred, requiresAuth: !user };
}

export function useSavedSearches() {
  const [searches, setSearches] = useLocalStorage<string[]>('packhunt-searches', []);
  
  const saveSearch = useCallback((query: string) => {
    if (query.trim() && !searches.includes(query)) {
      setSearches(prev => [query, ...prev].slice(0, 10));
    }
  }, [searches, setSearches]);
  
  const removeSearch = useCallback((query: string) => {
    setSearches(prev => prev.filter(s => s !== query));
  }, [setSearches]);
  
  return { searches, saveSearch, removeSearch };
}