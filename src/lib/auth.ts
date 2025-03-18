import { AuthError } from './errors';

interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const login = (email: string, password: string): User | null => {
  try {
    if (!email.trim()) {
      throw new AuthError('Email is required');
    }

    if (!password.trim()) {
      throw new AuthError('Password is required');
    }

    if (!validateEmail(email)) {
      throw new AuthError('Please enter a valid email address');
    }

    if (!validatePassword(password)) {
      throw new AuthError('Password must be at least 6 characters long');
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: User & { password: string }) => 
      u.email === email && u.password === password
    );
    
    if (!user) {
      throw new AuthError('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('An unexpected error occurred during login. Please try again.');
  }
};

export const register = (email: string, password: string): User | null => {
  try {
    if (!email.trim()) {
      throw new AuthError('Email is required');
    }

    if (!password.trim()) {
      throw new AuthError('Password is required');
    }

    if (!validateEmail(email)) {
      throw new AuthError('Please enter a valid email address');
    }

    if (!validatePassword(password)) {
      throw new AuthError('Password must be at least 6 characters long');
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.some((u: User) => u.email === email)) {
      throw new AuthError('An account with this email already exists');
    }

    // Set role to 'user' by default, only first user gets admin role
    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      role: users.length === 0 ? 'admin' : 'user'
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Don't return user data after registration
    return null;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('An unexpected error occurred during registration. Please try again.');
  }
};

export const logout = () => {
  try {
    localStorage.removeItem('currentUser');
  } catch (error) {
    throw new AuthError('Failed to log out. Please try again.');
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    throw new AuthError('Failed to get user information. Please log in again.');
  }
};