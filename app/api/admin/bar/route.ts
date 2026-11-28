import {env} from 'cloudflare:workers';
import {getMaccolocoUser} from '../../../maccoloco-auth';
import {hasPermission} from '../../../../lib/access-core';
import {json,readJSON,shopError,ShopError,limitShop} from '../../../../lib/shop-server';
import {readBarCode} from '../../../../lib/bar-core';
import {barLookup,redeemBar} from '../../../../lib/bar-server';
export const dynamic='force-dynamic';
const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v);
async function actor(request?:Request){if(request&&request.headers.get('origin')!==new URL(request.url).origin)throw new ShopError(403,'Origem não permitida.');const user=await getMaccolocoUser();if(!user||(!hasPermission(user,'bar')&&!hasPermission(user,'tickets')))throw new ShopError(403,'Seu acesso não permite consultar o open bar.');return user;}
export async function GET(){try{const user=await actor();const events=(await env.DB!.prepare('SELECT id,name,bar_starts_at AS barStartsAt,bar_ends_at AS barEndsAt FROM ticket_events ORDER BY starts_at DESC').all()).results;return json({events,manage:hasPermission(user,'tickets'),serve:hasPermission(user,'bar'),intervalMinutes:8});}catch(e){return shopError(e);}}
export async function POST(request:Request){try{
 const user=await actor(request),b=await readJSON(request);
 if(b.action==='schedule'){
 if(!hasPermission(user,'tickets'))throw new ShopError(403,'Somente quem gerencia ingressos pode configurar o horário.');
 if(!uuid(b.eventId)||typeof b.startsAt!=='string'||typeof b.endsAt!=='string'||!Number.isFinite(Date.parse(b.startsAt))||Date.parse(b.endsAt)-Date.parse(b.startsAt)!==2*60*60*1000)throw new ShopError(400,'Selecione um evento e um período de exatamente duas horas.');
 // After service starts, changing the shared window could bypass the agreed limit.
 const updated=await env.DB!.prepare('UPDATE ticket_events SET bar_starts_at=?,bar_ends_at=?,updated_at=? WHERE id=? AND NOT EXISTS(SELECT 1 FROM bar_redemptions r JOIN bar_passes p ON p.id=r.pass_id JOIN event_tickets t ON t.id=p.entrance_ticket_id WHERE t.event_id=ticket_events.id) RETURNING id').bind(new Date(b.startsAt).toISOString(),new Date(b.endsAt).toISOString(),new Date().toISOString(),b.eventId).all();
 if(!updated.results.length)throw new ShopError(409,'Evento não encontrado ou open bar já utilizado.');return json({ok:true});
 }
 if(!hasPermission(user,'bar'))throw new ShopError(403,'Seu acesso não permite registrar bebidas.');
 if(!['lookup','redeem'].includes(b.action))throw new ShopError(400,'Ação inválida.');
 await limitShop(request,'bar-scan',300);
 const token=readBarCode(b.code);if(!token||!uuid(b.eventId))throw new ShopError(400,typeof b.code==='string'&&b.code.startsWith('MACCOLOCO:')?'Este é o ingresso de entrada. Peça o QR Code do passe de open bar.':'Selecione o evento e leia um passe de open bar MaccoLoco.');
 if(b.action==='lookup')return json(await barLookup(token,b.eventId));
 if(b.confirmDelivery!==true||!uuid(b.requestId))throw new ShopError(400,'Confirme a entrega de uma bebida.');
 return json(await redeemBar(token,b.eventId,user.email,b.requestId));
 }catch(e){return shopError(e);}}
