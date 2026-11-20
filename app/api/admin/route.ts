import { getChatGPTUser } from '../../chatgpt-auth';
import { adminEmail,initialNews } from '../../../lib/maccoloco';
import { getDb } from '../../../db';
import { applications,publications,partners } from '../../../db/schema';
import { desc,eq } from 'drizzle-orm';
import { isMaccoAdmin } from '../../../lib/admin-auth';
export const dynamic='force-dynamic';
const deny=()=>Response.json({error:'Acesso exclusivo da direção autorizada.'},{status:403});
async function authorized(){const user=await getChatGPTUser();return user?isMaccoAdmin(user.email):false;}
export async function GET(){
 if(!await authorized())return deny();
 try{const db=getDb();const [entries,posts,companies]=await Promise.all([db.select().from(applications).orderBy(desc(applications.createdAt)),db.select().from(publications),db.select().from(partners)]);const merged=new Map(initialNews.map(n=>[n.id,n]));for(const row of posts)merged.set(row.id,row as any);return Response.json({applications:entries,publications:[...merged.values()],partners:companies},{headers:{'Cache-Control':'private, no-store'}});}catch{return Response.json({error:'Não foi possível carregar os dados.'},{status:503});}
}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return deny();
 if(!await authorized())return deny();
 if(Number(request.headers.get('content-length')||0)>800000)return Response.json({error:'Conteúdo muito extenso.'},{status:413});
 try{const raw=await request.json();if(!raw||typeof raw!=='object'||Array.isArray(raw))return Response.json({error:'Dados inválidos.'},{status:400});const b=raw as Record<string,any>;const db=getDb();
 if(b.action==='partner'){
 const text=(v:unknown,n:number)=>typeof v==='string'?v.trim().slice(0,n):'';
 const name=text(b.name,100),description=text(b.description,800),image=text(b.image,700001),url=text(b.url,300);
 if(name.length<2||description.length<5||image.length>700000||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(image))return Response.json({error:'Preencha nome, descrição e uma logo PNG, JPG ou WebP de até 500 KB.'},{status:400});
 if(url){try{if(new URL(url).protocol!=='https:')throw Error();}catch{return Response.json({error:'Use um link completo começando com https://.'},{status:400});}}
 const id=typeof b.id==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(b.id)?b.id:crypto.randomUUID();
 const record={id,name,description,image,url,published:b.published?1:0,updatedAt:new Date().toISOString()};
 await db.insert(partners).values(record).onConflictDoUpdate({target:partners.id,set:record});return Response.json({ok:true,id});
 }
 if(b.action==='delete-partner'){
 if(typeof b.id!=='string')return Response.json({error:'Parceiro inválido.'},{status:400});
 await db.delete(partners).where(eq(partners.id,b.id));return Response.json({ok:true});
 }
 if(b.action==='status'){
 if(!['Nova','Em contato','Confirmada','Arquivada'].includes(b.status)||typeof b.id!=='string')return Response.json({error:'Status inválido.'},{status:400});
 const rows=await db.update(applications).set({status:b.status,updatedAt:new Date().toISOString()}).where(eq(applications.id,b.id)).returning({id:applications.id});
 return rows.length?Response.json({ok:true}):Response.json({error:'Inscrição não encontrada.'},{status:404});
 }
 if(b.action==='delete-application'){
 if(typeof b.id!=='string')return Response.json({error:'Inscrição inválida.'},{status:400});
 await db.delete(applications).where(eq(applications.id,b.id));return Response.json({ok:true});
 }
 if(b.action==='publication'){
 const trim=(v:unknown,n:number)=>typeof v==='string'?v.trim().slice(0,n):'';
 const kind=b.kind==='event'?'event':'news';const title=trim(b.title,120),summary=trim(b.summary,300),body=trim(b.body,10000),date=trim(b.date,40),location=trim(b.location,160),category=trim(b.category,40)|| (kind==='event'?'Integração':'Novidades');
 if(title.length<4||summary.length<10||body.length<10||!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(date)||!Number.isFinite(Date.parse(date)))return Response.json({error:'Preencha título, resumo, texto e uma data válida.'},{status:400});
 const id=typeof b.id==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(b.id)?b.id:crypto.randomUUID();
 const record={id,kind,title,summary,body,date,location,category,published:b.published?1:0,updatedAt:new Date().toISOString()};
 await db.insert(publications).values(record).onConflictDoUpdate({target:publications.id,set:record});return Response.json({ok:true,id});
 }
 return Response.json({error:'Ação inválida.'},{status:400});
 }catch{return Response.json({error:'Não foi possível salvar a alteração.'},{status:503});}
}
