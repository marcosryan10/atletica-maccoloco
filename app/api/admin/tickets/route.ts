import {env} from 'cloudflare:workers';
import {getMaccolocoUser} from '../../../maccoloco-auth';
import {hasPermission} from '../../../../lib/access-core';
import {json,shopError,ShopError,readJSON,limitShop} from '../../../../lib/shop-server';
import {readTicketCode,ticketNumber,ticketState} from '../../../../lib/ticket-core';
import {consumeTicket,revokeTicket,ticketLookup,ticketIssueStatements} from '../../../../lib/tickets-server';
import {deliverTicketEmail,ticketMailConfigured,sendTicketTestEmail} from '../../../../lib/ticket-mail';
export const dynamic='force-dynamic';
async function actor(request?:Request){
 if(request&&request.headers.get('origin')!==new URL(request.url).origin)throw new ShopError(403,'Origem não permitida.');
 const user=await getMaccolocoUser();if(!user||(!hasPermission(user,'tickets')&&!hasPermission(user,'checkin')))throw new ShopError(403,'Você não tem acesso aos ingressos.');return user;
}
const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v);
export async function GET(request:Request){try{
 const user=await actor(),manage=hasPermission(user,'tickets'),url=new URL(request.url);
 const events=(await env.DB!.prepare('SELECT id,name,starts_at AS startsAt,location,sales_open AS salesOpen FROM ticket_events ORDER BY starts_at DESC').all()).results;
 if(!manage)return json({events,manage:false,checkin:hasPermission(user,'checkin')});
 const eventId=url.searchParams.get('event')||'',search=(url.searchParams.get('search')||'').slice(0,100).replace(/[\\%_]/g,''),page=Math.max(0,Math.min(100000,Math.floor(Number(url.searchParams.get('page'))||0)));
 if(eventId&&!uuid(eventId))throw new ShopError(400,'Evento inválido.');
 const where="(?='' OR t.event_id=?) AND (?='' OR o.buyer LIKE ? OR o.email LIKE ? OR ('MAC-'||printf('%06d',t.id)) LIKE ?)",args=[eventId,eventId,search,...Array(3).fill('%'+search+'%')];
 const joins=' FROM event_tickets t JOIN shop_orders o ON o.id=t.order_id JOIN ticket_events e ON e.id=t.event_id LEFT JOIN ticket_deliveries d ON d.order_id=o.id ';
 const rows=await env.DB!.prepare('SELECT t.id,t.ordinal,t.used_at,t.used_by,t.revoked_at,t.revoke_reason,o.id AS order_id,o.buyer,o.email,o.product_name,o.status AS order_status,o.mode,e.name AS event_name,d.status AS email_status,d.last_error'+joins+'WHERE '+where+' ORDER BY t.id DESC LIMIT 50 OFFSET ?').bind(...args,page*50).all<any>();
 const count=await env.DB!.prepare('SELECT count(*) AS n'+joins+'WHERE '+where).bind(...args).first<any>();
 const stats=await env.DB!.prepare("SELECT count(*) AS total,coalesce(sum(t.used_at IS NOT NULL),0) AS used,coalesce(sum(t.used_at IS NULL AND t.revoked_at IS NULL AND o.status='paid' AND o.mode='live'),0) AS available FROM event_tickets t JOIN shop_orders o ON o.id=t.order_id WHERE (?='' OR t.event_id=?)").bind(eventId,eventId).first();
 return json({events,manage:true,checkin:hasPermission(user,'checkin'),owner:user.owner,smtpConfigured:ticketMailConfigured(),tickets:rows.results.map(r=>({...r,number:ticketNumber(r.id),state:ticketState(r)})),total:count.n,stats});
 }catch(e){return shopError(e);}}
export async function POST(request:Request){try{
 const user=await actor(request),b=await readJSON(request),now=new Date().toISOString();
 if(['lookup','checkin'].includes(b.action)){
 if(!hasPermission(user,'checkin'))throw new ShopError(403,'Seu acesso não permite fazer check-in.');
 await limitShop(request,'ticket-scan',300);const token=readTicketCode(b.code);if(!token||!uuid(b.eventId))throw new ShopError(400,'Leia um QR Code MaccoLoco válido e selecione o evento.');
 return json(b.action==='lookup'?await ticketLookup(token,b.eventId):await consumeTicket(token,b.eventId,user.email));
 }
 if(!hasPermission(user,'tickets'))throw new ShopError(403,'Seu acesso não permite gerenciar ingressos.');
 if(b.action==='test-email'){if(!user.owner)throw new ShopError(403,'Somente a conta principal pode testar o e-mail.');await limitShop(request,'ticket-email-test',3);return json({email:await sendTicketTestEmail()});}
 if(b.action==='event'){
 const name=typeof b.name==='string'?b.name.trim():'',location=typeof b.location==='string'?b.location.trim():'';
 if(name.length<3||name.length>120||location.length>200||typeof b.startsAt!=='string'||!Number.isFinite(Date.parse(b.startsAt))||typeof b.salesOpen!=='boolean'||(b.id&&!uuid(b.id)))throw new ShopError(400,'Confira nome, data, local e situação das vendas.');
 const id=b.id||crypto.randomUUID();await env.DB!.prepare('INSERT INTO ticket_events(id,name,starts_at,location,sales_open,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,starts_at=excluded.starts_at,location=excluded.location,sales_open=excluded.sales_open,updated_at=excluded.updated_at').bind(id,name,new Date(b.startsAt).toISOString(),location,b.salesOpen?1:0,now).run();return json({ok:true,id});
 }
 if(b.action==='revoke'){
 if(!Number.isSafeInteger(b.id)||b.id<1||typeof b.reason!=='string'||b.reason.trim().length<3||b.reason.length>160)throw new ShopError(400,'Informe o ingresso e o motivo da revogação.');
 await revokeTicket(b.id,b.reason.trim(),user.email);return json({ok:true});
 }
 if(b.action==='preview'){
 if(!Number.isSafeInteger(b.id)||b.id<1)throw new ShopError(400,'Ingresso inválido.');
 const row=await env.DB!.prepare("SELECT t.id,t.token,e.name FROM event_tickets t JOIN ticket_events e ON e.id=t.event_id JOIN shop_orders o ON o.id=t.order_id WHERE t.id=? AND t.revoked_at IS NULL AND o.status='paid' AND o.mode='live'").bind(b.id).first<any>();if(!row)throw new ShopError(404,'Ingresso indisponível.');return json({number:ticketNumber(row.id),code:'MACCOLOCO:'+row.token,event:row.name});
 }
 if(b.action==='resend'){
 await limitShop(request,'ticket-resend',10);if(!uuid(b.orderId))throw new ShopError(400,'Pedido inválido.');
 const order=await env.DB!.prepare("SELECT id,ticket_event_id AS ticketEventId,quantity,mode FROM shop_orders WHERE id=? AND status='paid' AND mode='live' AND ticket_event_id IS NOT NULL").bind(b.orderId).first<any>();if(!order)throw new ShopError(409,'Somente combos pagos deste sistema podem gerar ingressos.');
 const delivery=await env.DB!.prepare('SELECT updated_at FROM ticket_deliveries WHERE order_id=?').bind(order.id).first<any>();if(delivery&&Date.parse(delivery.updated_at)>Date.now()-60000)throw new ShopError(429,'Aguarde um minuto antes de reenviar este pedido.');
 await env.DB!.batch(ticketIssueStatements(order,now));return json({ok:true,email:await deliverTicketEmail(order.id,true)});
 }
 throw new ShopError(400,'Ação inválida.');
 }catch(e){return shopError(e);}}
