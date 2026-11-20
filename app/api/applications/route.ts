import { getDb } from '../../../db';
import { applications } from '../../../db/schema';
import { and,eq,gt } from 'drizzle-orm';
import { courses,sports } from '../../../lib/maccoloco';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Origem não permitida.'},{status:403});
 if(Number(request.headers.get('content-length')||0)>12000)return Response.json({error:'Dados muito extensos.'},{status:413});
 try {
 const raw=await request.json();if(!raw||typeof raw!=='object'||Array.isArray(raw))return Response.json({error:'Dados inválidos.'},{status:400});const b=raw as Record<string,any>;
 if(b.website)return Response.json({error:'Não foi possível enviar.'},{status:400});
 const clean=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
 const name=clean(b.name,120), email=clean(b.email,160).toLowerCase(),phone=clean(b.phone,30).replace(/\D/g,''),course=clean(b.course,100),semester=clean(b.semester,30),experience=clean(b.experience,50),availability=clean(b.availability,600);
 const selected=Array.isArray(b.sports)?[...new Set(b.sports)].filter(s=>sports.includes(s as string)) as string[]:[];
 if(name.length<3||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||phone.length<10||phone.length>13||!courses.includes(course)||!semester||!selected.length||!['Iniciante','Já pratiquei','Tenho experiência em competições'].includes(experience)||b.consent!==true)return Response.json({error:'Confira nome, e-mail, WhatsApp, curso, período, modalidade, experiência e autorização de contato.'},{status:400});
 const db=getDb();const day=new Date(Date.now()-86400000).toISOString();
 const duplicate=await db.select({id:applications.id}).from(applications).where(and(eq(applications.email,email),gt(applications.createdAt,day))).limit(1);
 if(duplicate.length)return Response.json({error:'Já recebemos uma inscrição deste e-mail nas últimas 24 horas. Para corrigir informações, fale com a direção.'},{status:409});
 const id=crypto.randomUUID();const now=new Date().toISOString();
 await db.insert(applications).values({id,name,email,phone,course,semester,sports:JSON.stringify(selected),experience,availability,status:'Nova',consent:1,createdAt:now,updatedAt:now});
 return Response.json({id,message:'Inscrição recebida. A direção entrará em contato pelo WhatsApp ou e-mail informado.'},{status:201});
 }catch{return Response.json({error:'Não foi possível salvar a inscrição agora. Tente novamente em instantes.'},{status:503});}
}
