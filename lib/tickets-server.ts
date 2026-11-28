import {env} from 'cloudflare:workers';
import {newTicketToken,ticketNumber,ticketState} from './ticket-core';
import {ShopError} from './shop-server';
type Order={id:string;ticketEventId?:string|null;quantity:number;mode:string};
export function ticketIssueStatements(order:Order,now:string){
 if(!order.ticketEventId||order.mode!=='live')return [];
 return [...Array.from({length:order.quantity},(_,i)=>env.DB!.prepare("INSERT OR IGNORE INTO event_tickets(token,event_id,order_id,ordinal,created_at) SELECT ?,ticket_event_id,id,?,? FROM shop_orders WHERE id=? AND status='paid' AND mode='live' AND ticket_event_id IS NOT NULL").bind(newTicketToken(),i+1,now,order.id)),
 env.DB!.prepare("INSERT OR IGNORE INTO bar_passes(token,entrance_ticket_id,created_at) SELECT lower(hex(randomblob(32))),t.id,? FROM event_tickets t JOIN shop_orders o ON o.id=t.order_id WHERE o.id=? AND o.includes_open_bar=1 AND o.status='paid' AND o.mode='live' AND t.revoked_at IS NULL").bind(now,order.id),
 env.DB!.prepare("INSERT OR IGNORE INTO ticket_deliveries(order_id,status,updated_at) SELECT id,'pending',? FROM shop_orders WHERE id=? AND status='paid' AND mode='live' AND ticket_event_id IS NOT NULL").bind(now,order.id)];
}
export async function ticketLookup(token:string,eventId:string){
 const row=await env.DB!.prepare("SELECT t.id,t.event_id,t.order_id,t.ordinal,t.used_at,t.used_by,t.revoked_at,t.revoke_reason,o.buyer,o.status AS order_status,o.mode,e.name AS event_name,e.starts_at,e.location FROM event_tickets t JOIN shop_orders o ON o.id=t.order_id JOIN ticket_events e ON e.id=t.event_id WHERE t.token=?").bind(token).first<any>();
 if(!row)return {state:'not_found'};if(row.event_id!==eventId)return {state:'wrong_event'};
 return {state:ticketState(row),ticket:{id:row.id,number:ticketNumber(row.id),buyer:row.buyer,eventName:row.event_name,startsAt:row.starts_at,usedAt:row.used_at,usedBy:row.used_by,orderId:row.order_id,ordinal:row.ordinal}};
}
export async function consumeTicket(token:string,eventId:string,actor:string){
 const now=new Date().toISOString(),nonce=crypto.randomUUID();
 const result=await env.DB!.batch([
 env.DB!.prepare("UPDATE event_tickets SET used_at=?,used_by=?,checkin_nonce=? WHERE token=? AND event_id=? AND used_at IS NULL AND revoked_at IS NULL AND EXISTS(SELECT 1 FROM shop_orders o WHERE o.id=event_tickets.order_id AND o.status='paid' AND o.mode='live') RETURNING id").bind(now,actor,nonce,token,eventId),
 env.DB!.prepare("INSERT INTO ticket_audit(id,ticket_id,actor,action,created_at) SELECT ?,id,?,'checkin',? FROM event_tickets WHERE checkin_nonce=?").bind(crypto.randomUUID(),actor,now,nonce)
 ]);
 if(!result[0].results.length)return ticketLookup(token,eventId);
 const detail=await ticketLookup(token,eventId);return {...detail,state:'checked_in'};
}
export async function revokeTicket(id:number,reason:string,actor:string){
 const now=new Date().toISOString(),auditId=crypto.randomUUID();
 const result=await env.DB!.batch([
 env.DB!.prepare("INSERT INTO ticket_audit(id,ticket_id,actor,action,created_at) SELECT ?,id,?,'revoke',? FROM event_tickets WHERE id=? AND used_at IS NULL AND revoked_at IS NULL").bind(auditId,actor,now,id),
 env.DB!.prepare('UPDATE event_tickets SET revoked_at=?,revoked_by=?,revoke_reason=? WHERE id=? AND used_at IS NULL AND revoked_at IS NULL RETURNING id').bind(now,actor,reason,id)
 ]);if(!result[1].results.length)throw new ShopError(409,'O ingresso já foi usado ou revogado. Atualize a lista.');
}
