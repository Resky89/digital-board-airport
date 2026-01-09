'use client';

import { useEffect, useState } from 'react';
import { adminFlightsApi, adminAirlinesApi, adminAirportsApi, adminUsersApi } from '@/app/lib/api';

interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Try different approaches to get the data
        const [flights, airlines, airports, users] = await Promise.all([
          adminFlightsApi.list(),
          adminAirlinesApi.list(),
          adminAirportsApi.list(),
          adminUsersApi.list(),
        ]);

        const getCorrectTotal = (response: any) => {
          // Check for different possible response structures
          const paginationTotal = response?.data?.pagination?.total;
          if (typeof paginationTotal === 'number') return paginationTotal;
          if (typeof response?.total === 'number') return response.total;
          if (typeof response?.meta?.total === 'number') return response.meta.total;
          if (typeof response?.data?.pagination?.total === 'number') return response.data.pagination.total;
          if (typeof response?.data?.total === 'number') return response.data.total;
          if (Array.isArray(response?.data?.items)) return response.data.items.length;
          if (Array.isArray(response?.data)) return response.data.length;
          if (Array.isArray(response)) return response.length;
          return 0;
        };

        const flightCount = getCorrectTotal(flights);
        const airlineCount = getCorrectTotal(airlines);
        const airportCount = getCorrectTotal(airports);
        const userCount = getCorrectTotal(users);

        setStats([
          {
            title: 'Total Flights',
            value: flightCount,
            icon: 'M5 12h14M12 5l7 7-7 7',
            color: 'text-primary',
            bgColor: 'bg-primary/20',
          },
          {
            title: 'Airlines',
            value: airlineCount,
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5',
            color: 'text-accent',
            bgColor: 'bg-accent/20',
          },
          {
            title: 'Airports',
            value: airportCount,
            icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
            color: 'text-success',
            bgColor: 'bg-success/20',
          },
          {
            title: 'Users',
            value: userCount,
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197',
            color: 'text-warning',
            bgColor: 'bg-warning/20',
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/60">Selamat datang di Admin Panel Digital Board Airport</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-white/10 mb-4"></div>
              <div className="h-8 w-20 bg-white/10 rounded mb-2"></div>
              <div className="h-4 w-24 bg-white/10 rounded"></div>
            </div>
          ))
        ) : (
          stats.map((stat, index) => (
            <div
              key={stat.title}
              className="glass-card p-6 animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4`}>
                <svg className={`w-6 h-6 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/60">{stat.title}</div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/admin/flights" className="btn-secondary text-center">
            Manage Flights
          </a>
          <a href="/admin/airlines" className="btn-secondary text-center">
            Manage Airlines
          </a>
          <a href="/admin/airports" className="btn-secondary text-center">
            Manage Airports
          </a>
          <a href="/" target="_blank" className="btn-primary text-center">
            View Flight Board
          </a>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            System Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-white/60">API Status</span>
              <span className="text-success flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                Online
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-white/60">Last Updated</span>
              <span className="text-white">{new Date().toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-white/60">Version</span>
              <span className="text-white">1.0.0</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Management Guide
          </h3>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Gunakan menu <strong className="text-white">Flights</strong> untuk mengelola jadwal penerbangan</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Tambahkan data <strong className="text-white">Airlines</strong> dan <strong className="text-white">Airports</strong> terlebih dahulu</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Kelola <strong className="text-white">Terminals</strong> dan <strong className="text-white">Gates</strong> untuk lokasi boarding</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Update <strong className="text-white">Flight Statuses</strong> untuk status penerbangan real-time</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
