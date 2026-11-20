'use client';
import {useState} from 'react';
import {LogOut} from 'lucide-react';
export default function LogoutButton(){const [busy,setBusy]=useState(false),[error,setError]=useState('');return <><button className="logout-button" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{const r=await fetch('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(!r.ok)throw Error();window.location.replace('/login');}catch{setBusy(false);setError('Não foi possível sair. Tente novamente.');}}}><LogOut size={17}/>{busy?'Saindo…':'Sair'}</button>{error&&<small role="alert">{error}</small>}</>;}
