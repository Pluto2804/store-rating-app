const rules = {
  name: (v) => (v.length < 20 || v.length > 60 ? 'Name must be 20–60 characters' : ''),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address'),
  address: (v) => (v.length > 400 ? 'Address must be 400 characters or fewer' : ''),
  password: (v) =>
    v.length < 8 || v.length > 16 ? 'Password must be 8–16 characters'
    : !/[A-Z]/.test(v) ? 'Include at least one uppercase letter'
    : !/[^A-Za-z0-9]/.test(v) ? 'Include at least one special character' : '',
}
export const validate = (values, keys) =>
  Object.fromEntries(keys.map((k) => [k, rules[k](values[k] ?? '')]).filter(([, m]) => m))
