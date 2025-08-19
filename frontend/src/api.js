
export const api = async (path, options={}) => {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', ...(options.headers||{}) }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch('/api' + path, { ...options, headers })
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed')
  return res.json()
}
