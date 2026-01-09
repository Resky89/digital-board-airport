'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminAirportsApi, adminCitiesApi } from '@/app/lib/api';
import { Airport, City, AirportFormData } from '@/app/types';
import DataTable from '@/app/components/DataTable';
import LazySelect from '@/app/components/LazySelect';
import Modal from '@/app/components/Modal';
import Toast from '@/app/components/Toast';

const initialFormData: AirportFormData = {
  airport_code: '',
  airport_name: '',
  city_id: '',
};

export default function AirportsPage() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null);
  const [formData, setFormData] = useState<AirportFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Airport | null>(null);

const fetchAirports = useCallback(async () => {
    try {
      const response = await adminAirportsApi.list({ per_page: '100' });
      if (response.success) {
        setAirports(response.data?.items || []);
      }
    } catch {
      setToast({ message: 'Gagal memuat data airports', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRelatedData = useCallback(async () => {
    try {
      const citiesRes = await adminCitiesApi.list({ per_page: '100' });
      if (citiesRes.success) {
        setCities(citiesRes.data?.items || []);
      }
    } catch {
      console.error('Failed to fetch related data');
    }
  }, []);

  useEffect(() => {
    fetchAirports();
    fetchRelatedData();
  }, [fetchAirports, fetchRelatedData]);

const handleOpenModal = (airport?: Airport) => {
    if (airport) {
      setEditingAirport(airport);
setFormData({
        airport_code: airport.airport_code,
        airport_name: airport.airport_name,
        city_id: String(airport.city_id ?? ''),
      });
    } else {
      setEditingAirport(null);
      setFormData(initialFormData);
    }
    setModalOpen(true);
  };

const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAirport(null);
    setFormData(initialFormData);
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = { ...formData, city_id: Number(formData.city_id) };
      let response;
      if (editingAirport) {
        response = await adminAirportsApi.update(editingAirport.id, payload);
      } else {
        response = await adminAirportsApi.create(payload);
      }

      if (response.success) {
        setToast({ message: `Airport berhasil ${editingAirport ? 'diupdate' : 'ditambahkan'}`, type: 'success' });
        handleCloseModal();
        fetchAirports();
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
      const response = await adminAirportsApi.delete(deleteConfirm.id);
      if (response.success) {
        setToast({ message: 'Airport berhasil dihapus', type: 'success' });
        fetchAirports();
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
    { key: 'airport_code', label: 'Code' },
    { key: 'airport_name', label: 'Name' },
    { key: 'city', label: 'City', render: (a: Airport) => a.city?.city_name || '-' },
    { key: 'country', label: 'Country', render: (a: Airport) => a.city?.country?.country_name || '-' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Airports</h1>
          <p className="text-white/60">Kelola data bandara</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Airport
        </button>
      </div>

      <DataTable
        columns={columns}
        data={airports}
        loading={loading}
        onEdit={handleOpenModal}
        onDelete={setDeleteConfirm}
        emptyMessage="Belum ada data airports"
      />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingAirport ? 'Edit Airport' : 'Add Airport'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Airport Code</label>
            <input
              type="text"
              value={formData.airport_code}
              onChange={(e) => setFormData({ ...formData, airport_code: e.target.value.toUpperCase() })}
              className="input-field"
              placeholder="CGK"
              maxLength={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Airport Name</label>
            <input
              type="text"
              value={formData.airport_name}
              onChange={(e) => setFormData({ ...formData, airport_name: e.target.value })}
              className="input-field"
              placeholder="Soekarno-Hatta International Airport"
              required
            />
          </div>
<LazySelect<City>
            label="City"
            value={formData.city_id}
            onChange={(cityId) => setFormData({ ...formData, city_id: cityId.toString() })}
            fetchFunction={adminCitiesApi.list}
            fetchParams={{ per_page: '100' }}
            getOptionLabel={(city) => `${city.city_name} (${city.country?.country_name || city.country_id})`}
            getOptionValue={(city) => city.id}
            placeholder="Select City"
            required
          />
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
          Apakah Anda yakin ingin menghapus airport <strong className="text-white">{deleteConfirm?.airport_name}</strong>?
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
