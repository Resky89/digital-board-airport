'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminCountriesApi } from '@/app/lib/api';
import { Country, CountryFormData } from '@/app/types';
import DataTable from '@/app/components/DataTable';
import Modal from '@/app/components/Modal';
import Toast from '@/app/components/Toast';

const initialFormData: CountryFormData = {
  country_code: '',
  country_name: '',
};

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState<CountryFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Country | null>(null);

  const fetchCountries = useCallback(async () => {
    try {
      const response = await adminCountriesApi.list({ per_page: '100' });
      if (response.success) {
        setCountries(response.data || []);
      }
    } catch {
      setToast({ message: 'Gagal memuat data countries', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const handleOpenModal = (country?: Country) => {
    if (country) {
      setEditingCountry(country);
      setFormData({ country_code: country.country_code, country_name: country.country_name });
    } else {
      setEditingCountry(null);
      setFormData(initialFormData);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCountry(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let response;
      if (editingCountry) {
        response = await adminCountriesApi.update(editingCountry.id, formData);
      } else {
        response = await adminCountriesApi.create(formData);
      }

      if (response.success) {
        setToast({ message: `Country berhasil ${editingCountry ? 'diupdate' : 'ditambahkan'}`, type: 'success' });
        handleCloseModal();
        fetchCountries();
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
      const response = await adminCountriesApi.delete(deleteConfirm.id);
      if (response.success) {
        setToast({ message: 'Country berhasil dihapus', type: 'success' });
        fetchCountries();
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
    { key: 'country_code', label: 'Code' },
    { key: 'country_name', label: 'Name' },
    { key: 'created_at', label: 'Created', render: (c: Country) => new Date(c.created_at).toLocaleDateString('id-ID') },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Countries</h1>
          <p className="text-white/60">Kelola data negara</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Country
        </button>
      </div>

      <DataTable
        columns={columns}
        data={countries}
        loading={loading}
        onEdit={handleOpenModal}
        onDelete={setDeleteConfirm}
        emptyMessage="Belum ada data countries"
      />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingCountry ? 'Edit Country' : 'Add Country'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Country Code</label>
            <input
              type="text"
              value={formData.country_code}
              onChange={(e) => setFormData({ ...formData, country_code: e.target.value.toUpperCase() })}
              className="input-field"
              placeholder="ID"
              maxLength={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Country Name</label>
            <input
              type="text"
              value={formData.country_name}
              onChange={(e) => setFormData({ ...formData, country_name: e.target.value })}
              className="input-field"
              placeholder="Indonesia"
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
          Apakah Anda yakin ingin menghapus country <strong className="text-white">{deleteConfirm?.country_name}</strong>?
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
