import { useState } from 'react'
import { endpoints } from '../api'
import { Alert, Field } from '../ui'
import { validate } from '../validators'

export default function Password() {
  const [v, setV] = useState({ currentPassword: '', password: '', confirm: '' })
  const [errs, setErrs] = useState({}), [msg, setMsg] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })
  async function submit(e) {
    e.preventDefault(); setErr(''); setMsg('')
    const found = validate(v, ['password'])
    if (!v.currentPassword) found.currentPassword = 'Enter your current password'
    if (v.confirm !== v.password) found.confirm = 'Passwords don’t match'
    setErrs(found); if (Object.keys(found).length) return
    setBusy(true)
    try {
      await endpoints.changePassword({ currentPassword: v.currentPassword, newPassword: v.password })
      setMsg('Password updated.'); setV({ currentPassword: '', password: '', confirm: '' })
    } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }
  return (
    <>
      <header className="page-head"><h1>Password</h1><p className="muted">Choose a new password for your account.</p></header>
      <form className="panel narrow" onSubmit={submit} noValidate>
        <Alert>{err}</Alert><Alert kind="ok">{msg}</Alert>
        <Field label="Current password" error={errs.currentPassword}><input type="password" value={v.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" /></Field>
        <Field label="New password" error={errs.password} hint="8–16 characters, one capital, one symbol"><input type="password" value={v.password} onChange={set('password')} autoComplete="new-password" /></Field>
        <Field label="Confirm new password" error={errs.confirm}><input type="password" value={v.confirm} onChange={set('confirm')} autoComplete="new-password" /></Field>
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Update password'}</button>
      </form>
    </>
  )
}
