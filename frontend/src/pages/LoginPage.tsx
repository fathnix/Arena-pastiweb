import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900">Arena Pasti</h1>
          <p className="mt-2 text-slate-600">Sistem Booking Lapangan</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Login</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Belum punya akun?{' '}
              <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Daftar sekarang
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Akun Demo (klik untuk isi)
            </p>
            <div className="space-y-2">
              {[
                { label: 'Superadmin', email: 'admin@gmail.com' },
                { label: 'Admin / Kasir', email: 'kasir@gmail.com' },
                { label: 'Customer', email: 'cust@gmail.com' },
              ].map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword('password');
                    setError('');
                  }}
                  className="w-full flex items-center justify-between gap-2 text-left text-xs bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg px-3 py-2 transition"
                >
                  <span className="font-medium text-slate-700">{account.label}</span>
                  <span className="font-mono text-slate-500">{account.email}</span>
                </button>
              ))}
              <p className="text-xs text-slate-400 pt-1">Semua akun menggunakan password: password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
