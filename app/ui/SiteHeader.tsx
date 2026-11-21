'use client';
import {useState} from 'react';
import {Menu,X} from 'lucide-react';
export default function SiteHeader(){
 const [open,setOpen]=useState(false);
 return <header className="site-header"><a href="/" className="brand" aria-label="MaccoLoco início"><img src="/media/maccoloco.jpg" alt=""/><span>MACCO<span className="brand-outline">LOCO</span><small>ASSOCIAÇÃO ATLÉTICA UNIFICADA<br/>IFNMG CAMPUS ALMENARA</small></span></a><nav id="main-navigation" aria-label="Navegação principal" className={open?'open':''}>{[['A atlética','/#sobre'],['Novidades','/#noticias'],['Eventos','/#eventos'],['Produtos','/produtos'],['Área do cliente','/minha-conta']].map(([label,href])=><a key={href} href={href} onClick={()=>setOpen(false)}>{label}</a>)}<a href="/admin" onClick={()=>setOpen(false)}>Área da direção</a></nav><button className="icon-button menu-button" aria-controls="main-navigation" aria-label={open?'Fechar menu':'Abrir menu'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></header>;
}
