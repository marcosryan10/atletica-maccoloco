'use client';
import {useMemo} from 'react';
import qrcode from 'qrcode-generator';
const date=(v:string)=>new Date(v).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'});
export default function BuyerBarPasses({passes=[]}:{passes?:any[]}){
 const cards=useMemo(()=>passes.map(p=>{let image='';if(p.code){const qr=qrcode(0,'M');qr.addData(p.code,'Byte');qr.make();image=qr.createDataURL(6,24);}return {...p,image};}),[passes]);
 if(!cards.length)return null;
 return <section aria-label="Passes de open bar"><h3>Open bar · exclusivo do combo</h3><div className="buyer-tickets">{cards.map(p=><article key={p.number} className="buyer-ticket"><span className="eyebrow">Passe de open bar · Combo</span><h3>{p.eventName}</h3><strong>{p.number}</strong>{p.startsAt&&p.endsAt?<p>De {date(p.startsAt)} até {date(p.endsAt)} · horário de Brasília</p>:<p>Consulte a direção sobre o horário.</p>}<p>1 bebida por liberação. Intervalo de 8 minutos após cada entrega confirmada, dentro das duas horas do evento.</p>{p.image?<><img src={p.image} alt={'QR Code do passe de open bar '+p.number} width={300} height={300}/><a className="button black small" href={p.image} download={p.number+'.gif'}>Baixar passe do open bar</a><p>Apresente este código no bar. Use o ingresso de entrada na portaria. Não compartilhe seus códigos.</p></>:<p role="status">Passe indisponível ou revogado.</p>}</article>)}</div></section>;
}
