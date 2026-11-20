const encoder=new TextEncoder();
export async function sha256(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value))),b=>b.toString(16).padStart(2,'0')).join('');}
export async function hmac(secret:string,message:string){const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(message))),b=>b.toString(16).padStart(2,'0')).join('');}
export function equalHex(a:string,b:string){if(!/^[a-f0-9]{64}$/i.test(a)||!/^[a-f0-9]{64}$/i.test(b))return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.toLowerCase().charCodeAt(i)^b.toLowerCase().charCodeAt(i);return diff===0;}
export async function verifyMPNotification(secret:string,signature:string,requestId:string,dataId:string){
 if(!/^[0-9]{1,30}$/.test(dataId)||!requestId||requestId.length>200)return false;
 const parts=signature.split(',').map(p=>p.trim().split('='));const ts=parts.find(p=>p[0]==='ts')?.[1],signatures=parts.filter(p=>p[0]==='v1').map(p=>p[1]);
 if(!ts||!/^\d{10,13}$/.test(ts)||!signatures.length)return false;
 // Do not expire authentic notifications: Mercado Pago can retry for several days.
 // Replay safety comes from re-fetching the payment and idempotent database updates.
 const expected=await hmac(secret,`id:${dataId};request-id:${requestId};ts:${ts};`);
 return signatures.some(s=>equalHex(s,expected));
}
export function cents(value:unknown):number|null{if(typeof value!=='number'||!Number.isFinite(value)||value<0)return null;const rounded=Math.round(value*100);return Math.abs(value*100-rounded)<0.00001&&Number.isSafeInteger(rounded)?rounded:null;}
export function trustedCheckoutURL(value:unknown){if(typeof value!=='string')return false;try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&['www.mercadopago.com.br','sandbox.mercadopago.com.br','www.mercadopago.com','sandbox.mercadopago.com'].includes(url.hostname);}catch{return false;}}
export type PaymentRecord={id:string;status:string;amountCents:number;refundedCents:number;providerUpdatedAt:string};
export function orderPaymentStatus(payments:PaymentRecord[],total:number){
 const good=payments.filter(p=>p.status==='approved'&&p.refundedCents===0&&p.amountCents===total);
 if(good.length>1)return 'review';
 if(good.length===1)return 'paid';
 if(payments.some(p=>p.status==='charged_back'))return 'charged_back';
 if(payments.some(p=>p.refundedCents>0&&p.refundedCents<p.amountCents))return 'partially_refunded';
 if(payments.some(p=>p.status==='refunded'||p.refundedCents>=p.amountCents))return 'refunded';
 if(payments.some(p=>['pending','in_process','authorized','in_mediation'].includes(p.status)))return 'pending';
 if(payments.length)return 'failed';
 return 'pending';
}
export function validatePayment(payment:any,order:{id:string;totalCents:number;mode:string},collectorId:string){
 return payment&&String(payment.external_reference)===order.id&&String(payment.collector_id)===collectorId&&payment.currency_id==='BRL'&&cents(payment.transaction_amount)===order.totalCents&&typeof payment.live_mode==='boolean'&&payment.live_mode===(order.mode==='live')&&typeof payment.status==='string'&&Number.isFinite(Date.parse(payment.date_last_updated));
}
