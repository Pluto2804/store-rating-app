import { useCallback, useEffect, useState } from 'react'
import { api, endpoints } from '../api'
import { Alert, DataTable, Field, Stars } from '../ui'
import { validate } from '../validators'

const useLoad = (fn) => {
  const [state, setState] = useState({ data: null, error: '' })
  const load = useCallback(() => {
    fn().then((data) => setState({ data, error: '' })).catch((e) => setState({ data: null, error: e.message }))
  }, [])
  useEffect(load, [load])
  return { ...state, reload: load }
}

export function AdminHome() {
  const { data, error } = useLoad(async () => {
    const [stats, users, stores] = await Promise.allSettled([endpoints.stats(), api('/admin/users'), endpoints.adminStores()])
    const s = stats.value
    return { users: s?.users ?? users.value?.users.length, stores: s?.stores ?? stores.value?.stores.length, ratings: s?.ratings }
  })
  return (
    <>
      <header className="page-head"><h1>Overview</h1><p className="muted">Everything on the platform, at a glance.</p></header>
      <Alert>{error}</Alert>
      <dl className="ledger">
        {[['Users', data?.users], ['Stores', data?.stores], ['Ratings submitted', data?.ratings]].map(([k, v]) => (
          <div key={k}><dd>{v ?? '—'}</dd><dt>{k}</dt></div>
        ))}
      </dl>
    </>
  )
}

function UserForm({ onDone }) {
  const [v, setV] = useState({ name: '', email: '', address: '', password: '', role: 'user' })
  const [errs, setErrs] = useState({}), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })
  async function submit(e) {
    e.preventDefault(); setErr('')
    const found = validate(v, ['name', 'email', 'address', 'password']); setErrs(found)
    if (Object.keys(found).length) return
    setBusy(true)
    try { await api('/admin/users', { method: 'POST', body: v }); onDone() }
    catch (x) { setErr(x.message) } finally { setBusy(false) }
  }
  return (
    <form className="panel grid-form" onSubmit={submit} noValidate>
      <Alert>{err}</Alert>
      <Field label="Full name" error={errs.name} hint="20–60 characters"><input value={v.name} onChange={set('name')} /></Field>
      <Field label="Email" error={errs.email}><input type="email" value={v.email} onChange={set('email')} /></Field>
      <Field label="Password" error={errs.password} hint="8–16 characters, one capital, one symbol"><input type="password" value={v.password} onChange={set('password')} autoComplete="new-password" /></Field>
      <Field label="Role"><select value={v.role} onChange={set('role')}><option value="user">Normal user</option><option value="owner">Store owner</option><option value="admin">Administrator</option></select></Field>
      <div className="span2"><Field label="Address" error={errs.address}><textarea rows="2" value={v.address} onChange={set('address')} /></Field></div>
      <div className="span2"><button className="btn" disabled={busy}>{busy ? 'Adding…' : 'Add user'}</button></div>
    </form>
  )
}

const roleLabel = { admin: 'Administrator', user: 'Normal user', owner: 'Store owner' }

