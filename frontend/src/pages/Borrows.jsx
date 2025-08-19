
import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Borrows() {
  const [list,setList]=useState([])
  const [form,setForm]=useState({})
  const [editId,setEditId]=useState(null)

  const load=()=> api('/borrows').then(setList)
  useEffect(()=>{ load() },[])

  const save=async (e)=>{
    e.preventDefault()
    if(editId) await api('/borrows/'+editId, { method:'PUT', body: JSON.stringify(form) })
    else await api('/borrows', { method:'POST', body: JSON.stringify(form) })
    setForm({}); setEditId(null); load()
  }
  const del=async id=>{ if(confirm('Delete?')){ await api('/borrows/'+id,{method:'DELETE'}); load() } }
  const startEdit=(row)=>{ setForm(row); setEditId(row.id) }

  return (<div>
    <h1>Borrows</h1>
    <form onSubmit={save} style={display:'grid', gap:'8px', maxWidth:'600px'}>
      <label>MachineId<input value={form.MachineId||""} onChange={e=>setForm({...form,MachineId:e.target.value})}/></label>
<label>UserId<input value={form.userId||""} onChange={e=>setForm({...form,userId:e.target.value})}/></label>
<label>BorrowDate(YYYY-MM-DD)<input value={form.borrowDate||""} onChange={e=>setForm({...form,borrowDate:e.target.value})}/></label>
<label>DueDate<input value={form.dueDate||""} onChange={e=>setForm({...form,dueDate:e.target.value})}/></label>
<label>Qty<input value={form.quantity||""} onChange={e=>setForm({...form,quantity:e.target.value})}/></label>
      <button>{editId ? 'Update' : 'Create'}</button>
    </form>
    <table border="1" cellPadding="6" style={marginTop:'16px', width:'100%'}>
      <thead><tr><th>ID</th><th>MachineId</th><th>UserId</th><th>BorrowDate(YYYY-MM-DD)</th><th>DueDate</th><th>Qty</th><th>Actions</th></tr></thead>
      <tbody>
        {list.map(row=> <tr key={row.id}>
          <td>{row.id}</td>
          <td>{row.MachineId}</td><td>{row.userId}</td><td>{row.borrowDate}</td><td>{row.dueDate}</td><td>{row.quantity}</td>
          <td>
            <button onClick={()=>startEdit(row)}>Edit</button>
            <button onClick={()=>del(row.id)}>Delete</button>
          </td>
        </tr>)}
      </tbody>
    </table>
  </div>)
}
