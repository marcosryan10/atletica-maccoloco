import {env} from 'cloudflare:workers';
import {getDb} from '../db';
import {shopConfig,shopOrders,shopPayments,shopManualConfig} from '../db/schema';
import {eq,sql} from 'drizzle-orm';
import {getChatGPTUser} from '../app/chatgpt-auth';
import {isMaccoAdmin} from './admin-auth';
import {sha256,hmac,validatePayment,cents,orderPaymentStatus} from './payment-core';
import {sealCredentials,openCredentials} from './credential-crypto';
export class ShopError extends Error{constructor(public status:number,message:string){super(message);}}
export const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'}});
export async function isShopAdmin(){const u=await getChatGPTUser();return Boolean(u&&isMaccoAdmin(u.email));}
export async function adminOnly(request?:Request){if(request&&request.headers.get('origin')!==new URL(request.url).origin)throw new ShopError(403,'Origem não permitida.');if(!await isShopAdmin())throw new ShopError(403,'Acesso exclusivo da direção autorizada.');}
export function shopError(error:unknown){return error instanceof ShopError?json({error:error.message},error.status):json({error:'Não foi possível concluir agora. Tente novamente em instantes.'},503);}
export async function readJSON(request:Request,max=12000){
 if(!request.headers.get('content-type')?.includes('application/json'))throw new ShopError(415,'Envie dados em JSON.');
 const reader=request.body?.getReader();if(!reader)throw new ShopError(400,'Dados ausentes.');let size=0;const chunks:Uint8Array[]=[];
 for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>max){await reader.cancel();throw new ShopError(413,'Conteúdo muito extenso.');}chunks.push(part.value);}
 const bytes=new Uint8Array(size);let pos=0;for(const chunk of chunks){bytes.set(chunk,pos);pos+=chunk.length;}let value:any;try{value=JSON.parse(new TextDecoder().decode(bytes));}catch{throw new ShopError(400,'Dados inválidos.');}if(!value||typeof value!=='object'||Array.isArray(value))throw new ShopError(400,'Dados inválidos.');return value;
}
function encryptionSecret(){const key=(env as unknown as Record<string,string>).SHOP_ENCRYPTION_KEY;if(!key||!/^[a-f0-9]{64}$/i.test(key))throw new ShopError(503,'A proteção das credenciais ainda não foi configurada na hospedagem.');return key;}
export async function encryptCredentials(value:{token:string;webhookSecret:string}){return sealCredentials(encryptionSecret(),value);}
export async function paymentConfig(){const [row]=await getDb().select().from(shopConfig).where(eq(shopConfig.id,'mercado-pago'));if(!row)return null;return {...row,...await openCredentials(encryptionSecret(),row.encryptedCredentials)};}
export async function mpFetch(path:string,token:string,options:RequestInit={},transport:typeof fetch=fetch){const r=await transport('https://api.mercadopago.com'+path,{...options,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',...options.headers},signal:AbortSignal.timeout(12000)});if(!r.ok)throw new ShopError(502,'O Mercado Pago não confirmou a operação. Confira a conta e tente novamente.');return await r.json() as any;}
export async function manualConfig(){const [row]=await getDb().select().from(shopManualConfig).where(eq(shopManualConfig.id,'manual'));return row||{id:'manual',pixKey:'',receiverName:'',receiverCity:'',pixEnabled:0,cashEnabled:0};}
export async function publicConfig(){const c=await manualConfig();return {checkoutEnabled:Boolean(c.pixEnabled||c.cashEnabled),pixEnabled:Boolean(c.pixEnabled),cashEnabled:Boolean(c.cashEnabled),testMode:false,mode:'live'};}
export function sessionCookie(request:Request){const cookieName=new URL(request.url).protocol==='https:'?'__Host-maccoloco-shop':'maccoloco-shop';const match=request.headers.get('cookie')?.split(';').map(c=>c.trim()).find(c=>c.startsWith(cookieName+'='))?.slice(cookieName.length+1);return {name:cookieName,token:match&&/^[a-f0-9]{64}$/.test(match)?match:null};}
export async function limitShop(request:Request,scope:string,max=8){const ip=request.headers.get('cf-connecting-ip')||'local';const window=Math.floor(Date.now()/600000);const id=await sha256('macco-shop:'+new URL(request.url).hostname+':'+scope+':'+ip+':'+window);const result=await env.DB!.prepare('INSERT INTO shop_rate_limits (id,hits,expires_at) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET hits=hits+1 RETURNING hits').bind(id,(window+1)*600000).first<{hits:number}>();if(!result||result.hits>max)throw new ShopError(429,'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');await env.DB!.prepare('DELETE FROM shop_rate_limits WHERE expires_at < ?').bind(Date.now()).run();}
export async function synchronizePayment(paymentId:string){
 if(!/^\d{1,30}$/.test(paymentId))throw new ShopError(400,'Pagamento inválido.');const config=await paymentConfig();if(!config)throw new ShopError(503,'Pagamento não configurado.');
 const payment=await mpFetch('/v1/payments/'+paymentId,config.token);if(String(payment.id)!==paymentId)throw new ShopError(409,'Pagamento divergente.');
 const db=getDb(),[order]=await db.select().from(shopOrders).where(eq(shopOrders.id,String(payment.external_reference||'')));if(!order)throw new ShopError(404,'Pedido não encontrado.');if(order.paymentMethod!=='legacy')throw new ShopError(409,'Este pedido usa confirmação manual.');
 if(!validatePayment(payment,order,config.collectorId))throw new ShopError(409,'O pagamento não corresponde ao pedido, valor ou conta recebedora.');
 const refunded=cents(payment.transaction_amount_refunded??0);if(refunded===null||refunded>order.totalCents)throw new ShopError(409,'Reembolso divergente.');
 const record={id:paymentId,orderId:order.id,status:payment.status,amountCents:order.totalCents,refundedCents:refunded,providerUpdatedAt:new Date(payment.date_last_updated).toISOString()};
 // D1 batch is transactional; recompute the aggregate in SQL inside the same transaction.
 const paymentUpsert=db.insert(shopPayments).values(record).onConflictDoUpdate({target:shopPayments.id,set:record,setWhere:sql`${shopPayments.providerUpdatedAt} <= ${record.providerUpdatedAt}`});
 const update=env.DB!.prepare(`UPDATE shop_orders SET status = CASE
 WHEN (SELECT COUNT(*) FROM shop_payments WHERE order_id=? AND status='approved' AND refunded_cents=0) > 1 THEN 'review'
 WHEN EXISTS(SELECT 1 FROM shop_payments WHERE order_id=? AND status='approved' AND refunded_cents=0) THEN 'paid'
 WHEN EXISTS(SELECT 1 FROM shop_payments WHERE order_id=? AND status='charged_back') THEN 'charged_back'
 WHEN EXISTS(SELECT 1 FROM shop_payments WHERE order_id=? AND refunded_cents>0 AND refunded_cents<amount_cents) THEN 'partially_refunded'
 WHEN EXISTS(SELECT 1 FROM shop_payments WHERE order_id=? AND (status='refunded' OR refunded_cents>=amount_cents)) THEN 'refunded'
 WHEN EXISTS(SELECT 1 FROM shop_payments WHERE order_id=? AND status IN ('pending','in_process','authorized','in_mediation')) THEN 'pending'
 ELSE 'failed' END, updated_at=? WHERE id=?`).bind(order.id,order.id,order.id,order.id,order.id,order.id,new Date().toISOString(),order.id);
 const query=paymentUpsert.toSQL();await env.DB!.batch([env.DB!.prepare(query.sql).bind(...query.params),update]);
 if(payment.status==='approved'&&order.mode==='test')await db.update(shopConfig).set({testPaidAt:new Date().toISOString()}).where(eq(shopConfig.id,'mercado-pago'));
 return order.id;
}
export {sha256,orderPaymentStatus};
