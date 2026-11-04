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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-dark to-secondary bg-clip-text text-transparent mb-2">
              Arena Pasti
            </h1>
            <p className="text-gray-600">Sistem Booking Lapangan Olahraga</p>
          </div>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8">
              {user ? (
                <div className="space-y-6">
                  {/* Success State */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Berhasil!</h2>
                    <p className="text-gray-600 mb-4">Selamat datang kembali</p>
                  </div>

                  <div className="bg-gradient-to-br from-primary/5 to-primary-dark/5 border border-primary/20 rounded-xl p-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-primary/10">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Role</span>
                        <span className={`px-3 py-1 rounded-full font-medium ${
                          user.role === 'superadmin' 
                            ? 'bg-purple-100 text-purple-700'
                            : user.role === 'admin'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-primary/10 text-primary-dark'
                        }`}>
                          {user.role === 'superadmin' ? 'Superadmin' : user.role === 'admin' ? 'Admin' : 'Customer'}
                        </span>
                      </div>
                      {user.branch && (
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-gray-600">Cabang</span>
                          <span className="font-medium text-gray-900">{user.branch.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Masuk ke Akun Anda</h2>
                  
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <span>Masuk</span>
                      )}
                    </button>
                  </form>
                </>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Demo Accounts */}
            {!user && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Akun Demo</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Superadmin</span>
                    <code className="bg-white px-2 py-1 rounded text-xs text-gray-600 border border-gray-200">superadmin@arenapasti.test</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Admin</span>
                    <code className="bg-white px-2 py-1 rounded text-xs text-gray-600 border border-gray-200">admin@arenapasti.test</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Customer</span>
                    <code className="bg-white px-2 py-1 rounded text-xs text-gray-600 border border-gray-200">customer@arenapasti.test</code>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Password semua akun: <code className="bg-white px-2 py-0.5 rounded border border-gray-200">password</code></p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Fase 0 — Foundation Backend & Frontend
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
