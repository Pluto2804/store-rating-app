import { useEffect, useState } from 'react'
import { api } from '../api'
import { Alert, DataTable, Stars } from '../ui'

export default function Owner() {
  const [d, setD] = useState(null), [err, setErr] = useState('')
  useEffect(() => { api('/owner/store').then(setD).catch((e) => setErr(e.message)) }, [])
  const avg = d ? Number(d.store.averageRating) : 0
  return (
    <>
      <header className="page-head"><h1>{d?.store.name ?? 'My store'}</h1><p className="muted">{d?.store.address ?? 'See who has rated your store.'}</p></header>
      <Alert>{err}</Alert>
      {d && (
        <>
          <div className="hero-rating">
            <div className="big">{avg ? avg.toFixed(1) : '—'}</div>
            <div><Stars value={avg} /><p className="muted">{Number(d.store.ratingCount)} rating{Number(d.store.ratingCount) === 1 ? '' : 's'}</p></div>
          </div>
          <h2 className="section">Who rated your store</h2>
          <DataTable rows={d.raters.map((r) => ({ ...r, date: new Date(r.updated_at).toLocaleDateString() }))} empty="No ratings yet. They will show up here."
            columns={[
              { key: 'name', label: 'Name', filter: 'text' }, { key: 'email', label: 'Email', filter: 'text' },
              { key: 'rating', label: 'Rating', render: (r) => <><Stars value={r.rating} /> <span className="num">{r.rating}</span></> },
              { key: 'date', label: 'Updated' },
            ]} />
        </>
      )}
    </>
  )
}
