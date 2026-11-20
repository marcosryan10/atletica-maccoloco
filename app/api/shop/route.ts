import {getDb} from '../../../db';
import {shopProducts} from '../../../db/schema';
import {eq} from 'drizzle-orm';
import {json,publicConfig,shopError} from '../../../lib/shop-server';
import {productView} from '../../../lib/shop';
import {productTemplates} from '../../../lib/shop-templates';
export const dynamic='force-dynamic';
export async function GET(){try{const db=getDb();const products=await db.select().from(shopProducts).where(eq(shopProducts.active,1)).limit(100);const existing=products.length?products:await db.select({id:shopProducts.id}).from(shopProducts).limit(1);return json({products:existing.length?products.map(productView):productTemplates,payment:await publicConfig()});}catch(e){return shopError(e);}}
