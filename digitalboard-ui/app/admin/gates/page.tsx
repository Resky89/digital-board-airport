'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminGatesApi, adminTerminalsApi } from '@/app/lib/api';
import { Gate, Terminal, GateFormData } from '@/app/types';
import DataTable from '@/app/components/DataTable';
import Modal from '@/app/components/Modal';
import Toast from '@/app/components/Toast';

const initialFormData: GateFormData = {
  gate_code: '',
  terminal_id: '',
};

export default function GatesPage() {
  const [gates, setGates] = useState<Gate[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGate, setEditingGate] = useState<Gate | null>(null);
  const [formData, setFormData] = useState<GateFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Gate | null>(null);

  const fetchGates = useCallback(async () => {
    try {
      const response = await adminGatesApi.list({ per_page: '100' });
      if (response.success) {
        setGates(response.data || []);
      }
    } catch {
      setToast({ message: 'Gagal memuat data gates', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTerminals = useCallback(async () => {
    try {
      const response = await adminTerminalsApi.list({ per_page: '100' });
      if (response.success && Array.isArray(response.data)) {
        setTerminals(response.data);
      }
    } catch {
      console.error('Failed to fetch terminals');
    }
  }, []);

  useEffect(() => {
    fetchGates();
    fetchTerminals();
  }, [fetchGates, fetchTerminals]);

  const handleOpenModal = (gate?: Gate) => {
    if (gate) {
      setEditingGate(gate);
      setFormData({ gate_code: gate.gate_code, terminal_id: gate.terminal_id });
    } else {
      setEditingGate(null);
      setFormData(initialFormData);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingGate(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = { gate_code: formData.gate_code, terminal_id: Number(formData.terminal_id) };
      let response;
      if (editingGate) {
        response = await adminGatesApi.update(editingGate.id, payload);
      } else {
        response = await adminGatesApi.create(payload);
      }

      if (response.success) {
        setToast({ message: `Gate berhasil ${editingGate ? 'diupdate' : 'ditambahkan'}`, type: 'success' });
        handleCloseModal();
        fetchGates();
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
      const response = await adminGatesApi.delete(deleteConfirm.id);
      if (response.success) {
        setToast({ message: 'Gate berhasil dihapus', type: 'success' });
        fetchGates();
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
    { key: 'gate_code', label: 'Gate Code' },
    { key: 'terminal', label: 'Terminal', render: (g: Gate) => g.terminal?.terminal_name || '-' },
    { key: 'created_at', label: 'Created', render: (g: Gate) => new Date(g.created_at).toLocaleDateString('id-ID') },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gates</h1>
          <p className="text-white/60">Kelola data gate boarding</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Gate
        </button>
      </div>

      <DataTable
        columns={columns}
        data={gates}
        loading={loading}
        onEdit={handleOpenModal}
        onDelete={setDeleteConfirm}
        emptyMessage="Belum ada data gates"
      />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingGate ? 'Edit Gate' : 'Add Gate'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Gate Code</label>
            <input
              type="text"
              value={formData.gate_code}
              onChange={(e) => setFormData({ ...formData, gate_code: e.target.value.toUpperCase() })}
              className="input-field"
              placeholder="A1"
              maxLength={5}
              required
            />
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
          Apakah Anda yakin ingin menghapus gate <strong className="text-white">{deleteConfirm?.gate_code}</strong>?
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
