'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminFlightStatusesApi } from '@/app/lib/api';
import { FlightStatus, FlightStatusFormData } from '@/app/types';
import DataTable from '@/app/components/DataTable';
import Modal from '@/app/components/Modal';
import Toast from '@/app/components/Toast';

const initialFormData: FlightStatusFormData = {
  status_name: '',
};

export default function FlightStatusesPage() {
  const [statuses, setStatuses] = useState<FlightStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<FlightStatus | null>(null);
  const [formData, setFormData] = useState<FlightStatusFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<FlightStatus | null>(null);

const fetchStatuses = useCallback(async () => {
    try {
      const response = await adminFlightStatusesApi.list({ per_page: '100' });
      if (response.success) {
        setStatuses(response.data?.items || []);
      }
    } catch {
      setToast({ message: 'Gagal memuat data flight statuses', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const handleOpenModal = (status?: FlightStatus) => {
    if (status) {
      setEditingStatus(status);
      setFormData({ status_name: status.status_name });
    } else {
      setEditingStatus(null);
      setFormData(initialFormData);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingStatus(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let response;
      if (editingStatus) {
        response = await adminFlightStatusesApi.update(editingStatus.id, formData);
      } else {
        response = await adminFlightStatusesApi.create(formData);
      }

      if (response.success) {
        setToast({ message: `Flight Status berhasil ${editingStatus ? 'diupdate' : 'ditambahkan'}`, type: 'success' });
        handleCloseModal();
        fetchStatuses();
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
      const response = await adminFlightStatusesApi.delete(deleteConfirm.id);
      if (response.success) {
        setToast({ message: 'Flight Status berhasil dihapus', type: 'success' });
        fetchStatuses();
      } else {
        setToast({ message: response.message || 'Gagal menghapus', type: 'error' });
      }
    } catch {
      setToast({ message: 'Terjadi kesalahan', type: 'error' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const getStatusColor = (name: string) => {
    const status = name.toLowerCase();
    if (status.includes('on time') || status.includes('scheduled')) return 'bg-success/20 text-success';
    if (status.includes('delay')) return 'bg-warning/20 text-warning';
    if (status.includes('cancel')) return 'bg-danger/20 text-danger';
    if (status.includes('boarding')) return 'bg-primary/20 text-primary';
    if (status.includes('depart')) return 'bg-purple-500/20 text-purple-400';
    if (status.includes('arriv') || status.includes('landed')) return 'bg-cyan-500/20 text-cyan-400';
    return 'bg-white/10 text-white';
  };

  const columns = [
    { key: 'status_name', label: 'Status Name', render: (s: FlightStatus) => (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(s.status_name)}`}>
        {s.status_name}
      </span>
    )},
    { key: 'created_at', label: 'Created', render: (s: FlightStatus) => new Date(s.created_at).toLocaleDateString('id-ID') },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Flight Statuses</h1>
          <p className="text-white/60">Kelola status penerbangan</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Status
        </button>
      </div>

      <DataTable
        columns={columns}
        data={statuses}
        loading={loading}
        onEdit={handleOpenModal}
        onDelete={setDeleteConfirm}
        emptyMessage="Belum ada data flight statuses"
      />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingStatus ? 'Edit Flight Status' : 'Add Flight Status'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Status Name</label>
            <input
              type="text"
              value={formData.status_name}
              onChange={(e) => setFormData({ ...formData, status_name: e.target.value })}
              className="input-field"
              placeholder="On Time"
              required
            />
            <p className="text-xs text-white/50 mt-2">
              Contoh: On Time, Delayed, Cancelled, Boarding, Departed, Arrived
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={handleCloseModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Konfirmasi Hapus" size="sm">
        <p className="text-white/80 mb-6">
          Apakah Anda yakin ingin menghapus status <strong className="text-white">{deleteConfirm?.status_name}</strong>?
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
