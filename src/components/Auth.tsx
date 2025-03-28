import React, { useState } from "react";
import { login, register } from "../lib/auth";
import { toast } from "react-hot-toast";
import { AuthError } from "../lib/errors";
import { Loader2 } from "lucide-react";

interface AuthProps {
  onSuccess: () => void;
}

export function Auth({ onSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isLogin && password !== confirmPassword) {
        throw new AuthError("Passwords do not match");
      }

      if (!isLogin) {
        register(email, password);
        toast.success(
          "Account created successfully! Please log in to continue.",
          {
            duration: 5000,
          }
        );
        setIsLogin(true);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        const result = await login(email, password);
        if (result) {
          toast.success(`Welcome back, ${result.email}!`, { duration: 5000 });
          onSuccess();
        }
      }
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-8 bg-white rounded-xl sm:rounded-2xl shadow-lg">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">
        {isLogin ? "Welcome Back" : "Create Account"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
            placeholder="you@example.com"
            disabled={loading}
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
            placeholder="••••••••"
            disabled={loading}
            required
          />
        </div>
        {!isLogin && (
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-xl px-4 py-3 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{isLogin ? "Signing In..." : "Creating Account..."}</span>
            </>
          ) : (
            <span>{isLogin ? "Sign In" : "Create Account"}</span>
          )}
        </button>
      </form>
      <button
        onClick={() => {
          setIsLogin(!isLogin);
          setEmail("");
          setPassword("");
          setConfirmPassword("");
        }}
        disabled={loading}
        className="mt-4 sm:mt-6 w-full text-center text-sm text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLogin
          ? "Don't have an account? Sign up"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
