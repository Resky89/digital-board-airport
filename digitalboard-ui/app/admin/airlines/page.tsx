'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminAirlinesApi } from '@/app/lib/api';
import { Airline, AirlineFormData } from '@/app/types';
import DataTable from '@/app/components/DataTable';
import Modal from '@/app/components/Modal';
import Toast from '@/app/components/Toast';

const initialFormData: AirlineFormData = {
  airline_code: '',
  airline_name: '',
};

export default function AirlinesPage() {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAirline, setEditingAirline] = useState<Airline | null>(null);
  const [formData, setFormData] = useState<AirlineFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Airline | null>(null);

const fetchAirlines = useCallback(async () => {
    try {
      const response = await adminAirlinesApi.list({ per_page: '100' });
      if (response.success) {
        setAirlines(response.data?.items || []);
      }
    } catch {
      setToast({ message: 'Gagal memuat data airlines', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAirlines();
  }, [fetchAirlines]);

  const handleOpenModal = (airline?: Airline) => {
    if (airline) {
      setEditingAirline(airline);
      setFormData({ airline_code: airline.airline_code, airline_name: airline.airline_name });
    } else {
      setEditingAirline(null);
      setFormData(initialFormData);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAirline(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let response;
      if (editingAirline) {
        response = await adminAirlinesApi.update(editingAirline.id, formData);
      } else {
        response = await adminAirlinesApi.create(formData);
      }

      if (response.success) {
        setToast({ message: `Airline berhasil ${editingAirline ? 'diupdate' : 'ditambahkan'}`, type: 'success' });
        handleCloseModal();
        fetchAirlines();
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
      const response = await adminAirlinesApi.delete(deleteConfirm.id);
      if (response.success) {
        setToast({ message: 'Airline berhasil dihapus', type: 'success' });
        fetchAirlines();
      } else {
        setToast({ message: response.message || 'Gagal menghapus', type: 'error' });
      }
    } catch {
      setToast({ message: 'Terjadi kesalahan', type: 'error' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const columns = [
    { key: 'airline_code', label: 'Code' },
    { key: 'airline_name', label: 'Name' },
    { key: 'created_at', label: 'Created', render: (a: Airline) => new Date(a.created_at).toLocaleDateString('id-ID') },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Airlines</h1>
          <p className="text-white/60">Kelola data maskapai penerbangan</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Airline
        </button>
      </div>

      <DataTable
        columns={columns}
        data={airlines}
        loading={loading}
        onEdit={handleOpenModal}
        onDelete={setDeleteConfirm}
        emptyMessage="Belum ada data airlines"
      />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingAirline ? 'Edit Airline' : 'Add Airline'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Airline Code</label>
            <input
              type="text"
              value={formData.airline_code}
              onChange={(e) => setFormData({ ...formData, airline_code: e.target.value.toUpperCase() })}
              className="input-field"
              placeholder="GA"
              maxLength={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Airline Name</label>
            <input
              type="text"
              value={formData.airline_name}
              onChange={(e) => setFormData({ ...formData, airline_name: e.target.value })}
              className="input-field"
              placeholder="Garuda Indonesia"
              required
            />
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
          Apakah Anda yakin ingin menghapus airline <strong className="text-white">{deleteConfirm?.airline_name}</strong>?
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
