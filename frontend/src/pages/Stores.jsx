import { useEffect, useState } from 'react'
import { api } from '../api'
import { Alert, Stars, StarInput } from '../ui'

export default function Stores() {
  const [stores, setStores] = useState([]), [q, setQ] = useState(''), [sort, setSort] = useState('name')
  const [err, setErr] = useState(''), [saving, setSaving] = useState(null), [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      api(`/stores?search=${encodeURIComponent(q)}`)
        .then((d) => { setStores(d.stores.map((s) => ({ ...s, averageRating: Number(s.averageRating) }))); setErr('') })
        .catch((e) => setErr(e.message)).finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  async function rate(store, rating) {
    setSaving(store.id); setErr('')
    try {
      await api(`/stores/${store.id}/rating`, { method: 'POST', body: { rating } })
      const d = await api(`/stores?search=${encodeURIComponent(q)}`)
      setStores(d.stores.map((s) => ({ ...s, averageRating: Number(s.averageRating) })))
    } catch (e) { setErr(e.message) } finally { setSaving(null) }
  }

  const sorted = [...stores].sort((a, b) =>
    sort === 'rating' ? b.averageRating - a.averageRating : a[sort].localeCompare(b[sort]))

  return (
    <>
      <header className="page-head"><h1>Stores</h1><p className="muted">Find a store and give it a rating. You can change it whenever you like.</p></header>
      <div className="toolbar">
        <input type="search" placeholder="Search by name or address" aria-label="Search stores" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Sort stores" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="name">Name A–Z</option><option value="address">Address A–Z</option><option value="rating">Highest rated</option>
        </select>
      </div>
      <Alert>{err}</Alert>
      <ul className="stores">
        {sorted.map((s) => (
          <li key={s.id}>
            <div className="store-info">
              <h2>{s.name}</h2><p className="muted">{s.address}</p>
              <p className="overall"><Stars value={s.averageRating} /> <span className="num">{s.averageRating ? s.averageRating.toFixed(1) : 'Not rated'}</span></p>
            </div>
            <div className="store-rate">
              <span className="field-label">{s.myRating ? `Your rating: ${s.myRating}` : 'You haven’t rated this yet'}</span>
              <StarInput value={s.myRating} disabled={saving === s.id} onChange={(n) => rate(s, n)} />
              <span className="field-hint">{saving === s.id ? 'Saving…' : s.myRating ? 'Click a star to change it' : 'Click a star to rate'}</span>
            </div>
          </li>
        ))}
      </ul>
      {!loading && !sorted.length && <p className="empty">{q ? `No stores match “${q}”.` : 'No stores have been added yet.'}</p>}
    </>
  )
}
