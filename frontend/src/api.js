const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && token && !path.startsWith('/auth/')) {
      localStorage.clear()
      location.assign('/login')
    }
    const err = new Error(data.error || 'Something went wrong')
    err.fields = data.details?.fieldErrors
    throw err
  }
  return data
}

/* Endpoints the current backend does not expose yet (see README):
   GET /admin/stats  -> { users, stores, ratings }
   GET /admin/stores -> { stores: [{ id, name, email, address, averageRating }] }
   PATCH /auth/password { currentPassword, newPassword } */
export const endpoints = {
  stats: () => api('/admin/stats'),
  adminStores: () => api('/admin/stores'),
  changePassword: (body) => api('/auth/password', { method: 'PATCH', body }),
}
