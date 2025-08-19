
import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Users() {
  const [list,setList]=useState([])
  const [form,setForm]=useState({})
  const [editId,setEditId]=useState(null)

  const load=()=> api('/users').then(setList)
  useEffect(()=>{ load() },[])

  const save=async (e)=>{
    e.preventDefault()
    if(editId) await api('/users/'+editId, { method:'PUT', body: JSON.stringify(form) })
    else await api('/users', { method:'POST', body: JSON.stringify(form) })
    setForm({}); setEditId(null); load()
  }
  const del=async id=>{ if(confirm('Delete?')){ await api('/users/'+id,{method:'DELETE'}); load() } }
  const startEdit=(row)=>{ setForm(row); setEditId(row.id) }

  return (<div>
    <h1>Users</h1>
    <form onSubmit={save} style={display:'grid', gap:'8px', maxWidth:'600px'}>
      <label>Name<input value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})}/></label>
<label>Email<input value={form.email||""} onChange={e=>setForm({...form,email:e.target.value})}/></label>
<label>Role<input value={form.role||""} onChange={e=>setForm({...form,role:e.target.value})}/></label>
<label>Password (set/replace)<input value={form.password||""} onChange={e=>setForm({...form,password:e.target.value})}/></label>
      <button>{editId ? 'Update' : 'Create'}</button>
    </form>
    <table border="1" cellPadding="6" style={marginTop:'16px', width:'100%'}>
      <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Password (set/replace)</th><th>Actions</th></tr></thead>
      <tbody>
        {list.map(row=> <tr key={row.id}>
          <td>{row.id}</td>
          <td>{row.name}</td><td>{row.email}</td><td>{row.role}</td><td>{row.password}</td>
          <td>
            <button onClick={()=>startEdit(row)}>Edit</button>
            <button onClick={()=>del(row.id)}>Delete</button>
          </td>
        </tr>)}
      </tbody>
    </table>
  </div>)
}
