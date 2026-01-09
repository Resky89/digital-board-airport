'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminFlightsApi, adminAirlinesApi, adminAirportsApi, adminTerminalsApi, adminGatesApi, adminFlightStatusesApi } from '@/app/lib/api';
import { Flight, Airline, Airport, Terminal, Gate, FlightStatus, FlightFormData } from '@/app/types';
import DataTable from '@/app/components/DataTable';
import Modal from '@/app/components/Modal';
import Toast from '@/app/components/Toast';

const initialFormData: FlightFormData = {
  flight_code: '',
  airline_id: '',
  origin_airport_id: '',
  destination_airport_id: '',
  gate_id: '',
  terminal_id: '',
  status_id: '',
  flight_type: 'departure',
  scheduled_time: '',
  actual_time: '',
};

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [statuses, setStatuses] = useState<FlightStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [formData, setFormData] = useState<FlightFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Flight | null>(null);

const fetchFlights = useCallback(async () => {
    try {
const response = await adminFlightsApi.list({ per_page: '100' });
      if (response.success) {
        setFlights(response.data?.items || []);
      }
    } catch {
      setToast({ message: 'Gagal memuat data flights', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

const fetchRelatedData = useCallback(async () => {
    try {
      const [airlinesRes, airportsRes, terminalsRes, gatesRes, statusesRes] = await Promise.all([
        adminAirlinesApi.list({ per_page: '100' }),
        adminAirportsApi.list({ per_page: '100' }),
        adminTerminalsApi.list({ per_page: '100' }),
        adminGatesApi.list({ per_page: '100' }),
        adminFlightStatusesApi.list({ per_page: '100' }),
      ]);
setAirlines(airlinesRes.data?.items || []);
      setAirports(airportsRes.data?.items || []);
      setTerminals(terminalsRes.data?.items || []);
      setGates(gatesRes.data?.items || []);
      setStatuses(statusesRes.data?.items || []);
    } catch {
      console.error('Failed to fetch related data');
    }
  }, []);

  useEffect(() => {
    fetchFlights();
    fetchRelatedData();
  }, [fetchFlights, fetchRelatedData]);

  const handleOpenModal = (flight?: Flight) => {
    if (flight) {
      setEditingFlight(flight);
      setFormData({
        flight_code: flight.flight_code,
        airline_id: flight.airline_id,
        origin_airport_id: flight.origin_airport_id,
        destination_airport_id: flight.destination_airport_id,
        gate_id: flight.gate_id,
        terminal_id: flight.terminal_id,
        status_id: flight.status_id,
        flight_type: flight.flight_type,
        scheduled_time: flight.scheduled_time.slice(0, 16),
        actual_time: flight.actual_time?.slice(0, 16) || '',
      });
    } else {
      setEditingFlight(null);
      setFormData(initialFormData);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingFlight(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        flight_code: formData.flight_code,
        airline_id: Number(formData.airline_id),
        origin_airport_id: Number(formData.origin_airport_id),
        destination_airport_id: Number(formData.destination_airport_id),
        gate_id: Number(formData.gate_id),
        terminal_id: Number(formData.terminal_id),
        status_id: Number(formData.status_id),
        flight_type: formData.flight_type,
        scheduled_time: new Date(formData.scheduled_time).toISOString(),
        actual_time: formData.actual_time ? new Date(formData.actual_time).toISOString() : null,
      };

let response;
      if (editingFlight) {
        response = await adminFlightsApi.update(editingFlight.id, payload);
      } else {
        response = await adminFlightsApi.create(payload);
      }

      if (response.success) {
        setToast({ message: `Flight berhasil ${editingFlight ? 'diupdate' : 'ditambahkan'}`, type: 'success' });
        handleCloseModal();
        fetchFlights();
      } else {
        setToast({ message: response.message || 'Gagal menyimpan data', type: 'error' });
      }
    } catch {
      setToast({ message: 'Terjadi kesalahan', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
try {
      const response = await adminFlightsApi.delete(deleteConfirm.id);
      if (response.success) {
        setToast({ message: 'Flight berhasil dihapus', type: 'success' });
        fetchFlights();
      } else {
        setToast({ message: response.message || 'Gagal menghapus', type: 'error' });
      }
    } catch {
      setToast({ message: 'Terjadi kesalahan', type: 'error' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  const columns = [
    { key: 'flight_code', label: 'Flight Code' },
    { key: 'airline', label: 'Airline', render: (f: Flight) => f.airline?.airline_name || '-' },
    { key: 'origin', label: 'Origin', render: (f: Flight) => f.origin_airport?.airport_code || '-' },
    { key: 'destination', label: 'Destination', render: (f: Flight) => f.destination_airport?.airport_code || '-' },
    { key: 'flight_type', label: 'Type', render: (f: Flight) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${f.flight_type === 'departure' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
        {f.flight_type}
      </span>
    )},
    { key: 'scheduled_time', label: 'Scheduled', render: (f: Flight) => formatTime(f.scheduled_time) },
    { key: 'status', label: 'Status', render: (f: Flight) => (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
        {f.status?.status_name || '-'}
      </span>
    )},
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Flights</h1>
          <p className="text-white/60">Kelola jadwal penerbangan</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Flight
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={flights}
        loading={loading}
        onEdit={handleOpenModal}
        onDelete={setDeleteConfirm}
        emptyMessage="Belum ada data penerbangan"
      />

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingFlight ? 'Edit Flight' : 'Add Flight'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Flight Code</label>
              <input
                type="text"
                value={formData.flight_code}
                onChange={(e) => setFormData({ ...formData, flight_code: e.target.value })}
                className="input-field"
                placeholder="GA123"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Airline</label>
              <select
                value={formData.airline_id}
                onChange={(e) => setFormData({ ...formData, airline_id: Number(e.target.value) || '' })}
                className="input-field"
                required
              >
                <option value="">Select Airline</option>
{Array.isArray(airlines) && airlines.map((a) => (
                  <option key={a.id} value={a.id}>{a.airline_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Origin Airport</label>
              <select
                value={formData.origin_airport_id}
                onChange={(e) => setFormData({ ...formData, origin_airport_id: Number(e.target.value) || '' })}
                className="input-field"
                required
              >
<option value="">Select Origin</option>
                {Array.isArray(airports) && airports.map((a) => (
                  <option key={a.id} value={a.id}>{a.airport_code} - {a.airport_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Destination Airport</label>
              <select
                value={formData.destination_airport_id}
                onChange={(e) => setFormData({ ...formData, destination_airport_id: Number(e.target.value) || '' })}
                className="input-field"
                required
              >
<option value="">Select Destination</option>
                {Array.isArray(airports) && airports.map((a) => (
                  <option key={a.id} value={a.id}>{a.airport_code} - {a.airport_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Terminal</label>
              <select
                value={formData.terminal_id}
                onChange={(e) => setFormData({ ...formData, terminal_id: Number(e.target.value) || '' })}
                className="input-field"
                required
              >
<option value="">Select Terminal</option>
                {Array.isArray(terminals) && terminals.map((t) => (
                  <option key={t.id} value={t.id}>{t.terminal_code} - {t.terminal_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Gate</label>
              <select
                value={formData.gate_id}
                onChange={(e) => setFormData({ ...formData, gate_id: Number(e.target.value) || '' })}
                className="input-field"
                required
              >
<option value="">Select Gate</option>
                {Array.isArray(gates) && gates.map((g) => (
                  <option key={g.id} value={g.id}>{g.gate_code}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Flight Type</label>
              <select
                value={formData.flight_type}
                onChange={(e) => setFormData({ ...formData, flight_type: e.target.value as 'departure' | 'arrival' })}
                className="input-field"
                required
              >
                <option value="departure">Departure</option>
                <option value="arrival">Arrival</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
              <select
                value={formData.status_id}
                onChange={(e) => setFormData({ ...formData, status_id: Number(e.target.value) || '' })}
                className="input-field"
                required
              >
<option value="">Select Status</option>
                {Array.isArray(statuses) && statuses.map((s) => (
                  <option key={s.id} value={s.id}>{s.status_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Scheduled Time</label>
              <input
                type="datetime-local"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Actual Time (Optional)</label>
              <input
                type="datetime-local"
                value={formData.actual_time}
                onChange={(e) => setFormData({ ...formData, actual_time: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={handleCloseModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Konfirmasi Hapus" size="sm">
        <p className="text-white/80 mb-6">
          Apakah Anda yakin ingin menghapus flight <strong className="text-white">{deleteConfirm?.flight_code}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Batal</button>
          <button onClick={handleDelete} className="btn-danger">Hapus</button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
