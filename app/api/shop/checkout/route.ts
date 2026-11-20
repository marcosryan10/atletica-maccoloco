import {getDb} from '../../../../db';
import {shopProducts,shopOrders} from '../../../../db/schema';
import {and,eq} from 'drizzle-orm';
import {json,shopError,ShopError,readJSON,paymentConfig,isShopAdmin,limitShop,mpFetch,sessionCookie,sha256} from '../../../../lib/shop-server';
import {trustedCheckoutURL} from '../../../../lib/payment-core';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 const origin=new URL(request.url).origin;if(request.headers.get('origin')!==origin)throw new ShopError(403,'Origem não permitida.');
 const config=await paymentConfig();if(!config||!['test','live'].includes(config.mode))throw new ShopError(503,'As vendas ainda não estão habilitadas.');if(config.mode==='test'&&!await isShopAdmin())throw new ShopError(403,'Checkout de teste exclusivo da direção.');
 const b=await readJSON(request);const name=typeof b.name==='string'?b.name.trim():'',email=typeof b.email==='string'?b.email.trim().toLowerCase():'',phone=typeof b.phone==='string'?b.phone.replace(/\D/g,''):'';
 if(name.length<3||name.length>120||email.length>160||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||phone.length<10||phone.length>13||!Number.isInteger(b.quantity)||b.quantity<1||b.quantity>10||typeof b.productId!=='string'||typeof b.size!=='string'||b.consent!==true||!/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(b.requestKey||''))throw new ShopError(400,'Confira nome, e-mail, WhatsApp, tamanho, quantidade e ciência sobre os dados.');
 const cookie=sessionCookie(request),token=cookie.token||Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join(''),ownerHash=await sha256(token),requestKey=await sha256(ownerHash+':'+b.requestKey);const db=getDb();
 let [existing]=await db.select().from(shopOrders).where(eq(shopOrders.requestKey,requestKey));
 const reply=(order:any)=>{const result=json({orderId:order.id,checkoutUrl:order.checkoutUrl},201);result.headers.set('Set-Cookie',`${cookie.name}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${origin.startsWith('https:')?'; Secure':''}`);return result;};
 if(existing){if(existing.checkoutUrl&&trustedCheckoutURL(existing.checkoutUrl))return reply(existing);throw new ShopError(409,'Este pedido está sendo preparado ou falhou. Aguarde e atualize a página para tentar novamente.');}
 await limitShop(request,'checkout');
 const [product]=await db.select().from(shopProducts).where(and(eq(shopProducts.id,b.productId),eq(shopProducts.active,1)));if(!product||!product.priceCents||product.priceCents<100||product.deliveryInfo.trim().length<5||!JSON.parse(product.sizes).includes(b.size))throw new ShopError(400,'Este produto, preço, entrega ou tamanho não está disponível para compra.');
 const id=crypto.randomUUID(),now=new Date().toISOString(),total=product.priceCents*b.quantity;
 const inserted=await db.insert(shopOrders).values({id,requestKey,ownerHash,buyer:name,email,phone,productId:product.id,productName:product.name,size:b.size,quantity:b.quantity,unitCents:product.priceCents,totalCents:total,status:'creating',mode:config.mode,consentAt:now,createdAt:now,updatedAt:now}).onConflictDoNothing({target:shopOrders.requestKey}).returning({id:shopOrders.id});
 if(!inserted.length)throw new ShopError(409,'O pedido já está sendo preparado. Aguarde alguns segundos.');
 try{
 const returnUrl=origin+'/pedido?id='+id;
 const preference=await mpFetch('/checkout/preferences',config.token,{method:'POST',headers:{'X-Idempotency-Key':id},body:JSON.stringify({items:[{id:product.id,title:product.name+' · '+b.size,description:product.description.slice(0,200),quantity:b.quantity,currency_id:'BRL',unit_price:product.priceCents/100}],payer:{name,email},external_reference:id,metadata:{maccoloco_order_id:id},back_urls:{success:returnUrl,pending:returnUrl,failure:returnUrl},auto_return:'approved',notification_url:origin+'/api/shop/webhook?source_news=webhooks',expires:true,expiration_date_to:new Date(Date.now()+86400000).toISOString(),statement_descriptor:'MACCOLOCO'})});
 const url=config.mode==='test'?preference.sandbox_init_point:preference.init_point;if(!trustedCheckoutURL(url)||!preference.id)throw new ShopError(502,'O Mercado Pago não retornou um checkout válido.');
 await db.update(shopOrders).set({preferenceId:String(preference.id),checkoutUrl:url,status:'pending',updatedAt:new Date().toISOString()}).where(and(eq(shopOrders.id,id),eq(shopOrders.status,'creating')));return reply({id,checkoutUrl:url});
 }catch(e){await db.update(shopOrders).set({status:'checkout_error',updatedAt:new Date().toISOString()}).where(and(eq(shopOrders.id,id),eq(shopOrders.status,'creating')));throw e;}
 }catch(e){return shopError(e);}}
