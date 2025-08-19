
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Users from './pages/Users.jsx'
import MachineTypes from './pages/MachineTypes.jsx'
import Machines from './pages/Machines.jsx'
import Borrows from './pages/Borrows.jsx'
import Returns from './pages/Returns.jsx'
import Repairs from './pages/Repairs.jsx'

function Layout({ children }){
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" />
  return (
    <div style={{display:'grid', gridTemplateColumns:'240px 1fr', minHeight:'100vh'}}>
      <aside style={{background:'#111827', color:'#fff', padding:'16px'}}>
        <h2>Weldork Admin</h2>
        <nav style={{display:'grid', gap:'8px', marginTop:'12px'}}>
          <Link to="/" style={{color:'#fff'}}>Dashboard</Link>
          <Link to="/users" style={{color:'#fff'}}>Users</Link>
          <Link to="/machine-types" style={{color:'#fff'}}>Machine Types</Link>
          <Link to="/machines" style={{color:'#fff'}}>Machines</Link>
          <Link to="/borrows" style={{color:'#fff'}}>Borrows</Link>
          <Link to="/returns" style={{color:'#fff'}}>Returns</Link>
          <Link to="/repairs" style={{color:'#fff'}}>Repairs</Link>
          <button onClick={()=>{localStorage.removeItem('token'); location.href='/login'}} style={{marginTop:'12px'}}>Logout</button>
        </nav>
      </aside>
      <main style={{padding:'20px'}}>{children}</main>
    </div>
  )
}

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/users" element={<Layout><Users /></Layout>} />
        <Route path="/machine-types" element={<Layout><MachineTypes /></Layout>} />
        <Route path="/machines" element={<Layout><Machines /></Layout>} />
        <Route path="/borrows" element={<Layout><Borrows /></Layout>} />
        <Route path="/returns" element={<Layout><Returns /></Layout>} />
        <Route path="/repairs" element={<Layout><Repairs /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
