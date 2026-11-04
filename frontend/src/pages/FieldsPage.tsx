import { useEffect, useState } from 'react';
import api from '../lib/api';
import Layout from '../components/Layout';

interface Field {
  id: number;
  name: string;
  type?: string;
  capacity?: number;
  base_hourly_rate: number;
  description?: string;
  open_time?: string;
  close_time?: string;
  status: string;
  branch: { id: number; name: string };
}

const emptyForm = {
  name: '',
  type: 'Vinyl',
  capacity: 14,
  base_hourly_rate: 150000,
  description: '',
  open_time: '08:00',
  close_time: '23:00',
  status: 'active',
};

export default function FieldsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Field | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const { data } = await api.get('/fields', { params: { include_inactive: 1 } });
      setFields(data.data);
    } catch {
      setError('Gagal memuat lapangan');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (field: Field) => {
    setEditing(field);
    setForm({
      name: field.name,
      type: field.type ?? '',
      capacity: field.capacity ?? 0,
      base_hourly_rate: field.base_hourly_rate,
      description: field.description ?? '',
      open_time: field.open_time ?? '08:00',
      close_time: field.close_time ?? '23:00',
      status: field.status,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity) || null,
        base_hourly_rate: Number(form.base_hourly_rate),
      };
      if (editing) {
        await api.put(`/fields/${editing.id}`, payload);
      } else {
        await api.post('/fields', payload);
      }
      setShowForm(false);
      fetchFields();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan lapangan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (field: Field) => {
    if (!confirm(`Hapus/nonaktifkan ${field.name}?`)) return;
    try {
      const { data } = await api.delete(`/fields/${field.id}`);
      alert(data.message);
      fetchFields();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus lapangan');
    }
  };

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manajemen Lapangan</h1>
            <p className="text-slate-600 mt-2">Kelola lapangan dan harga sewa</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Tambah Lapangan
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

        {loading ? (
          <div className="text-center py-12 text-slate-500">Memuat...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => (
              <div key={field.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-24 bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{field.name}</span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{field.name}</h3>
                      <p className="text-sm text-slate-600">{field.type || '-'} • {field.capacity || '-'} orang</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${field.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {field.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{field.description || 'Tidak ada deskripsi'}</p>
                  <div className="flex justify-between items-center py-2 border-t border-slate-100">
                    <span className="text-sm text-slate-500">Harga / jam</span>
                    <span className="font-bold text-emerald-600">{formatRupiah(field.base_hourly_rate)}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openEdit(field)}
                      className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 text-sm font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(field)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editing ? 'Edit Lapangan' : 'Tambah Lapangan'}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipe</label>
                  <input
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kapasitas</label>
                  <input
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga / jam (Rp) *</label>
                <input
                  required
                  type="number"
                  min={0}
                  step={1000}
                  value={form.base_hourly_rate}
                  onChange={(e) => setForm({ ...form, base_hourly_rate: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Buka</label>
                  <input
                    type="time"
                    value={form.open_time}
                    onChange={(e) => setForm({ ...form, open_time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tutup</label>
                  <input
                    type="time"
                    value={form.close_time}
                    onChange={(e) => setForm({ ...form, close_time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.status === 'active'}
                  onChange={(e) => setForm({ ...form, status: e.target.checked ? 'active' : 'inactive' })}
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
