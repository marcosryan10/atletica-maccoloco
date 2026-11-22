import {buyerTicket} from '../../../lib/order-tickets';
import {env} from 'cloudflare:workers';
import {getAuthenticatedIdentity} from '../../../lib/identity-server';
import {json,readJSON,shopError,ShopError,sessionCookie,sha256,limitShop} from '../../../lib/shop-server';
export const dynamic='force-dynamic';
async function customer(){const user=await getAuthenticatedIdentity();if(!user)throw new ShopError(401,'Entre na sua conta para continuar.');return user;}
export async function GET(){try{const user=await customer();const [orders,notifications,tickets]=await Promise.all([
 env.DB!.prepare('SELECT id,product_name AS productName,size,quantity,total_cents AS totalCents,status,fulfillment,payment_method AS paymentMethod,delivery_info AS deliveryInfo,created_at AS createdAt FROM shop_orders WHERE customer_user_id=? ORDER BY created_at DESC LIMIT 100').bind(user.id).all(),
 env.DB!.prepare('SELECT id,order_id AS orderId,title,body,read_at AS readAt,created_at AS createdAt FROM customer_notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100').bind(user.id).all(),
 env.DB!.prepare("SELECT t.id,t.token,t.used_at,t.revoked_at,t.order_id,e.name AS event_name,e.starts_at,e.location,o.status AS order_status,o.mode FROM event_tickets t JOIN shop_orders o ON o.id=t.order_id JOIN ticket_events e ON e.id=t.event_id WHERE o.customer_user_id=? AND o.status='paid' AND o.mode='live' ORDER BY t.id DESC LIMIT 1000").bind(user.id).all()
 ]);return json({profile:{email:user.email},orders:orders.results,tickets:tickets.results.map(buyerTicket),notifications:notifications.results});}catch(e){return shopError(e);}}
export async function POST(request:Request){try{if(request.headers.get('origin')!==new URL(request.url).origin)throw new ShopError(403,'Origem não permitida.');const user=await customer(),b=await readJSON(request);await limitShop(request,'customer-action',30);
 if(b.action==='read'){if(typeof b.id!=='string'||b.id.length>80)throw new ShopError(400,'Notificação inválida.');await env.DB!.prepare('UPDATE customer_notifications SET read_at=COALESCE(read_at,?) WHERE id=? AND user_id=?').bind(new Date().toISOString(),b.id,user.id).run();return json({ok:true});}
 if(b.action==='link-orders'){const token=sessionCookie(request).token;if(!token)return json({ok:true,linked:0});const result=await env.DB!.prepare('UPDATE shop_orders SET customer_user_id=? WHERE customer_user_id IS NULL AND owner_hash=? AND lower(email)=? RETURNING id').bind(user.id,await sha256(token),user.email.toLowerCase()).all();return json({ok:true,linked:result.results.length});}
 throw new ShopError(400,'Ação inválida.');
 }catch(e){return shopError(e);}}
