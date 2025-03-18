import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getUrls, Url } from '../lib/urls';
import { Activity, Users, Link } from 'lucide-react';

export function AdminDashboard() {
  const urls = getUrls();
  
  const totalVisits = urls.reduce((sum, url) => sum + url.visits, 0);
  const totalUrls = urls.length;
  const uniqueUsers = new Set(urls.map(url => url.userId)).size;

  // Get top 10 most visited URLs
  const topUrls = [...urls]
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10)
    .map(url => ({
      shortCode: url.shortCode,
      visits: url.visits,
      originalUrl: url.originalUrl
    }));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Visits</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalVisits}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Link className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total URLs</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalUrls}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{uniqueUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Top 10 Most Visited URLs</h3>
        <div className="h-[300px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topUrls} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shortCode" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-[250px]">
                        <p className="font-medium text-sm text-gray-900 break-all">
                          {data.originalUrl}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Visits: {data.visits}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="visits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* URL List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">All URLs</h3>
        </div>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original URL</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short Code</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {urls.map((url: Url) => (
                  <tr key={url.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-900 max-w-[150px] sm:max-w-xs truncate">
                      {url.originalUrl}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-blue-600 whitespace-nowrap">
                      {url.shortCode}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {url.visits}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(url.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}