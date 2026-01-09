'use client';

import { Flight } from '@/app/types';

interface FlightRowProps {
  flight: Flight;
  index: number;
}

export default function FlightRow({ flight, index }: FlightRowProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getStatusClass = (statusName?: string) => {
    const status = statusName?.toLowerCase() || '';
    if (status.includes('on time')) return 'status-on-time';
    if (status.includes('scheduled')) return 'status-scheduled';
    if (status.includes('delay')) return 'status-delayed';
    if (status.includes('cancel')) return 'status-cancelled';
    if (status.includes('boarding')) return 'status-boarding';
    if (status.includes('depart')) return 'status-departed';
    if (status.includes('arriv') || status.includes('landed')) return 'status-arrived';
    return 'status-scheduled';
  };

  return (
    <div 
      className="flight-row animate-slide-in grid grid-cols-13 items-center gap-4"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Flight Code */}
      <div className="col-span-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-white text-lg">{flight.flight_code}</div>
            <div className="text-xs text-white/50">{flight.airline?.airline_name || '-'}</div>
          </div>
        </div>
      </div>

      {/* Origin */}
      <div className="col-span-2">
        <div className="text-2xl font-bold text-white">{flight.origin_airport?.airport_code || '-'}</div>
        <div className="text-sm text-white/60 truncate">{flight.origin_airport?.city?.city_name || '-'}</div>
      </div>

      {/* Arrow */}
      <div className="col-span-1 flex justify-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-[2px] bg-gradient-to-r from-transparent to-primary/50"></div>
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
            {flight.flight_type === 'departure' ? (
              <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49s5.43-1.45 14.49-3.88c.79-.22 1.27-1.05 1.15-1.4z" />
            ) : (
              <path d="M2.5 19h19v2h-19v-2zm7.18-5.73l4.35 1.16 5.31 1.42c.8.21 1.62-.26 1.84-1.06.21-.8-.26-1.62-1.06-1.84l-5.31-1.42-2.76-9.02L10.12 2v8.28L5.15 8.95l-.93-2.32-1.45-.39v5.17l6.91 1.86z" />
            )}
          </svg>
          <div className="w-8 h-[2px] bg-gradient-to-r from-primary/50 to-transparent"></div>
        </div>
      </div>

      {/* Destination */}
      <div className="col-span-2">
        <div className="text-2xl font-bold text-white">{flight.destination_airport?.airport_code || '-'}</div>
        <div className="text-sm text-white/60 truncate">{flight.destination_airport?.city?.city_name || '-'}</div>
      </div>

      {/* Time */}
      <div className="col-span-2">
        <div className="text-xl font-bold text-white">{formatTime(flight.scheduled_time)}</div>
        {flight.actual_time && flight.actual_time !== flight.scheduled_time && (
          <div className="text-sm text-warning">Actual: {formatTime(flight.actual_time)}</div>
        )}
      </div>

      {/* Terminal */}
      <div className="col-span-1">
        <div className="text-lg font-semibold text-white">{flight.terminal?.terminal_code || '-'}</div>
      </div>

      {/* Gate */}
      <div className="col-span-1">
        <div className="text-lg font-semibold text-primary">{flight.gate?.gate_code || '-'}</div>
      </div>

      {/* Status */}
      <div className="col-span-2 flex justify-end">
        <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${getStatusClass(flight.status?.status_name)}`}>
          {flight.status?.status_name || 'Unknown'}
        </span>
      </div>
    </div>
  );
}
