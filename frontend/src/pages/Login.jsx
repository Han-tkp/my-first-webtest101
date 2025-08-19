
import React, { useState } from 'react'
import { api } from '../api'

export default function Login(){
  const [email,setEmail]=useState('admin@weldork.local')
  const [password,setPassword]=useState('admin123')
  const [error,setError]=useState('')
  const submit=async (e)=>{
    e.preventDefault()
    try{
      const { token } = await api('/auth/login', { method:'POST', body: JSON.stringify({ email, password }) })
      localStorage.setItem('token', token)
      location.href='/'
    }catch(e){ setError(e.message) }
  }
  return (
    <div style={{display:'grid', placeItems:'center', height:'100vh'}}>
      <form onSubmit={submit} style={{display:'grid', gap:'8px', width:'320px'}}>
        <h2>Login</h2>
        {error && <div style={{color:'red'}}>{error}</div>}
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button>Sign in</button>
      </form>
    </div>
  )
}
