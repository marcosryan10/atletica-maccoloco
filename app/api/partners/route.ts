import { getDb } from '../../../db';
import { partners } from '../../../db/schema';
import { eq } from 'drizzle-orm';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await getDb().select({id:partners.id,name:partners.name,description:partners.description,image:partners.image,url:partners.url}).from(partners).where(eq(partners.published,1)),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Não foi possível carregar os parceiros.'},{status:503});}}
