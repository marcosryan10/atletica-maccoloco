import {env} from 'cloudflare:workers';
import qrcode from 'qrcode-generator';
import {adminEmail} from './maccoloco';
import {escapeTicketHTML as esc,ticketNumber} from './ticket-core';
export function ticketMailConfigured(){return Boolean((env as unknown as Record<string,string>).TICKET_SMTP_PASSWORD?.trim());}
export function ticketEmail(tickets:any[],buyer:string,event:any){
 const attachments:any[]=[];const cards=tickets.map(t=>{const qr=qrcode(0,'M');qr.addData('MACCOLOCO:'+t.token,'Byte');qr.make();const cid='ticket-'+t.id;attachments.push({filename:ticketNumber(t.id)+'.gif',content:Buffer.from(qr.createDataURL(6,24).split(',')[1],'base64'),contentType:'image/gif',cid});return `<div style="border:1px solid #ddd;padding:20px;margin:20px 0;text-align:center"><h2>${ticketNumber(t.id)}</h2><img src="cid:${cid}" width="260" height="260" alt="QR Code do ingresso ${ticketNumber(t.id)}"><p>1 ingresso · 1 pulseira</p></div>`;});
 const date=new Date(event.starts_at).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'});
 return {subject:'Seus ingressos MaccoLoco · '+event.name,text:`Olá, ${buyer}! Seu pagamento foi confirmado.\nEvento: ${event.name}\nData: ${date}\nLocal: ${event.location||'Consulte a direção'}\nIngressos: ${tickets.map(t=>ticketNumber(t.id)).join(', ')}\nOs QR Codes estão nas imagens anexas. Cada código permite retirar uma pulseira uma única vez. Guarde as imagens e não compartilhe seu ingresso. Para dúvidas: ${adminEmail}`,html:`<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#171714"><h1 style="background:#ff571c;padding:24px">MACCOLOCO</h1><p>Olá, ${esc(buyer)}! Seu pagamento foi confirmado.</p><h2>${esc(event.name)}</h2><p>${esc(date)}<br>${esc(event.location||'Local: consulte a direção')}</p>${cards.join('')}<p>Apresente um QR Code para cada pulseira. A direção fará a leitura e registrará a entrega. Cada ingresso pode ser utilizado uma única vez.</p><p>Salve as imagens no celular para apresentar mesmo sem internet. Não publique nem compartilhe seus códigos.</p><p>Dúvidas: ${adminEmail}</p></div>`,attachments};
}
export async function deliverTicketEmail(orderId:string,resend=false){
 const now=new Date().toISOString();
 if(!ticketMailConfigured()){await env.DB!.prepare("UPDATE ticket_deliveries SET status='error',last_error=?,updated_at=? WHERE order_id=? AND status<>'sent' AND status<>'sending'").bind('Envio de ingressos ainda não configurado na hospedagem.',now,orderId).run();return {status:'not_configured'};}
 const lock=crypto.randomUUID(),expired=new Date(Date.now()-300000).toISOString();
 const claim=await env.DB!.prepare("UPDATE ticket_deliveries SET status='sending',lock_token=?,locked_at=?,attempts=attempts+1,updated_at=? WHERE order_id=? AND (status IN ('pending','error') OR (status='sending' AND locked_at<?) OR (?=1 AND status='sent')) AND EXISTS(SELECT 1 FROM shop_orders o WHERE o.id=ticket_deliveries.order_id AND o.status='paid' AND o.mode='live') RETURNING order_id").bind(lock,now,now,orderId,expired,resend?1:0).first();
 if(!claim)return {status:'unchanged'};
 try{
 const order=await env.DB!.prepare('SELECT o.buyer,o.email,e.name,e.starts_at,e.location FROM shop_orders o JOIN ticket_events e ON e.id=o.ticket_event_id WHERE o.id=?').bind(orderId).first<any>();
 const rows=await env.DB!.prepare('SELECT id,token FROM event_tickets WHERE order_id=? AND revoked_at IS NULL ORDER BY ordinal').bind(orderId).all<any>();
 if(!order||!rows.results.length)throw Error('NO_TICKETS');
 const {default:nodemailer}=await import('nodemailer');const smtp=nodemailer.createTransport({host:'smtp.gmail.com',port:465,secure:true,auth:{user:adminEmail,pass:(env as unknown as Record<string,string>).TICKET_SMTP_PASSWORD.replace(/\s/g,'')},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000,logger:false,debug:false,disableFileAccess:true,disableUrlAccess:true});
 try{await smtp.sendMail({from:{name:'Atlética MaccoLoco',address:adminEmail},to:order.email,replyTo:adminEmail,...ticketEmail(rows.results,order.buyer,order)});}finally{smtp.close();}
 await env.DB!.prepare("UPDATE ticket_deliveries SET status='sent',sent_at=?,last_error=NULL,lock_token=NULL,updated_at=? WHERE order_id=? AND lock_token=?").bind(now,now,orderId,lock).run();return {status:'sent'};
 }catch{
 await env.DB!.prepare("UPDATE ticket_deliveries SET status='error',last_error=?,lock_token=NULL,updated_at=? WHERE order_id=? AND lock_token=?").bind('Não foi possível enviar o e-mail. Confira o SMTP e tente reenviar.',now,orderId,lock).run();return {status:'error'};
 }
}

export async function sendTicketTestEmail(){
 if(!ticketMailConfigured())return {status:'not_configured'};
 try{const {default:nodemailer}=await import('nodemailer');const smtp=nodemailer.createTransport({host:'smtp.gmail.com',port:465,secure:true,auth:{user:adminEmail,pass:(env as unknown as Record<string,string>).TICKET_SMTP_PASSWORD.replace(/\s/g,'')},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000,logger:false,debug:false,disableFileAccess:true,disableUrlAccess:true});
 try{await smtp.sendMail({from:{name:'Atlética MaccoLoco',address:adminEmail},to:adminEmail,subject:'MaccoLoco · teste de envio de ingressos',text:'O envio de e-mails da loja está funcionando. Esta mensagem é apenas um teste e não representa compra, ingresso ou confirmação de pagamento.'});}finally{smtp.close();}return {status:'sent'};}catch{return {status:'error'};}
}
