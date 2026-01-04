'use client';

import { useState, useEffect, useCallback } from 'react';
import { publicApi } from '@/app/lib/api';
import { Flight } from '@/app/types';
import Clock from '@/app/components/Clock';
import FlightRow from '@/app/components/FlightRow';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function FlightBoard() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'departure' | 'arrival'>('all');
  const [error, setError] = useState<string | null>(null);

  const fetchFlights = useCallback(async () => {
    try {
      const params: Record<string, string> = {
        sort: 'scheduled_time',
        order: 'asc',
        per_page: '50',
      };
      
      if (activeTab !== 'all') {
        params.type = activeTab;
      }

      const response = await publicApi.getFlights(params);
      if (response.success) {
        setFlights(response.data || []);
      } else {
        setError('Gagal memuat data penerbangan');
      }
    } catch {
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 30000);
    return () => clearInterval(interval);
  }, [fetchFlights]);

  const filteredFlights = flights.filter(flight => {
    if (activeTab === 'all') return true;
    return flight.flight_type === activeTab;
  });

  return (
    <div className="min-h-screen gradient-bg">
      <div className="relative z-10">
        {/* Header */}
        <header className="glass-card mx-6 mt-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center animate-glow">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Flight Information Display</h1>
                <p className="text-white/60">Real-time Flight Status Updates</p>
              </div>
            </div>
            <Clock />
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="mx-6 mt-4">
          <div className="glass-card inline-flex rounded-xl p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`tab-btn rounded-lg ${activeTab === 'all' ? 'active bg-primary/20' : ''}`}
            >
              All Flights
            </button>
            <button
              onClick={() => setActiveTab('departure')}
              className={`tab-btn rounded-lg flex items-center gap-2 ${activeTab === 'departure' ? 'active bg-primary/20' : ''}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              Departures
            </button>
            <button
              onClick={() => setActiveTab('arrival')}
              className={`tab-btn rounded-lg flex items-center gap-2 ${activeTab === 'arrival' ? 'active bg-primary/20' : ''}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49s5.43-1.45 14.49-3.88c.79-.22 1.27-1.05 1.15-1.4z" />
              </svg>
              Arrivals
            </button>
          </div>
        </div>

        {/* Flight Table Header */}
        <div className="mx-6 mt-6">
          <div className="glass-card p-4">
            <div className="grid grid-cols-12 items-center gap-4 text-xs font-semibold uppercase tracking-wider text-primary">
              <div className="col-span-2">Flight</div>
              <div className="col-span-2">Origin</div>
              <div className="col-span-1"></div>
              <div className="col-span-2">Destination</div>
              <div className="col-span-2">Time</div>
              <div className="col-span-1">Terminal</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
          </div>
        </div>

        {/* Flight List */}
        <div className="mx-6 mt-4 pb-8">
          {loading ? (
            <div className="glass-card p-12">
              <LoadingSpinner size="lg" />
              <p className="text-center text-white/60 mt-4">Memuat data penerbangan...</p>
            </div>
          ) : error ? (
            <div className="glass-card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-danger/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-white/80 text-lg">{error}</p>
              <button onClick={fetchFlights} className="btn-primary mt-4">
                Coba Lagi
              </button>
            </div>
          ) : filteredFlights.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-white/80 text-lg">Tidak ada penerbangan saat ini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFlights.map((flight, index) => (
                <FlightRow key={flight.id} flight={flight} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="p-6 text-center text-white/40 text-sm">
          <p>Data diperbarui setiap 30 detik • Last update: {new Date().toLocaleTimeString('id-ID')}</p>
        </footer>
      </div>
    </div>
  );
}
