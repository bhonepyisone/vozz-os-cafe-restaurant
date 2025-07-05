import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { logIn } = useAuth()
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await logIn(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError('Failed to login: ' + err.message)
    }
  }

  return (
    <div className="login-container">
      <h1>Vozz OS Login</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}
