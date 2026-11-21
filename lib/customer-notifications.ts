import {env} from 'cloudflare:workers';
export function orderNotification(orderId:string,event:string,title:string,body:string,now=new Date().toISOString()){
 return env.DB!.prepare("INSERT OR IGNORE INTO customer_notifications(id,user_id,order_id,event_key,title,body,created_at) SELECT ?,customer_user_id,id,?,?,?,? FROM shop_orders WHERE id=? AND customer_user_id IS NOT NULL AND (? <> 'paid' OR (status='paid' AND confirmed_at=?))")
 .bind(crypto.randomUUID(),orderId+':'+event,title,body,now,orderId,event,now);
}
