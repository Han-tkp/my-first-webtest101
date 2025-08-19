
import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function MachineTypes() {
  const [list,setList]=useState([])
  const [form,setForm]=useState({})
  const [editId,setEditId]=useState(null)

  const load=()=> api('/machine-types').then(setList)
  useEffect(()=>{ load() },[])

  const save=async (e)=>{
    e.preventDefault()
    if(editId) await api('/machine-types/'+editId, { method:'PUT', body: JSON.stringify(form) })
    else await api('/machine-types', { method:'POST', body: JSON.stringify(form) })
    setForm({}); setEditId(null); load()
  }
  const del=async id=>{ if(confirm('Delete?')){ await api('/machine-types/'+id,{method:'DELETE'}); load() } }
  const startEdit=(row)=>{ setForm(row); setEditId(row.id) }

  return (<div>
    <h1>MachineTypes</h1>
    <form onSubmit={save} style={display:'grid', gap:'8px', maxWidth:'600px'}>
      <label>Code<input value={form.code||""} onChange={e=>setForm({...form,code:e.target.value})}/></label>
<label>Name<input value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <button>{editId ? 'Update' : 'Create'}</button>
    </form>
    <table border="1" cellPadding="6" style={marginTop:'16px', width:'100%'}>
      <thead><tr><th>ID</th><th>Code</th><th>Name</th><th>Actions</th></tr></thead>
      <tbody>
        {list.map(row=> <tr key={row.id}>
          <td>{row.id}</td>
          <td>{row.code}</td><td>{row.name}</td>
          <td>
            <button onClick={()=>startEdit(row)}>Edit</button>
            <button onClick={()=>del(row.id)}>Delete</button>
          </td>
        </tr>)}
      </tbody>
    </table>
  </div>)
}
