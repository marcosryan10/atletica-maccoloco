import {getDb} from '../../../../db';
import {shopProducts,shopOrders,shopManualConfig} from '../../../../db/schema';
import {and,eq,desc,sql,like,or} from 'drizzle-orm';
import {adminOnly,json,shopError,ShopError,readJSON,manualConfig,limitShop} from '../../../../lib/shop-server';
import {productView} from '../../../../lib/shop';
import {cents} from '../../../../lib/payment-core';
import {productTemplates} from '../../../../lib/shop-templates';
import {validPixKey,pixText,canConfirmManual} from '../../../../lib/pix';
import {getMaccolocoUser} from '../../../maccoloco-auth';
import {env} from 'cloudflare:workers';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{
 await adminOnly();const url=new URL(request.url),db=getDb(),mode=url.searchParams.get('mode')==='test'?'test':'live',page=Math.max(0,Math.min(100000,Number(url.searchParams.get('page'))||0)),search=(url.searchParams.get('search')||'').slice(0,100);
 const filter=and(eq(shopOrders.mode,mode),search?or(like(shopOrders.buyer,'%'+search.replace(/[\\%_]/g,'')+'%'),like(shopOrders.email,'%'+search.replace(/[\\%_]/g,'')+'%'),like(shopOrders.productName,'%'+search.replace(/[\\%_]/g,'')+'%')):undefined);
 const [products,orders,counts,stats,ranking,config]=await Promise.all([
 db.select().from(shopProducts),db.select({id:shopOrders.id,buyer:shopOrders.buyer,email:shopOrders.email,phone:shopOrders.phone,productId:shopOrders.productId,productName:shopOrders.productName,size:shopOrders.size,quantity:shopOrders.quantity,totalCents:shopOrders.totalCents,status:shopOrders.status,fulfillment:shopOrders.fulfillment,createdAt:shopOrders.createdAt,mode:shopOrders.mode,paymentMethod:shopOrders.paymentMethod,confirmedAt:shopOrders.confirmedAt,confirmedBy:shopOrders.confirmedBy,paymentNote:shopOrders.paymentNote}).from(shopOrders).where(filter).orderBy(desc(shopOrders.createdAt)).limit(50).offset(Math.floor(page)*50),
 db.select({count:sql<number>`count(*)`}).from(shopOrders).where(filter),
 db.select({paidOrders:sql<number>`count(*)`,buyers:sql<number>`count(distinct ${shopOrders.email})`,units:sql<number>`coalesce(sum(${shopOrders.quantity}),0)`,grossCents:sql<number>`coalesce(sum(${shopOrders.totalCents}),0)`}).from(shopOrders).where(and(eq(shopOrders.mode,mode),eq(shopOrders.status,'paid'))),
 db.select({name:shopOrders.productName,quantity:sql<number>`sum(${shopOrders.quantity})`}).from(shopOrders).where(and(eq(shopOrders.mode,mode),eq(shopOrders.status,'paid'))).groupBy(shopOrders.productId,shopOrders.productName).orderBy(sql`sum(${shopOrders.quantity}) desc`).limit(10),
 manualConfig()]);
 return json({products:products.map(productView),orders,total:counts[0].count,stats:stats[0],ranking,config});
 }catch(e){return shopError(e);}}
