import {getDb} from '../../../../db';
import {shopProducts,shopOrders} from '../../../../db/schema';
import {and,eq} from 'drizzle-orm';
import {json,shopError,ShopError,readJSON,manualConfig,limitShop,sessionCookie,sha256} from '../../../../lib/shop-server';
import {pixPayload} from '../../../../lib/pix';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 const origin=new URL(request.url).origin;if(request.headers.get('origin')!==origin)throw new ShopError(403,'Origem não permitida.');
 const b=await readJSON(request),method=b.paymentMethod;
 const name=typeof b.name==='string'?b.name.trim():'',email=typeof b.email==='string'?b.email.trim().toLowerCase():'',phone=typeof b.phone==='string'?b.phone.replace(/\D/g,''):'';
 if(!['pix','cash'].includes(method)||name.length<3||name.length>120||email.length>160||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||phone.length<10||phone.length>13||!Number.isInteger(b.quantity)||b.quantity<1||b.quantity>10||typeof b.productId!=='string'||typeof b.size!=='string'||b.consent!==true||!/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(b.requestKey||''))throw new ShopError(400,'Confira os dados do pedido e a forma de pagamento.');
 const cookie=sessionCookie(request),token=cookie.token||Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join(''),ownerHash=await sha256(token),requestKey=await sha256(ownerHash+':'+b.requestKey),db=getDb();
 const reply=(id:string)=>{const result=json({orderId:id,checkoutUrl:'/pedido?id='+id},201);result.headers.set('Set-Cookie',cookie.name+'='+token+'; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000'+(origin.startsWith('https:')?'; Secure':''));return result;};
 const [existing]=await db.select({id:shopOrders.id}).from(shopOrders).where(eq(shopOrders.requestKey,requestKey));if(existing)return reply(existing.id);
 await limitShop(request,'checkout');
 const config=await manualConfig();if((method==='pix'&&!config.pixEnabled)||(method==='cash'&&!config.cashEnabled))throw new ShopError(503,'Esta forma de pagamento ainda não está disponível.');
 const [product]=await db.select().from(shopProducts).where(and(eq(shopProducts.id,b.productId),eq(shopProducts.active,1)));
 if(!product||!product.priceCents||product.priceCents<100||product.deliveryInfo.trim().length<5||!JSON.parse(product.sizes).includes(b.size))throw new ShopError(400,'Este produto, preço, retirada ou tamanho não está disponível.');
 const id=crypto.randomUUID(),now=new Date().toISOString(),total=product.priceCents*b.quantity;
 const code=method==='pix'?pixPayload({key:config.pixKey,name:config.receiverName,city:config.receiverCity,cents:total,reference:'ML'+id.replace(/-/g,'').slice(0,23)}):null;
 const inserted=await db.insert(shopOrders).values({id,requestKey,ownerHash,buyer:name,email,phone,productId:product.id,productName:product.name,size:b.size,quantity:b.quantity,unitCents:product.priceCents,totalCents:total,status:'pending',mode:'live',paymentMethod:method,pixPayload:code,receiverName:method==='pix'?config.receiverName:null,deliveryInfo:product.deliveryInfo,consentAt:now,createdAt:now,updatedAt:now}).onConflictDoNothing({target:shopOrders.requestKey}).returning({id:shopOrders.id});
 if(!inserted.length){const [saved]=await db.select({id:shopOrders.id}).from(shopOrders).where(eq(shopOrders.requestKey,requestKey));if(saved)return reply(saved.id);throw new ShopError(409,'O pedido já está sendo preparado.');}return reply(id);
 }catch(e){return shopError(e);}}
