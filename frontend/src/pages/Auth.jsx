import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { home, useAuth } from '../auth'
import { Alert, Field } from '../ui'
import { validate } from '../validators'

function Frame({ title, sub, children, foot }) {
  return (
    <div className="auth">
      <section className="auth-pitch">
        <div className="brand">Shelfrate</div>
        <h1>Tell your neighbourhood which shops are worth the walk.</h1>
        <p>Rate stores from 1 to 5, change your mind any time, and see how each shop is doing.</p>
      </section>
      <section className="auth-form">
        <h2>{title}</h2><p className="muted">{sub}</p>
        {children}<p className="muted foot">{foot}</p>
      </section>
    </div>
  )
}

export function Login() {
  const { login } = useAuth(), nav = useNavigate()
  const [v, setV] = useState({ email: '', password: '' }), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true)
    try { const u = await login(v.email, v.password); nav(home[u.role]) }
    catch (x) { setErr(x.message) } finally { setBusy(false) }
  }
  return (
    <Frame title="Log in" sub="Welcome back." foot={<>New here? <Link to="/signup">Create an account</Link></>}>
      <form onSubmit={submit} noValidate>
        <Alert>{err}</Alert>
        <Field label="Email"><input type="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} required /></Field>
        <Field label="Password"><input type="password" autoComplete="current-password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} required /></Field>
        <button className="btn" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
    </Frame>
  )
}

export function Signup() {
  const nav = useNavigate()
  const [v, setV] = useState({ name: '', email: '', address: '', password: '' })
  const [errs, setErrs] = useState({}), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })
  async function submit(e) {
    e.preventDefault(); setErr('')
    const found = validate(v, ['name', 'email', 'address', 'password']); setErrs(found)
    if (Object.keys(found).length) return
    setBusy(true)
    try { await api('/auth/signup', { method: 'POST', body: v }); nav('/login') }
    catch (x) { setErr(x.message) } finally { setBusy(false) }
  }
  return (
    <Frame title="Create your account" sub="Takes under a minute." foot={<>Already registered? <Link to="/login">Log in</Link></>}>
      <form onSubmit={submit} noValidate>
        <Alert>{err}</Alert>
        <Field label="Full name" error={errs.name} hint={`${v.name.length}/60 · at least 20 characters`}><input value={v.name} onChange={set('name')} autoComplete="name" /></Field>
        <Field label="Email" error={errs.email}><input type="email" value={v.email} onChange={set('email')} autoComplete="email" /></Field>
        <Field label="Address" error={errs.address} hint={`${v.address.length}/400`}><textarea rows="2" value={v.address} onChange={set('address')} /></Field>
        <Field label="Password" error={errs.password} hint="8–16 characters, one capital letter, one symbol"><input type="password" value={v.password} onChange={set('password')} autoComplete="new-password" /></Field>
        <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
    </Frame>
  )
}
