'use client';
import {useMemo} from 'react';
import qrcode from 'qrcode-generator';
export default function BuyerTickets({tickets}:{tickets:any[]}){
 const cards=useMemo(()=>tickets.map(ticket=>{let image='';if(ticket.code){const qr=qrcode(0,'M');qr.addData(ticket.code,'Byte');qr.make();image=qr.createDataURL(6,24);}return {...ticket,image};}),[tickets]);
 return <div className="buyer-tickets">{cards.map(t=><article key={t.number} className="buyer-ticket"><span className="eyebrow">Entrada do evento</span><h3>{t.eventName}</h3><strong>{t.number}</strong><p>{new Date(t.startsAt).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})} · {t.location||'Consulte a direção'}</p>{t.state==='valid'&&t.image?<><img src={t.image} alt={'QR Code do ingresso '+t.number} width={300} height={300}/><p>1 ingresso · 1 pulseira</p><a className="button black small" href={t.image} download={t.number+'.gif'}>Baixar ingresso</a><p>Salve o QR Code no celular e apresente na entrada. Não compartilhe seu código.</p></>:<p role="status" className="status-tag">{t.state==='used'?'Ingresso já utilizado'+(t.usedAt?' em '+new Date(t.usedAt).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}):''):t.state==='revoked'?'Ingresso revogado':'Ingresso indisponível'}</p>}</article>)}</div>;
}
