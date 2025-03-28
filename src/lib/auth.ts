import { AuthError } from "./errors";
import axiosInstance from "./interceptor";

interface User {
  _id: string;
  email: string;
  role: "user" | "admin";
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const login = async (
  email: string,
  password: string
): Promise<User | null> => {
  try {
    if (!email.trim()) {
      throw new AuthError("Email is required");
    }

    if (!password.trim()) {
      throw new AuthError("Password is required");
    }

    if (!validateEmail(email)) {
      throw new AuthError("Please enter a valid email address");
    }

    if (!validatePassword(password)) {
      throw new AuthError("Password must be at least 6 characters long");
    }

    const response = await axiosInstance.post(`/users/login`, {
      email,
      password,
    });
    const user = response.data.user;

    if (!user) {
      throw new AuthError("Invalid email or password");
    }

    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));
    localStorage.setItem("token", response.data.token);
    return userWithoutPassword;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError(
      "An unexpected error occurred during login. Please try again."
    );
  }
};

export const register = async (
  email: string,
  password: string
): Promise<User | null> => {
  try {
    if (!email.trim()) {
      throw new AuthError("Email is required");
    }

    if (!password.trim()) {
      throw new AuthError("Password is required");
    }

    if (!validateEmail(email)) {
      throw new AuthError("Please enter a valid email address");
    }

    if (!validatePassword(password)) {
      throw new AuthError("Password must be at least 6 characters long");
    }

    const response = await axiosInstance.post(`/users/getUser`, {
      email,
    });
    const users = response.data.user;

    if (users.some((u: User) => u.email === email)) {
      throw new AuthError("An account with this email already exists");
    }

    // Set role to 'user' by default, only first user gets admin role
    const newUser = {
      email,
      password,
    };

    const res = await axiosInstance.post(`/users/register`, newUser);
    if (res.status === 201) {
      localStorage.setItem("token", res.data.token);
    }

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Don't return user data after registration
    return null;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError(
      "An unexpected error occurred during registration. Please try again."
    );
  }
};

export const logout = () => {
  try {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
  } catch (error) {
    throw new AuthError("Failed to log out. Please try again.");
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    throw new AuthError("Failed to get user information. Please log in again.");
  }
};
