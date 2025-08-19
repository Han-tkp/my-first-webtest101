
import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Machines(){
  const [list,setList]=useState([])
  const [types,setTypes]=useState([])
  const [form,setForm]=useState({})
  const [editId,setEditId]=useState(null)
  const load=()=> api('/machines').then(setList)
  useEffect(()=>{ load(); api('/machine-types').then(setTypes) },[])
  const save=async (e)=>{
    e.preventDefault()
    const body = JSON.stringify(form)
    if(editId) await api('/machines/'+editId, { method:'PUT', body })
    else await api('/machines', { method:'POST', body })
    setForm({}); setEditId(null); load()
  }
  const del=async id=>{ if(confirm('Delete?')){ await api('/machines/'+id,{method:'DELETE'}); load() } }
  const startEdit=row=>{ setForm({ ...row, MachineTypeId: row.MachineTypeId || row.MachineType?.id }); setEditId(row.id) }
  return <div>
    <h1>Machines</h1>
    <form onSubmit={save} style={{display:'grid', gap:'8px', maxWidth:'700px'}}>
      <label>Code<input value={form.code||''} onChange={e=>setForm({...form,code:e.target.value})}/></label>
      <label>Serial<input value={form.serial||''} onChange={e=>setForm({...form,serial:e.target.value})}/></label>
      <label>Status
        <select value={form.status||'idle'} onChange={e=>setForm({...form,status:e.target.value})}>
          <option value="idle">idle</option>
          <option value="borrowed">borrowed</option>
          <option value="repair">repair</option>
          <option value="retired">retired</option>
        </select>
      </label>
      <label>Machine Type
        <select value={form.MachineTypeId||''} onChange={e=>setForm({...form,MachineTypeId:Number(e.target.value)})}>
          <option value="">-- choose --</option>
          {types.map(t=> <option key={t.id} value={t.id}>{t.code} - {t.name}</option>)}
        </select>
      </label>
      <label>Location<input value={form.location||''} onChange={e=>setForm({...form,location:e.target.value})}/></label>
      <label>Price<input value={form.price||''} onChange={e=>setForm({...form,price:e.target.value})}/></label>
      <button>{editId?'Update':'Create'}</button>
    </form>

    <table border="1" cellPadding="6" style={{marginTop:'16px', width:'100%'}}>
      <thead><tr><th>ID</th><th>Code</th><th>Serial</th><th>Status</th><th>Type</th><th>Location</th><th>Price</th><th>Actions</th></tr></thead>
      <tbody>
        {list.map(row=> <tr key={row.id}>
          <td>{row.id}</td>
          <td>{row.code}</td>
          <td>{row.serial}</td>
          <td>{row.status}</td>
          <td>{row.MachineType?.name}</td>
          <td>{row.location}</td>
          <td>{row.price}</td>
          <td>
            <button onClick={()=>startEdit(row)}>Edit</button>
            <button onClick={()=>del(row.id)}>Delete</button>
          </td>
        </tr>)}
      </tbody>
    </table>
  </div>
}
