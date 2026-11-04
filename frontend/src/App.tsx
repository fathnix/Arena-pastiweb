import { useState } from 'react'
import { authApi } from './features/auth/authApi'
import type { User } from './lib/types'

function App() {
  const [email, setEmail] = useState('customer@arenapasti.test')
  const [password, setPassword] = useState('password')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setUser(null)

    try {
      const loggedInUser = await authApi.login({ email, password })
      setUser(loggedInUser)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Login gagal. Periksa email dan password.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await authApi.logout().catch(() => undefined)
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Arena Pasti</h1>
          <p className="text-gray-600 mt-2">Sistem Booking Lapangan Olahraga</p>
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-green-800">Login berhasil</p>
              <p className="text-sm text-green-700 mt-1">
                {user.name} — {user.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-secondary hover:bg-secondary-light text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo accounts:</p>
          <p className="mt-1">superadmin@arenapasti.test / password</p>
          <p>admin@arenapasti.test / password</p>
          <p>customer@arenapasti.test / password</p>
        </div>
      </div>
    </div>
  )
}

export default App
