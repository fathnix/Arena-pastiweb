import { useState } from 'react'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      const data = await response.json()
      setMessage(data.message || 'Login berhasil!')
    } catch (error) {
      setMessage('Login gagal: ' + error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Arena Pasti</h1>
          <p className="text-gray-600 mt-2">Sistem Booking Lapangan Olahraga</p>
        </div>

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
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Login
          </button>
        </form>

        {message && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
            {message}
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
