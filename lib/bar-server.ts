import {env} from 'cloudflare:workers';
import {BAR_INTERVAL_MS,barNumber,barState} from './bar-core';
export const barJoins=' FROM bar_passes p JOIN event_tickets t ON t.id=p.entrance_ticket_id JOIN shop_orders o ON o.id=t.order_id JOIN ticket_events e ON e.id=t.event_id ';
export const barColumns='p.id,p.token,p.last_served_at,t.event_id,t.order_id,t.revoked_at,o.buyer,o.status AS order_status,o.mode,o.includes_open_bar,e.name AS event_name,e.bar_starts_at,e.bar_ends_at';
export function buyerBarPass(row:any){const available=!row.revoked_at&&row.order_status==='paid'&&row.mode==='live'&&row.includes_open_bar===1;return {number:barNumber(row.id),eventName:row.event_name,orderId:row.order_id,startsAt:row.bar_starts_at,endsAt:row.bar_ends_at,intervalMinutes:8,lastServedAt:row.last_served_at,state:available?'valid':'revoked',code:available?'MACCOLOCO-BAR:'+row.token:null};}
export async function barLookup(token:string,eventId:string,now=Date.now()){
 const row=await env.DB!.prepare('SELECT '+barColumns+barJoins+'WHERE p.token=?').bind(token).first<any>();
 if(!row)return {state:'not_found',serverNow:now};if(row.event_id!==eventId)return {state:'wrong_event',serverNow:now};
 return {state:barState(row,now),serverNow:now,pass:{number:barNumber(row.id),buyer:row.buyer,eventName:row.event_name,startsAt:row.bar_starts_at,endsAt:row.bar_ends_at,lastServedAt:row.last_served_at,nextAllowedAt:row.last_served_at===null?null:row.last_served_at+BAR_INTERVAL_MS}};
}
// The clock is provided only by the server. The transaction rechecks every eligibility rule.
export async function redeemBar(token:string,eventId:string,actor:string,requestId:string,now=Date.now()){
 const iso=new Date(now).toISOString();
 const results=await env.DB!.batch([
 env.DB!.prepare("UPDATE bar_passes SET last_served_at=?,last_served_by=?,redemption_nonce=? WHERE token=? AND (last_served_at IS NULL OR last_served_at<=?) AND NOT EXISTS(SELECT 1 FROM bar_redemptions WHERE id=?) AND EXISTS(SELECT 1 FROM event_tickets t JOIN shop_orders o ON o.id=t.order_id JOIN ticket_events e ON e.id=t.event_id WHERE t.id=bar_passes.entrance_ticket_id AND t.event_id=? AND t.revoked_at IS NULL AND o.status='paid' AND o.mode='live' AND o.includes_open_bar=1 AND julianday(e.bar_starts_at)<=julianday(?) AND julianday(e.bar_ends_at)>julianday(?) AND julianday(e.bar_ends_at)>julianday(e.bar_starts_at)) RETURNING id").bind(now,actor,requestId,token,now-BAR_INTERVAL_MS,requestId,eventId,iso,iso),
 env.DB!.prepare('INSERT OR IGNORE INTO bar_redemptions(id,pass_id,actor,served_at) SELECT ?,id,?,? FROM bar_passes WHERE token=? AND redemption_nonce=? AND last_served_at=?').bind(requestId,actor,now,token,requestId,now)
 ]);
 const detail=await barLookup(token,eventId,now);
 if(results[0].results.length)return {...detail,state:'served'};
 const receipt=await env.DB!.prepare('SELECT r.id FROM bar_redemptions r JOIN bar_passes p ON p.id=r.pass_id JOIN event_tickets t ON t.id=p.entrance_ticket_id WHERE r.id=? AND p.token=? AND t.event_id=?').bind(requestId,token,eventId).first();
 return receipt?{...detail,state:'already_recorded'}:detail;
}
