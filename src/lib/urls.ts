import { ValidationError, StorageError } from './errors';
import { getCurrentUser } from './auth';

export interface Url {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  visits: number;
  userId: string;
}

const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const saveUrl = (url: Url) => {
  try {
    if (!url.originalUrl.trim()) {
      throw new ValidationError('URL is required');
    }

    if (!validateUrl(url.originalUrl)) {
      throw new ValidationError('Please enter a valid URL (e.g., https://example.com)');
    }

    const urls = JSON.parse(localStorage.getItem('urls') || '[]');
    
    // Check for duplicate short codes
    if (urls.some((u: Url) => u.shortCode === url.shortCode)) {
      throw new ValidationError('Please try again - this short code is already taken');
    }

    urls.unshift(url);
    localStorage.setItem('urls', JSON.stringify(urls));
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new StorageError('Failed to save URL. Please try again.');
  }
};

export const getUrls = (): Url[] => {
  try {
    const urls = JSON.parse(localStorage.getItem('urls') || '[]');
    const currentUser = getCurrentUser();
    
    if (!currentUser) return [];
    
    return currentUser.role === 'admin' 
      ? urls 
      : urls.filter((url: Url) => url.userId === currentUser.id);
  } catch (error) {
    throw new StorageError('Failed to fetch your URLs. Please refresh the page.');
  }
};

export const deleteUrl = (id: string) => {
  try {
    if (!id) {
      throw new ValidationError('URL ID is required');
    }

    const urls = JSON.parse(localStorage.getItem('urls') || '[]');
    const urlToDelete = urls.find((url: Url) => url.id === id);

    if (!urlToDelete) {
      throw new ValidationError('URL not found');
    }

    const filteredUrls = urls.filter((url: Url) => url.id !== id);
    localStorage.setItem('urls', JSON.stringify(filteredUrls));
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new StorageError('Failed to delete URL. Please try again.');
  }
};

export const findUrlByShortCode = (shortCode: string): Url | null => {
  try {
    if (!shortCode) {
      throw new ValidationError('Short code is required');
    }

    const urls = JSON.parse(localStorage.getItem('urls') || '[]');
    return urls.find((url: Url) => url.shortCode === shortCode) || null;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new StorageError('Failed to find URL. Please check the short code.');
  }
};

export const incrementVisits = (shortCode: string) => {
  try {
    if (!shortCode) {
      throw new ValidationError('Short code is required');
    }

    const urls = JSON.parse(localStorage.getItem('urls') || '[]');
    const urlExists = urls.some((url: Url) => url.shortCode === shortCode);

    if (!urlExists) {
      throw new ValidationError('URL not found');
    }

    const updatedUrls = urls.map((url: Url) => 
      url.shortCode === shortCode 
        ? { ...url, visits: url.visits + 1 }
        : url
    );
    localStorage.setItem('urls', JSON.stringify(updatedUrls));
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new StorageError('Failed to update visit count.');
  }
};