export function AdminUsers() {
  const { data, error, reload } = useLoad(async () => {
    const [{ users }, stores] = await Promise.all([api('/admin/users'), endpoints.adminStores().catch(() => ({ stores: [] }))])
    return users.map((u) => ({ ...u, roleName: roleLabel[u.role], rating: Number(stores.stores.find((s) => s.ownerId === u.id)?.averageRating) || 0 }))
  })
  const [adding, setAdding] = useState(false), [open, setOpen] = useState(null)
  return (
    <>
      <header className="page-head split">
        <div><h1>Users</h1><p className="muted">Select a row to see full details.</p></div>
        <button className="btn" onClick={() => setAdding(!adding)}>{adding ? 'Close' : 'Add user'}</button>
      </header>
      {adding && <UserForm onDone={() => { setAdding(false); reload() }} />}
      <Alert>{error}</Alert>
      {data && (
        <DataTable rows={data} onRowClick={setOpen} empty="No users match these filters." columns={[
          { key: 'name', label: 'Name', filter: 'text' }, { key: 'email', label: 'Email', filter: 'text' },
          { key: 'address', label: 'Address', filter: 'text' },
          { key: 'roleName', label: 'Role', filter: Object.values(roleLabel), render: (r) => <span className={`badge ${r.role}`}>{r.roleName}</span> },
        ]} />
      )}
      {open && (
        <div className="scrim" onClick={() => setOpen(null)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="User details">
            <h2>{open.name}</h2>
            <span className={`badge ${open.role}`}>{open.roleName}</span>
            <dl className="details">
              <dt>Email</dt><dd>{open.email}</dd>
              <dt>Address</dt><dd>{open.address}</dd>
              {open.role === 'owner' && <><dt>Store rating</dt><dd>{open.rating ? <><Stars value={open.rating} /> {open.rating.toFixed(1)}</> : 'No ratings yet'}</dd></>}
            </dl>
            <button className="btn ghost" onClick={() => setOpen(null)}>Close</button>
          </aside>
        </div>
      )}
    </>
  )
}

function StoreForm({ onDone }) {
  const [owners, setOwners] = useState([])
  const [v, setV] = useState({ name: '', email: '', address: '', ownerId: '' })
  const [errs, setErrs] = useState({}), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => { api('/admin/users?role=owner').then((d) => setOwners(d.users)).catch((e) => setErr(e.message)) }, [])
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })
  async function submit(e) {
    e.preventDefault(); setErr('')
    const found = validate(v, ['email', 'address'])
    if (!v.name.trim()) found.name = 'Enter the store name'
    if (!v.ownerId) found.ownerId = 'Choose an owner'
    setErrs(found); if (Object.keys(found).length) return
    setBusy(true)
    try { await api('/admin/stores', { method: 'POST', body: { ...v, ownerId: Number(v.ownerId) } }); onDone() }
    catch (x) { setErr(x.message) } finally { setBusy(false) }
  }
  return (
    <form className="panel grid-form" onSubmit={submit} noValidate>
      <Alert>{err}</Alert>
      <Field label="Store name" error={errs.name}><input value={v.name} onChange={set('name')} /></Field>
      <Field label="Store email" error={errs.email}><input type="email" value={v.email} onChange={set('email')} /></Field>
      <Field label="Owner" error={errs.ownerId} hint={owners.length ? '' : 'Add a user with the Store owner role first'}>
        <select value={v.ownerId} onChange={set('ownerId')}><option value="">Choose an owner</option>{owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
      </Field>
      <div className="span2"><Field label="Address" error={errs.address}><textarea rows="2" value={v.address} onChange={set('address')} /></Field></div>
      <div className="span2"><button className="btn" disabled={busy}>{busy ? 'Adding…' : 'Add store'}</button></div>
    </form>
  )
}

export function AdminStores() {
  const { data, error, reload } = useLoad(async () => (await endpoints.adminStores()).stores.map((s) => ({ ...s, averageRating: Number(s.averageRating) })))
  const [adding, setAdding] = useState(false)
  return (
    <>
      <header className="page-head split">
        <div><h1>Stores</h1><p className="muted">Every registered store and its overall rating.</p></div>
        <button className="btn" onClick={() => setAdding(!adding)}>{adding ? 'Close' : 'Add store'}</button>
      </header>
      {adding && <StoreForm onDone={() => { setAdding(false); reload() }} />}
      <Alert>{error}</Alert>
      {data && (
        <DataTable rows={data} empty="No stores match these filters." columns={[
          { key: 'name', label: 'Name', filter: 'text' }, { key: 'email', label: 'Email', filter: 'text' },
          { key: 'address', label: 'Address', filter: 'text' },
          { key: 'averageRating', label: 'Rating', render: (r) => (r.averageRating ? <><Stars value={r.averageRating} /> <span className="num">{r.averageRating.toFixed(1)}</span></> : <span className="muted">Not rated</span>) },
        ]} />
      )}
    </>
  )
}
