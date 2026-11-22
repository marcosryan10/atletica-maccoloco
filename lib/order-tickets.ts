import {env} from 'cloudflare:workers';
import {ticketNumber,ticketState} from './ticket-core';
export function buyerTicket(row:any){
 const state=ticketState(row);
 return {number:ticketNumber(row.id),eventName:row.event_name,startsAt:row.starts_at,location:row.location,state,usedAt:row.used_at,orderId:row.order_id,code:state==='valid'?'MACCOLOCO:'+row.token:null};
}
// Call only after the order owner has been verified by the route.
export async function orderTickets(order:{id:string;status:string;mode:string}){
 if(order.status!=='paid'||order.mode!=='live')return [];
 const rows=await env.DB!.prepare("SELECT t.id,t.token,t.used_at,t.revoked_at,t.order_id,e.name AS event_name,e.starts_at,e.location,o.status AS order_status,o.mode FROM event_tickets t JOIN shop_orders o ON o.id=t.order_id JOIN ticket_events e ON e.id=t.event_id WHERE t.order_id=? AND o.status='paid' AND o.mode='live' ORDER BY t.ordinal").bind(order.id).all();
 return rows.results.map(buyerTicket);
}
