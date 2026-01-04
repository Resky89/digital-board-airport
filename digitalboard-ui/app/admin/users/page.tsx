'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminUsersApi } from '@/app/lib/api';
import { User, UserFormData } from '@/app/types';
import DataTable from '@/app/components/DataTable';
import Modal from '@/app/components/Modal';
import Toast from '@/app/components/Toast';

const initialFormData: UserFormData = {
  name: '',
  email: '',
  password: '',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await adminUsersApi.list({ per_page: '100' });
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch {
      setToast({ message: 'Gagal memuat data users', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, password: '' });
    } else {
      setEditingUser(null);
      setFormData(initialFormData);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: Partial<UserFormData> = { name: formData.name };
      
      if (!editingUser) {
        payload.email = formData.email;
        payload.password = formData.password;
      } else if (formData.password) {
        payload.password = formData.password;
      }

      let response;
      if (editingUser) {
        response = await adminUsersApi.update(editingUser.id, payload);
      } else {
        response = await adminUsersApi.create(payload);
      }

      if (response.success) {
        setToast({ message: `User berhasil ${editingUser ? 'diupdate' : 'ditambahkan'}`, type: 'success' });
        handleCloseModal();
        fetchUsers();
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
      const response = await adminUsersApi.delete(deleteConfirm.id);
      if (response.success) {
        setToast({ message: 'User berhasil dihapus', type: 'success' });
        fetchUsers();
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
    { key: 'name', label: 'Name', render: (u: User) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-black font-semibold text-sm">
          {u.name.charAt(0).toUpperCase()}
        </div>
        <span>{u.name}</span>
      </div>
    )},
    { key: 'email', label: 'Email' },
    { key: 'created_at', label: 'Joined', render: (u: User) => new Date(u.created_at).toLocaleDateString('id-ID') },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
          <p className="text-white/60">Kelola user admin</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        onEdit={handleOpenModal}
        onDelete={setDeleteConfirm}
        emptyMessage="Belum ada data users"
      />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingUser ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Admin Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              placeholder="admin@example.com"
              required={!editingUser}
              disabled={!!editingUser}
            />
            {editingUser && (
              <p className="text-xs text-white/50 mt-1">Email tidak dapat diubah</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Password {editingUser && <span className="text-white/50">(Kosongkan jika tidak ingin mengubah)</span>}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field"
              placeholder="••••••••"
              required={!editingUser}
              minLength={8}
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
          Apakah Anda yakin ingin menghapus user <strong className="text-white">{deleteConfirm?.name}</strong>?
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
