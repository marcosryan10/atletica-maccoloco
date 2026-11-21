import {env} from 'cloudflare:workers';
import {getMaccolocoUser} from '../../../maccoloco-auth';
import {adminEmail} from '../../../../lib/maccoloco';
import {normalizedEmail,validEmail,normalizedPermissions} from '../../../../lib/access-core';
import {readJSON,json,ShopError,shopError} from '../../../../lib/shop-server';
export const dynamic='force-dynamic';
async function owner(){const actor=await getMaccolocoUser();if(!actor?.owner)throw new ShopError(403,'Somente a conta principal da associação pode gerenciar acessos.');return actor;}
export async function GET(){try{await owner();const rows=await env.DB!.prepare('SELECT id,email,name,permissions,active,auth_user_id IS NOT NULL AS activated,created_at,updated_at FROM direction_access ORDER BY name,email').all<any>();return json({members:rows.results.map(row=>({...row,permissions:normalizedPermissions(JSON.parse(row.permissions)),active:Boolean(row.active),activated:Boolean(row.activated)}))});}catch(e){return shopError(e);}}
export async function POST(request:Request){try{
 if(request.headers.get('origin')!==new URL(request.url).origin)throw new ShopError(403,'Origem não permitida.');
 const actor=await owner(),b=await readJSON(request),now=new Date().toISOString();
 const email=normalizedEmail(b.email),name=typeof b.name==='string'?b.name.trim():'',permissions=normalizedPermissions(b.permissions);
 if(b.action!=='save'||!validEmail(email)||email===adminEmail||name.length<2||name.length>100||typeof b.active!=='boolean'||(b.active&&!permissions.length))throw new ShopError(400,'Informe nome, e-mail e pelo menos uma permissão para o acesso ativo. A conta principal é protegida.');
 const id=typeof b.id==='string'&&/^[a-f0-9-]{36}$/.test(b.id)?b.id:crypto.randomUUID();
 const existing=await env.DB!.prepare('SELECT id,email FROM direction_access WHERE id=? OR email=?').bind(id,email).first<{id:string;email:string}>();
 if(existing&&existing.id!==id)throw new ShopError(409,'Este e-mail já está cadastrado. Edite o acesso existente.');
 if(existing&&existing.email!==email)throw new ShopError(400,'O e-mail de um acesso não pode ser alterado. Revogue o anterior e cadastre outro.');
 await env.DB!.batch([
  env.DB!.prepare('INSERT INTO direction_access(id,email,name,permissions,active,created_at,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,permissions=excluded.permissions,active=excluded.active,updated_at=excluded.updated_at').bind(id,email,name,JSON.stringify(permissions),b.active?1:0,now,now),
  env.DB!.prepare('INSERT INTO direction_access_audit(id,actor_id,actor_email,member_id,action,permissions,created_at) VALUES(?,?,?,?,?,?,?)').bind(crypto.randomUUID(),actor.userId,actor.email,id,b.active?'save':'revoke',JSON.stringify(permissions),now)
 ]);return json({ok:true,id});
}catch(e){return shopError(e);}}
