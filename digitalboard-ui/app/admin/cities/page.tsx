'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminCitiesApi, adminCountriesApi } from '@/app/lib/api';
import { City, Country, CityFormData } from '@/app/types';
import DataTable from '@/app/components/DataTable';
import Modal from '@/app/components/Modal';
import Toast from '@/app/components/Toast';

const initialFormData: CityFormData = {
  city_code: '',
  city_name: '',
  country_id: '',
};

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState<CityFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<City | null>(null);

  const fetchCities = useCallback(async () => {
    try {
      const response = await adminCitiesApi.list({ per_page: '100' });
      if (response.success) {
        setCities(response.data?.items || []);
      }
    } catch {
      setToast({ message: 'Gagal memuat data cities', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCountries = useCallback(async () => {
    try {
      const response = await adminCountriesApi.list({ per_page: '100' });
      if (response.success) {
        setCountries(response.data?.items || []);
      }
    } catch {
      console.error('Failed to fetch countries');
    }
  }, []);

  useEffect(() => {
    fetchCities();
    fetchCountries();
  }, [fetchCities, fetchCountries]);

  const handleOpenModal = (city?: City) => {
    if (city) {
      setEditingCity(city);
      setFormData({
        city_code: city.city_code,
        city_name: city.city_name,
        country_id: city.country_id,
      });
    } else {
      setEditingCity(null);
      setFormData(initialFormData);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCity(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = { ...formData, country_id: Number(formData.country_id) };
      let response;
      if (editingCity) {
        response = await adminCitiesApi.update(editingCity.id, payload);
      } else {
        response = await adminCitiesApi.create(payload);
      }

      if (response.success) {
        setToast({ message: `City berhasil ${editingCity ? 'diupdate' : 'ditambahkan'}`, type: 'success' });
        handleCloseModal();
        fetchCities();
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
      const response = await adminCitiesApi.delete(deleteConfirm.id);
      if (response.success) {
        setToast({ message: 'City berhasil dihapus', type: 'success' });
        fetchCities();
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
    { key: 'city_code', label: 'Code' },
    { key: 'city_name', label: 'Name' },
    { key: 'country', label: 'Country', render: (c: City) => c.country?.country_name || '-' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cities</h1>
          <p className="text-white/60">Kelola data kota</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add City
        </button>
      </div>

      <DataTable
        columns={columns}
        data={cities}
        loading={loading}
        onEdit={handleOpenModal}
        onDelete={setDeleteConfirm}
        emptyMessage="Belum ada data cities"
      />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingCity ? 'Edit City' : 'Add City'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">City Code</label>
            <input
              type="text"
              value={formData.city_code}
              onChange={(e) => setFormData({ ...formData, city_code: e.target.value.toUpperCase() })}
              className="input-field"
              placeholder="JKT"
              maxLength={10}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">City Name</label>
            <input
              type="text"
              value={formData.city_name}
              onChange={(e) => setFormData({ ...formData, city_name: e.target.value })}
              className="input-field"
              placeholder="Jakarta"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Country</label>
            <select
              value={formData.country_id}
              onChange={(e) => setFormData({ ...formData, country_id: Number(e.target.value) || '' })}
              className="input-field"
              required
            >
              <option value="">Select Country</option>
              {Array.isArray(countries) && countries.map((c) => (
                <option key={c.id} value={c.id}>{c.country_name}</option>
              ))}
            </select>
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
          Apakah Anda yakin ingin menghapus city <strong className="text-white">{deleteConfirm?.city_name}</strong>?
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