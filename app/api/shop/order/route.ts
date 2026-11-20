import {getDb} from '../../../../db';
import {shopOrders} from '../../../../db/schema';
import {and,eq} from 'drizzle-orm';
import {json,shopError,ShopError,sessionCookie,sha256} from '../../../../lib/shop-server';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const id=new URL(request.url).searchParams.get('id'),token=sessionCookie(request).token;if(!token||!id)throw new ShopError(404,'Pedido não encontrado neste navegador. Entre em contato com a direção.');const [order]=await getDb().select().from(shopOrders).where(and(eq(shopOrders.id,id),eq(shopOrders.ownerHash,await sha256(token))));if(!order)throw new ShopError(404,'Pedido não encontrado neste navegador. Entre em contato com a direção.');return json({id:order.id,productName:order.productName,size:order.size,quantity:order.quantity,totalCents:order.totalCents,status:order.status,fulfillment:order.fulfillment,mode:order.mode,paymentMethod:order.paymentMethod,pixPayload:order.status==='pending'?order.pixPayload:null,receiverName:order.receiverName,deliveryInfo:order.deliveryInfo,confirmedAt:order.confirmedAt});}catch(e){return shopError(e);}}
