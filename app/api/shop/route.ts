import {env} from 'cloudflare:workers';
import {getDb} from '../../../db';
import {shopProducts} from '../../../db/schema';
import {eq} from 'drizzle-orm';
import {json,publicConfig,shopError} from '../../../lib/shop-server';
import {productView} from '../../../lib/shop';
import {productTemplates} from '../../../lib/shop-templates';
export const dynamic='force-dynamic';
export async function GET(){try{const db=getDb();const products=await db.select().from(shopProducts).where(eq(shopProducts.active,1)).limit(100);const existing=products.length?products:await db.select({id:shopProducts.id}).from(shopProducts).limit(1);const events=products.some(p=>p.includesOpenBar)?(await env.DB!.prepare('SELECT id,bar_starts_at,bar_ends_at FROM ticket_events').all<any>()).results:[];return json({products:existing.length?products.map(p=>({...productView(p),barStartsAt:events.find(e=>e.id===p.ticketEventId)?.bar_starts_at||null,barEndsAt:events.find(e=>e.id===p.ticketEventId)?.bar_ends_at||null})):productTemplates,payment:await publicConfig()});}catch(e){return shopError(e);}}
