'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminTerminalsApi } from '@/app/lib/api';
import { Terminal, TerminalFormData } from '@/app/types';
import DataTable from '@/app/components/DataTable';
import Modal from '@/app/components/Modal';
import Toast from '@/app/components/Toast';

const initialFormData: TerminalFormData = {
  terminal_code: '',
  terminal_name: '',
  description: '',
};

export default function TerminalsPage() {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTerminal, setEditingTerminal] = useState<Terminal | null>(null);
  const [formData, setFormData] = useState<TerminalFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Terminal | null>(null);

const fetchTerminals = useCallback(async () => {
    try {
      const response = await adminTerminalsApi.list({ per_page: '100' });
      if (response.success) {
        setTerminals(response.data?.items || []);
      }
    } catch {
      setToast({ message: 'Gagal memuat data terminals', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTerminals();
  }, [fetchTerminals]);

  const handleOpenModal = (terminal?: Terminal) => {
    if (terminal) {
      setEditingTerminal(terminal);
      setFormData({
        terminal_code: terminal.terminal_code,
        terminal_name: terminal.terminal_name,
        description: terminal.description,
      });
    } else {
      setEditingTerminal(null);
      setFormData(initialFormData);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTerminal(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let response;
      if (editingTerminal) {
        response = await adminTerminalsApi.update(editingTerminal.id, formData);
      } else {
        response = await adminTerminalsApi.create(formData);
      }

      if (response.success) {
        setToast({ message: `Terminal berhasil ${editingTerminal ? 'diupdate' : 'ditambahkan'}`, type: 'success' });
        handleCloseModal();
        fetchTerminals();
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
      const response = await adminTerminalsApi.delete(deleteConfirm.id);
      if (response.success) {
        setToast({ message: 'Terminal berhasil dihapus', type: 'success' });
        fetchTerminals();
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
    { key: 'terminal_code', label: 'Code' },
    { key: 'terminal_name', label: 'Name' },
    { key: 'description', label: 'Description', render: (t: Terminal) => (
      <span className="text-white/70 truncate max-w-xs block">{t.description || '-'}</span>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Terminals</h1>
          <p className="text-white/60">Kelola data terminal bandara</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Terminal
        </button>
      </div>

      <DataTable
        columns={columns}
        data={terminals}
        loading={loading}
        onEdit={handleOpenModal}
        onDelete={setDeleteConfirm}
        emptyMessage="Belum ada data terminals"
      />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingTerminal ? 'Edit Terminal' : 'Add Terminal'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Terminal Code</label>
            <input
              type="text"
              value={formData.terminal_code}
              onChange={(e) => setFormData({ ...formData, terminal_code: e.target.value.toUpperCase() })}
              className="input-field"
              placeholder="T3"
              maxLength={5}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Terminal Name</label>
            <input
              type="text"
              value={formData.terminal_name}
              onChange={(e) => setFormData({ ...formData, terminal_name: e.target.value })}
              className="input-field"
              placeholder="Terminal 3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field resize-none"
              placeholder="International departures"
              rows={3}
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
          Apakah Anda yakin ingin menghapus terminal <strong className="text-white">{deleteConfirm?.terminal_name}</strong>?
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
