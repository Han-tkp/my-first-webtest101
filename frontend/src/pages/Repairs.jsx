
import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Repairs() {
  const [list,setList]=useState([])
  const [form,setForm]=useState({})
  const [editId,setEditId]=useState(null)

  const load=()=> api('/repairs').then(setList)
  useEffect(()=>{ load() },[])

  const save=async (e)=>{
    e.preventDefault()
    if(editId) await api('/repairs/'+editId, { method:'PUT', body: JSON.stringify(form) })
    else await api('/repairs', { method:'POST', body: JSON.stringify(form) })
    setForm({}); setEditId(null); load()
  }
  const del=async id=>{ if(confirm('Delete?')){ await api('/repairs/'+id,{method:'DELETE'}); load() } }
  const startEdit=(row)=>{ setForm(row); setEditId(row.id) }

  return (<div>
    <h1>Repairs</h1>
    <form onSubmit={save} style={display:'grid', gap:'8px', maxWidth:'600px'}>
      <label>MachineId<input value={form.MachineId||""} onChange={e=>setForm({...form,MachineId:e.target.value})}/></label>
<label>CreatedBy(UserId)<input value={form.createdById||""} onChange={e=>setForm({...form,createdById:e.target.value})}/></label>
<label>Status(queued/in_progress/done)<input value={form.status||""} onChange={e=>setForm({...form,status:e.target.value})}/></label>
<label>Note<input value={form.note||""} onChange={e=>setForm({...form,note:e.target.value})}/></label>
      <button>{editId ? 'Update' : 'Create'}</button>
    </form>
    <table border="1" cellPadding="6" style={marginTop:'16px', width:'100%'}>
      <thead><tr><th>ID</th><th>MachineId</th><th>CreatedBy(UserId)</th><th>Status(queued/in_progress/done)</th><th>Note</th><th>Actions</th></tr></thead>
      <tbody>
        {list.map(row=> <tr key={row.id}>
          <td>{row.id}</td>
          <td>{row.MachineId}</td><td>{row.createdById}</td><td>{row.status}</td><td>{row.note}</td>
          <td>
            <button onClick={()=>startEdit(row)}>Edit</button>
            <button onClick={()=>del(row.id)}>Delete</button>
          </td>
        </tr>)}
      </tbody>
    </table>
  </div>)
}
