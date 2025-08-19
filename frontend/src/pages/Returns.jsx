
import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Returns() {
  const [list,setList]=useState([])
  const [form,setForm]=useState({})
  const [editId,setEditId]=useState(null)

  const load=()=> api('/returns').then(setList)
  useEffect(()=>{ load() },[])

  const save=async (e)=>{
    e.preventDefault()
    if(editId) await api('/returns/'+editId, { method:'PUT', body: JSON.stringify(form) })
    else await api('/returns', { method:'POST', body: JSON.stringify(form) })
    setForm({}); setEditId(null); load()
  }
  const del=async id=>{ if(confirm('Delete?')){ await api('/returns/'+id,{method:'DELETE'}); load() } }
  const startEdit=(row)=>{ setForm(row); setEditId(row.id) }

  return (<div>
    <h1>Returns</h1>
    <form onSubmit={save} style={display:'grid', gap:'8px', maxWidth:'600px'}>
      <label>BorrowId<input value={form.BorrowId||""} onChange={e=>setForm({...form,BorrowId:e.target.value})}/></label>
<label>ReturnDate(YYYY-MM-DD)<input value={form.returnDate||""} onChange={e=>setForm({...form,returnDate:e.target.value})}/></label>
<label>Condition<input value={form.condition||""} onChange={e=>setForm({...form,condition:e.target.value})}/></label>
      <button>{editId ? 'Update' : 'Create'}</button>
    </form>
    <table border="1" cellPadding="6" style={marginTop:'16px', width:'100%'}>
      <thead><tr><th>ID</th><th>BorrowId</th><th>ReturnDate(YYYY-MM-DD)</th><th>Condition</th><th>Actions</th></tr></thead>
      <tbody>
        {list.map(row=> <tr key={row.id}>
          <td>{row.id}</td>
          <td>{row.BorrowId}</td><td>{row.returnDate}</td><td>{row.condition}</td>
          <td>
            <button onClick={()=>startEdit(row)}>Edit</button>
            <button onClick={()=>del(row.id)}>Delete</button>
          </td>
        </tr>)}
      </tbody>
    </table>
  </div>)
}
