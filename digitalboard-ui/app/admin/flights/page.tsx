'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminFlightsApi, adminAirlinesApi, adminAirportsApi, adminTerminalsApi, adminGatesApi, adminFlightStatusesApi } from '@/app/lib/api';
import { Flight, Airline, Airport, Terminal, Gate, FlightStatus, FlightFormData } from '@/app/types';
import DataTable from '@/app/components/DataTable';
import LazySelect from '@/app/components/LazySelect';
import Modal from '@/app/components/Modal';
import Toast from '@/app/components/Toast';

const initialFormData: FlightFormData = {
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

const handleOpenModal = async (flight?: Flight) => {
    if (flight) {
      setEditingFlight(flight);
      try {
        const res = await adminFlightsApi.get((flight as any).id ?? (flight as any).flight_id);
        const f = res?.data || {};
        const airlineId = f.airline?.airline_id ?? flight.airline_id ?? '';
        const originId = f.origin_airport?.airport_id ?? flight.origin_airport_id ?? '';
        const destinationId = f.destination_airport?.airport_id ?? flight.destination_airport_id ?? '';
        const terminalId = f.terminal?.terminal_id ?? flight.terminal_id ?? '';
        const gateId = f.gate?.gate_id ?? flight.gate_id ?? '';
        const statusId = f.status?.status_id ?? flight.status_id ?? '';

        const newData = {
          airline_id: String(airlineId),
          origin_airport_id: String(originId),
          destination_airport_id: String(destinationId),
          gate_id: String(gateId),
          terminal_id: String(terminalId),
          status_id: String(statusId),
          flight_type: f.flight_type ?? flight.flight_type,
          scheduled_time: (f.scheduled_time ?? flight.scheduled_time ?? '').slice(0, 16),
          actual_time: (f.actual_time ?? flight.actual_time ?? '').slice(0, 16),
        };
        setFormData(newData);
        setModalOpen(true);
      } catch (e) {
        // Fallback to existing data if fetch fails
        const fallback = {
          airline_id: String(flight.airline_id ?? ''),
          origin_airport_id: String(flight.origin_airport_id ?? ''),
          destination_airport_id: String(flight.destination_airport_id ?? ''),
          gate_id: String(flight.gate_id ?? ''),
          terminal_id: String(flight.terminal_id ?? ''),
          status_id: String(flight.status_id ?? ''),
          flight_type: flight.flight_type,
          scheduled_time: flight.scheduled_time ? flight.scheduled_time.slice(0, 16) : '',
          actual_time: flight.actual_time ? flight.actual_time.slice(0, 16) : '',
        };
        setFormData(fallback);
        setModalOpen(true);
      }
    } else {
      setEditingFlight(null);
      setFormData(initialFormData);
      setModalOpen(true);
    }
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

  const getStatusClass = (statusName?: string) => {
    const status = (statusName || '').toLowerCase();
    if (status.includes('on time')) return 'bg-emerald-500/20 text-emerald-300';
    if (status.includes('scheduled')) return 'bg-indigo-500/20 text-indigo-300';
    if (status.includes('delayed')) return 'bg-amber-500/20 text-amber-300';
    if (status.includes('cancelled')) return 'bg-rose-500/20 text-rose-300';
    if (status.includes('boarding')) return 'bg-sky-500/20 text-sky-300';
    if (status.includes('departed')) return 'bg-violet-500/20 text-violet-300';
    if (status.includes('arrived') || status.includes('landed')) return 'bg-cyan-500/20 text-cyan-300';
    return 'bg-white/10 text-white';
  };

  const getTypeClass = (type?: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('departure')) return 'bg-orange-500/20 text-orange-300';
    if (t.includes('arrival')) return 'bg-teal-500/20 text-teal-300';
    return 'bg-white/10 text-white';
  };

  const columns = [
    { key: 'flight_code', label: 'Flight Code' },
    { key: 'airline', label: 'Airline', render: (f: Flight) => f.airline?.airline_name || '-' },
    { key: 'origin', label: 'Origin', render: (f: Flight) => f.origin_airport?.airport_code || '-' },
    { key: 'destination', label: 'Destination', render: (f: Flight) => f.destination_airport?.airport_code || '-' },
    { key: 'flight_type', label: 'Type', render: (f: Flight) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeClass(String(f.flight_type))}`}>
        {f.flight_type}
      </span>
    )},
    { key: 'scheduled_time', label: 'Scheduled', render: (f: Flight) => formatTime(f.scheduled_time) },
    { key: 'status', label: 'Status', render: (f: Flight) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(f.status?.status_name)}`}>
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
<LazySelect<Airline>
              label="Airline"
              value={formData.airline_id}
              onChange={(airlineId) => setFormData({ ...formData, airline_id: airlineId.toString() })}
              fetchFunction={adminAirlinesApi.list}
              fetchParams={{ per_page: '100' }}
              fetchById={adminAirlinesApi.get}
              getOptionLabel={(airline) => `${airline.airline_code} - ${airline.airline_name}`}
              getOptionValue={(airline) => airline.id}
              placeholder="Select Airline"
              required
            />
<LazySelect<Airport>
              label="Origin Airport"
              value={formData.origin_airport_id}
              onChange={(airportId) => setFormData({ ...formData, origin_airport_id: airportId.toString() })}
              fetchFunction={adminAirportsApi.list}
              fetchParams={{ per_page: '100' }}
              fetchById={adminAirportsApi.get}
              getOptionLabel={(airport) => `${airport.airport_code} - ${airport.airport_name}`}
              getOptionValue={(airport) => airport.id}
              placeholder="Select Origin"
              required
            />
<LazySelect<Airport>
              label="Destination Airport"
              value={formData.destination_airport_id}
              onChange={(airportId) => setFormData({ ...formData, destination_airport_id: airportId.toString() })}
              fetchFunction={adminAirportsApi.list}
              fetchParams={{ per_page: '100' }}
              fetchById={adminAirportsApi.get}
              getOptionLabel={(airport) => `${airport.airport_code} - ${airport.airport_name}`}
              getOptionValue={(airport) => airport.id}
              placeholder="Select Destination"
              required
            />
<LazySelect<Terminal>
              label="Terminal"
              value={formData.terminal_id}
              onChange={(terminalId) => setFormData({ ...formData, terminal_id: terminalId.toString() })}
              fetchFunction={adminTerminalsApi.list}
              fetchParams={{ per_page: '100' }}
              fetchById={adminTerminalsApi.get}
              getOptionLabel={(terminal) => `${terminal.terminal_code} - ${terminal.terminal_name}`}
              getOptionValue={(terminal) => terminal.id}
              placeholder="Select Terminal"
              required
            />
<LazySelect<Gate>
              label="Gate"
              value={formData.gate_id}
              onChange={(gateId) => setFormData({ ...formData, gate_id: gateId.toString() })}
              fetchFunction={adminGatesApi.list}
              fetchParams={{ per_page: '100' }}
              fetchById={adminGatesApi.get}
              getOptionLabel={(gate) => gate.gate_code}
              getOptionValue={(gate) => gate.id}
              placeholder="Select Gate"
              required
            />
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
<LazySelect<FlightStatus>
              label="Status"
              value={formData.status_id}
              onChange={(statusId) => setFormData({ ...formData, status_id: statusId.toString() })}
              fetchFunction={adminFlightStatusesApi.list}
              fetchParams={{ per_page: '100' }}
              fetchById={adminFlightStatusesApi.get}
              getOptionLabel={(status) => status.status_name}
              getOptionValue={(status) => status.id}
              placeholder="Select Status"
              required
            />
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
