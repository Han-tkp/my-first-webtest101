
import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Dashboard(){
  const [data, setData] = useState(null)
  useEffect(()=>{ api('/dashboard').then(setData).catch(console.error) },[])
  if(!data) return 'Loading...'
  return (
    <div>
      <h1>Overview</h1>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px'}}>
        <Card title="เครื่องจักรทั้งหมด" value={data.total} />
        <Card title="ว่าง (Idle)" value={data.idle} />
        <Card title="กำลังยืม (Borrowed)" value={data.borrowed} />
        <Card title="ซ่อมบำรุง (Repair)" value={data.repair} />
      </div>
      <h2 style={{marginTop:'20px'}}>ล่าสุด</h2>
      <pre>{JSON.stringify({ borrows: data.recentBorrows, repairs: data.recentRepairs }, null, 2)}</pre>
    </div>
  )
}

function Card({title,value}){
  return <div style={{padding:'16px', border:'1px solid #e5e7eb', borderRadius:'12px'}}>
    <div style={{fontSize:'14px', color:'#6b7280'}}>{title}</div>
    <div style={{fontSize:'28px', fontWeight:700}}>{value}</div>
  </div>
}