export async function POST(request:Request){try{
 await adminOnly(request);const b=await readJSON(request,720000),db=getDb(),now=new Date().toISOString();
 if(b.action==='seed'){
 for(const p of productTemplates)await db.insert(shopProducts).values({id:p.id,name:p.name,category:p.category,description:p.description,priceCents:null,image:'',sizes:JSON.stringify(p.sizes),active:1,illustration:p.illustration,deliveryInfo:'',updatedAt:now}).onConflictDoNothing();return json({ok:true});
 }
 if(b.action==='product'){
 const p=b.product;if(!p||typeof p!=='object')throw new ShopError(400,'Produto inválido.');const text=(v:unknown,max:number)=>typeof v==='string'&&v.length<=max?v.trim():'';
 const name=text(p.name,100),category=text(p.category,40),description=text(p.description,600),deliveryInfo=text(p.deliveryInfo||'',600),id=text(p.id,80),sizes=Array.isArray(p.sizes)?[...new Set(p.sizes)].filter((s):s is string=>typeof s==='string'&&s.trim().length>0&&s.length<=30).map(s=>s.trim()):[];let image=text(p.image,700000);
 const price=p.price===null?null:cents(p.price);if(name.length<2||!category||!sizes.length||sizes.length>20||!/^[-a-zA-Z0-9]{1,80}$/.test(id)||(p.price!==null&&(price===null||price<100||price>10000000))||(image&&!/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(image)&&!/^\/api\/shop\/image\?id=[a-f0-9-]{36}$/.test(image)))throw new ShopError(400,'Confira nome, categoria, opções, imagem e preço (mínimo R$ 1,00 ou deixe em branco).');
 if(image.startsWith('data:')){
 const match=image.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/)!;let bytes:Uint8Array;try{bytes=Uint8Array.from(atob(match[2]),c=>c.charCodeAt(0));}catch{throw new ShopError(400,'Imagem inválida.');}
 const png=match[1]==='png'&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v),jpg=match[1]==='jpeg'&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255,webp=match[1]==='webp'&&new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
 if(bytes.length>500*1024||!(png||jpg||webp))throw new ShopError(400,'O arquivo não é uma imagem PNG, JPG ou WebP válida de até 500 KB.');
 if(env.BUCKET){const imageId=crypto.randomUUID();await env.BUCKET.put('shop/'+imageId,bytes,{httpMetadata:{contentType:'image/'+match[1]}});image='/api/shop/image?id='+imageId;}else if(bytes.length>200*1024){throw new ShopError(400,'Use uma imagem de até 200 KB.');}
 }
 const record={id,name,category,description,deliveryInfo,image,sizes:JSON.stringify(sizes),priceCents:price,active:p.active?1:0,illustration:['abada','tirante','other'].includes(p.illustration)?p.illustration:'other',updatedAt:now};
 await db.insert(shopProducts).values(record).onConflictDoUpdate({target:shopProducts.id,set:record});return json({ok:true});
 }
 if(b.action==='delete-product'){if(typeof b.id!=='string')throw new ShopError(400,'Produto inválido.');await db.delete(shopProducts).where(eq(shopProducts.id,b.id));return json({ok:true});}
 if(b.action==='fulfillment'){
 if(!['Pendente','Em preparação','Pronto para retirada','Entregue'].includes(b.value)||typeof b.id!=='string')throw new ShopError(400,'Situação inválida.');
 const changed=await db.update(shopOrders).set({fulfillment:b.value,updatedAt:now}).where(and(eq(shopOrders.id,b.id),eq(shopOrders.status,'paid'))).returning({id:shopOrders.id});if(!changed.length)throw new ShopError(409,'Somente pedidos com pagamento confirmado podem ser preparados ou entregues.');return json({ok:true});
 }
 if(b.action==='confirm-manual'){
 await limitShop(request,'admin-confirm',30);
 if(typeof b.id!=='string'||typeof b.note!=='string'||b.note.trim().length<3||b.note.length>160||b.confirmReceived!==true)throw new ShopError(400,'Confirme o recebimento e registre uma referência da conferência.');
 const [order]=await db.select().from(shopOrders).where(eq(shopOrders.id,b.id));
 if(!order||!canConfirmManual(order)||b.totalCents!==order.totalCents)throw new ShopError(409,'Pedido indisponível para confirmação. Atualize a lista.');
 const user=await getMaccolocoUser();if(!user)throw new ShopError(403,'Acesso não autorizado.');
 const changed=await db.update(shopOrders).set({status:'paid',confirmedAt:now,confirmedBy:user.email,paymentNote:b.note.trim(),updatedAt:now}).where(and(eq(shopOrders.id,order.id),eq(shopOrders.status,'pending'),eq(shopOrders.paymentMethod,order.paymentMethod))).returning({id:shopOrders.id});
 if(!changed.length)throw new ShopError(409,'Este pedido já foi atualizado.');return json({ok:true});
 }
 if(b.action==='configure-manual'){
 await limitShop(request,'admin-configure',10);
 const pixKey=typeof b.pixKey==='string'?b.pixKey.trim():'',receiverName=typeof b.receiverName==='string'?b.receiverName.trim():'',receiverCity=typeof b.receiverCity==='string'?b.receiverCity.trim():'';
 if(pixKey.length>77||receiverName.length>120||receiverCity.length>80||typeof b.pixEnabled!=='boolean'||typeof b.cashEnabled!=='boolean'||(pixKey&&!validPixKey(pixKey))||(b.pixEnabled&&(!validPixKey(pixKey)||!pixText(receiverName,25)||!pixText(receiverCity,15)||b.confirmReceiver!==true)))throw new ShopError(400,'Confira a chave Pix, titular, cidade e a autorização do recebedor.');
 const row={id:'manual',pixKey,receiverName,receiverCity,pixEnabled:b.pixEnabled?1:0,cashEnabled:b.cashEnabled?1:0,updatedAt:now};
 await db.insert(shopManualConfig).values(row).onConflictDoUpdate({target:shopManualConfig.id,set:row});return json({ok:true});
 }
 throw new ShopError(400,'Ação inválida.');
 }catch(e){return shopError(e);}}
