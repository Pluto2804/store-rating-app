import { Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { home, useAuth } from './auth'
import { Login, Signup } from './pages/Auth'
import { AdminHome, AdminUsers, AdminStores } from './pages/Admin'
import Stores from './pages/Stores'
import Owner from './pages/Owner'
import Password from './pages/Password'

const nav = {
  admin: [['/admin', 'Overview'], ['/admin/users', 'Users'], ['/admin/stores', 'Stores']],
  user: [['/stores', 'Stores']],
  owner: [['/owner', 'My store']],
}

function Shell({ role }) {
  const { user, logout } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={home[user.role]} replace />
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">Shelfrate</div>
        <nav aria-label="Main">
          {[...nav[role], ['/password', 'Password']].map(([to, label]) => (
            <NavLink key={to} to={to} end>{label}</NavLink>
          ))}
        </nav>
        <div className="me">
          <strong>{user.name}</strong>
          <span>{{ admin: 'Administrator', user: 'Shopper', owner: 'Store owner' }[role]}</span>
          <button className="btn ghost" onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  )
}

function Guarded({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to={home[user.role]} replace /> : children
}

function PasswordShell() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Shell role={user.role} />
}

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={<Guarded><Login /></Guarded>} />
      <Route path="/signup" element={<Guarded><Signup /></Guarded>} />
      <Route element={<Shell role="admin" />}>
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/stores" element={<AdminStores />} />
      </Route>
      <Route element={<Shell role="user" />}><Route path="/stores" element={<Stores />} /></Route>
      <Route element={<Shell role="owner" />}><Route path="/owner" element={<Owner />} /></Route>
      <Route element={<PasswordShell />}><Route path="/password" element={<Password />} /></Route>
      <Route path="*" element={<Navigate to={user ? home[user.role] : '/login'} replace />} />
    </Routes>
  )
}
