import { ValidationError, StorageError } from "./errors";
import { getCurrentUser } from "./auth";
import axiosInstance from "./interceptor";
import { toast } from "react-hot-toast";

export interface Url {
  _id?: string;
  url: string;
  userId: string;
  shortUrl?: string;
}

const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const saveUrl = async (url: Url) => {
  try {
    if (!url.url.trim()) {
      throw new ValidationError("URL is required");
    }

    if (!validateUrl(url.url)) {
      throw new ValidationError(
        "Please enter a valid URL (e.g., https://example.com)"
      );
    }

    const urls = await getUrls();

    // Check for duplicate short codes
    if (urls.some((u: Url) => u.shortUrl === url.shortUrl)) {
      throw new ValidationError(
        "Please try again - this short code is already taken"
      );
    }

    await axiosInstance.post(`/url/create`, url);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new StorageError("Failed to save URL. Please try again.");
  }
};

export const getUrls = async (): Promise<Url[]> => {
  try {
    const currentUser = getCurrentUser();

    if (!currentUser) return [];
    let urls: Url[] = [];

    try {
      const response = await axiosInstance.post(`/url/all`, {
        userId: currentUser?._id,
      });
      urls = response.data.urls || [];
    } catch (error) {
      console.error("Failed to fetch URLs:", error);
    }

    return urls;
  } catch (error) {
    throw new StorageError(
      "Failed to fetch your URLs. Please refresh the page."
    );
  }
};

export const deleteUrl = async (id: string) => {
  try {
    if (!id) {
      throw new ValidationError("URL ID is required");
    }

    await axiosInstance.delete(`/url/${id}`);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new StorageError("Failed to delete URL. Please try again.");
  }
};

export const findUrlByShortCode = (shortCode: string): Url | null => {
  try {
    if (!shortCode) {
      throw new ValidationError("Short code is required");
    }

    const urls = JSON.parse(localStorage.getItem("urls") || "[]");
    return urls.find((url: Url) => url.shortCode === shortCode) || null;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new StorageError("Failed to find URL. Please check the short code.");
  }
};

export const incrementVisits = (shortCode: string) => {
  try {
    if (!shortCode) {
      throw new ValidationError("Short code is required");
    }

    const urls = JSON.parse(localStorage.getItem("urls") || "[]");
    const urlExists = urls.some((url: Url) => url.shortCode === shortCode);

    if (!urlExists) {
      throw new ValidationError("URL not found");
    }

    const updatedUrls = urls.map((url: Url) =>
      url.shortCode === shortCode ? { ...url, visits: url.visits + 1 } : url
    );
    localStorage.setItem("urls", JSON.stringify(updatedUrls));
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new StorageError("Failed to update visit count.");
  }
};
