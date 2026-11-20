import {getDb} from '../../../../db';
import {shopConfig} from '../../../../db/schema';
import {eq} from 'drizzle-orm';
import {json,shopError,ShopError,paymentConfig,readJSON,synchronizePayment} from '../../../../lib/shop-server';
import {verifyMPNotification} from '../../../../lib/payment-core';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{const config=await paymentConfig();if(!config)throw new ShopError(503,'Integração não configurada.');const id=new URL(request.url).searchParams.get('data.id')||'';
 if(!await verifyMPNotification(config.webhookSecret,request.headers.get('x-signature')||'',request.headers.get('x-request-id')||'',id))throw new ShopError(401,'Notificação não autenticada.');
 const body=await readJSON(request);if(body.type!=='payment')return json({received:true});if(String(body.data?.id)!==id)throw new ShopError(400,'Identificador divergente.');
 try{await synchronizePayment(id);}catch(e){if(e instanceof ShopError&&e.status===404)return json({received:true});throw e;}
 await getDb().update(shopConfig).set({webhookAt:new Date().toISOString()}).where(eq(shopConfig.id,'mercado-pago'));return json({received:true});
 }catch(e){return shopError(e);}}
