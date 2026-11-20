import { getDb } from '../../../db';
import { publications } from '../../../db/schema';
import { initialNews } from '../../../lib/maccoloco';
export const dynamic='force-dynamic';
export async function GET(){
 try { const rows=await getDb().select().from(publications);const merged=new Map(initialNews.map(n=>[n.id,n]));for(const row of rows)merged.set(row.id,row as any);return Response.json([...merged.values()].filter(x=>x.published===1),{headers:{'Cache-Control':'no-store'}}); }
 catch { return Response.json({error:'As novidades estão indisponíveis no momento.'},{status:503}); }
}
