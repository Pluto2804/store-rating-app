import { useMemo, useState } from 'react'

export function Field({ label, error, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {error ? <span className="field-error" role="alert">{error}</span> : hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

export const Alert = ({ kind = 'error', children }) =>
  children ? <div className={`alert ${kind}`} role={kind === 'error' ? 'alert' : 'status'}>{children}</div> : null

export const Stars = ({ value = 0 }) => (
  <span className="stars" style={{ '--v': value }} role="img" aria-label={`${Number(value).toFixed(1)} out of 5`}>★★★★★</span>
)

export function StarInput({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value || 0
  return (
    <div className="star-input" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={n <= shown ? 'on' : ''} disabled={disabled}
          onMouseEnter={() => setHover(n)} onFocus={() => setHover(n)} onBlur={() => setHover(0)} onClick={() => onChange(n)}>★</button>
      ))}
    </div>
  )
}

/* columns: [{ key, label, render?, filter?: 'text' | string[] }] — sorting + filtering run client-side */
export function DataTable({ columns, rows, onRowClick, empty = 'Nothing here yet.' }) {
  const [sort, setSort] = useState({ key: columns[0].key, dir: 1 })
  const [filters, setFilters] = useState({})
  const view = useMemo(() => {
    const f = Object.entries(filters).filter(([, v]) => v)
    return rows
      .filter((r) => f.every(([k, v]) => String(r[k] ?? '').toLowerCase().includes(v.toLowerCase())))
      .sort((a, b) => {
        const x = a[sort.key] ?? '', y = b[sort.key] ?? ''
        return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y))) * sort.dir
      })
  }, [rows, sort, filters])
  const toggle = (key) => setSort((s) => ({ key, dir: s.key === key ? -s.dir : 1 }))

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} aria-sort={sort.key === c.key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
                <button className="th-btn" onClick={() => toggle(c.key)}>
                  {c.label}<i>{sort.key === c.key ? (sort.dir === 1 ? '↑' : '↓') : ''}</i>
                </button>
              </th>
            ))}
          </tr>
          <tr className="filter-row">
            {columns.map((c) => (
              <th key={c.key}>
                {c.filter && (Array.isArray(c.filter)
                  ? <select aria-label={`Filter ${c.label}`} value={filters[c.key] || ''} onChange={(e) => setFilters({ ...filters, [c.key]: e.target.value })}>
                      <option value="">All</option>{c.filter.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  : <input aria-label={`Filter ${c.label}`} placeholder="Filter" value={filters[c.key] || ''} onChange={(e) => setFilters({ ...filters, [c.key]: e.target.value })} />)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {view.map((r, i) => (
            <tr key={r.id ?? i} className={onRowClick ? 'clickable' : ''} onClick={() => onRowClick?.(r)}
              tabIndex={onRowClick ? 0 : undefined} onKeyDown={(e) => e.key === 'Enter' && onRowClick?.(r)}>
              {columns.map((c) => <td key={c.key} data-label={c.label}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
          {!view.length && <tr><td colSpan={columns.length} className="empty">{empty}</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
