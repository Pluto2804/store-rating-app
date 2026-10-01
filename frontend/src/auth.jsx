import { createContext, useContext, useState } from 'react'
import { api } from './api'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)
export const home = { admin: '/admin', user: '/stores', owner: '/owner' }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  async function login(email, password) {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }
  function logout() { localStorage.clear(); setUser(null) }
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>
}
