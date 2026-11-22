import {orderTickets} from '../../../../lib/order-tickets';
import {getDb} from '../../../../db';
import {shopOrders} from '../../../../db/schema';
import {and,eq,or,isNull} from 'drizzle-orm';
import {getAuthenticatedIdentity} from '../../../../lib/identity-server';
import {json,shopError,ShopError,sessionCookie,sha256} from '../../../../lib/shop-server';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const id=new URL(request.url).searchParams.get('id'),token=sessionCookie(request).token,user=await getAuthenticatedIdentity();if(!id||(!token&&!user))throw new ShopError(404,'Pedido não encontrado. Entre na sua conta ou use o navegador da compra.');const owner=or(...(token?[and(isNull(shopOrders.customerUserId),eq(shopOrders.ownerHash,await sha256(token)))]:[]),...(user?[eq(shopOrders.customerUserId,user.id)]:[]));const [order]=await getDb().select().from(shopOrders).where(and(eq(shopOrders.id,id),owner));if(!order)throw new ShopError(404,'Pedido não encontrado. Entre em contato com a direção.');return json({tickets:await orderTickets(order),hasTickets:!!order.ticketEventId,id:order.id,productName:order.productName,size:order.size,quantity:order.quantity,totalCents:order.totalCents,status:order.status,fulfillment:order.fulfillment,mode:order.mode,paymentMethod:order.paymentMethod,pixPayload:order.status==='pending'?order.pixPayload:null,receiverName:order.receiverName,deliveryInfo:order.deliveryInfo,confirmedAt:order.confirmedAt});}catch(e){return shopError(e);}}
