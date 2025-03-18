import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import {
  Link2,
  ExternalLink,
  Loader2,
  LogOut,
  Shield,
  Scissors,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { Auth } from "./components/Auth";
import { Redirect } from "./components/Redirect";
import { AdminDashboard } from "./components/AdminDashboard";
import { getCurrentUser, logout } from "./lib/auth";
import { saveUrl, getUrls, deleteUrl, Url } from "./lib/urls";
import { ValidationError, StorageError } from "./lib/errors";

interface DashboardProps {
  onLogout: () => void;
}

function Dashboard({ onLogout }: DashboardProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState<Url[]>([]);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
      return;
    }
    try {
      setUrls(getUrls());
    } catch (error) {
      if (error instanceof StorageError) {
        toast.error(error.message);
      }
    }
  }, [navigate]);

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    try {
      setLoading(true);
      const shortCode = generateShortCode();

      const newUrl: Url = {
        id: crypto.randomUUID(),
        originalUrl: url,
        shortCode,
        createdAt: new Date().toISOString(),
        visits: 0,
        userId: currentUser!.id,
      };

      saveUrl(newUrl);
      setUrls(getUrls());
      setUrl("");
      toast.success("URL shortened successfully!");
    } catch (error) {
      if (error instanceof ValidationError) {
        toast.error(error.message);
      } else if (error instanceof StorageError) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteUrl(id);
      setUrls(getUrls());
      toast.success("URL deleted successfully");
    } catch (error) {
      if (error instanceof StorageError) {
        toast.error(error.message);
      }
    }
  };

  const handleLogout = () => {
    try {
      logout();
      onLogout();
      navigate("/");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const copyToClipboard = async (shortUrl: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("URL copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 sm:mb-12">
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/logo.png"
              alt="Shrtcut"
              className="w-16 h-16 text-blue-600"
            />
            <h1 className="text-2xl font-bold text-gray-900">Shrtcut</h1>
          </div>
          <div className="flex items-center gap-4">
            {currentUser?.role === "admin" && (
              <div className="flex items-center gap-1 text-blue-600">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Admin</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {currentUser?.role === "admin" ? (
          <AdminDashboard />
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mb-8 sm:mb-12">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste your long URL here..."
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base sm:text-lg"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg whitespace-nowrap"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  ) : (
                    "Shorten"
                  )}
                </button>
              </div>
            </form>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
              <div className="p-4 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
                  Your URLs
                </h2>
                {urls.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-base sm:text-lg">
                      No URLs shortened yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {urls.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-4 sm:gap-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-gray-900 break-all sm:truncate mb-2">
                            {item.originalUrl}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  `${window.location.origin}/${item.shortCode}`
                                )
                              }
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                              {window.location.origin}/{item.shortCode}
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <span className="text-gray-500 text-sm">
                              {item.visits}{" "}
                              {item.visits === 1 ? "visit" : "visits"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors sm:ml-4"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!getCurrentUser()
  );

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:shortCode" element={<Redirect />} />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center mb-6 sm:mb-8">
                  <Scissors className="w-16 sm:w-20 h-16 sm:h-20 text-blue-600 mx-auto mb-4 sm:mb-6" />
                  <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Shrtcut
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-600">
                    Make your links shorter and cleaner
                  </p>
                </div>
                <Auth onSuccess={() => setIsAuthenticated(true)} />
              </div>
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
