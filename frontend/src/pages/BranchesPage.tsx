import { useEffect, useState } from 'react';
import api from '../lib/api';
import Layout from '../components/Layout';

interface Branch {
  id: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  timezone?: string;
  is_active: boolean;
  fields_count: number;
  users_count: number;
}

const emptyForm = {
  name: '',
  code: '',
  address: '',
  phone: '',
  timezone: 'Asia/Jakarta',
  is_active: true,
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data } = await api.get('/branches/all');
      setBranches(data);
    } catch {
      setError('Gagal memuat cabang');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (branch: Branch) => {
    setEditing(branch);
    setForm({
      name: branch.name,
      code: branch.code,
      address: branch.address ?? '',
      phone: branch.phone ?? '',
      timezone: branch.timezone ?? 'Asia/Jakarta',
      is_active: branch.is_active,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/branches/${editing.id}`, form);
      } else {
        await api.post('/branches', form);
      }
      setShowForm(false);
      fetchBranches();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan cabang');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (branch: Branch) => {
    if (!confirm(`Hapus cabang ${branch.name}?`)) return;
    try {
      await api.delete(`/branches/${branch.id}`);
      fetchBranches();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus cabang');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manajemen Cabang</h1>
            <p className="text-slate-600 mt-2">Kelola semua cabang Arena Pasti</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Tambah Cabang
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

        {loading ? (
          <div className="text-center py-12 text-slate-500">Memuat...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {branches.map((branch) => (
              <div key={branch.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{branch.name}</h3>
                    <p className="text-sm font-mono text-slate-500">Kode: {branch.code}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${branch.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {branch.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-slate-600 mb-4">
                  <p>{branch.address || 'Alamat belum diisi'}</p>
                  <p>{branch.phone || 'Telepon belum diisi'}</p>
                  <p className="text-xs text-slate-400">{branch.timezone}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 py-3 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500">Lapangan</p>
                    <p className="text-xl font-bold text-slate-900">{branch.fields_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Pengguna</p>
                    <p className="text-xl font-bold text-slate-900">{branch.users_count}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEdit(branch)}
                    className="flex-1 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 text-sm font-medium transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(branch)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editing ? 'Edit Cabang' : 'Tambah Cabang'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kode *</label>
                <input
                  required
                  maxLength={10}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telepon</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Aktif
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}
