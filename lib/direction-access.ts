import {env} from 'cloudflare:workers';
import {adminEmail} from './maccoloco';
import {allPermissions,normalizedEmail,normalizedPermissions,verifiedIdentity,type DirectionAccess} from './access-core';
type Row={id:string;email:string;name:string;permissions:string;active:number;auth_user_id:string|null};
export async function directionForEmail(email:unknown):Promise<DirectionAccess|null>{
  const normalized=normalizedEmail(email);
  if(normalized===adminEmail)return {id:'owner',email:adminEmail,name:'Administração MaccoLoco',permissions:[...allPermissions],active:true,owner:true,userId:null};
  if(!env.DB)return null;
  try{const row=await env.DB.prepare('SELECT id,email,name,permissions,active,auth_user_id FROM direction_access WHERE email=? AND active=1').bind(normalized).first<Row>();
    if(!row)return null;const permissions=normalizedPermissions(JSON.parse(row.permissions));if(!permissions.length)return null;
    return {id:row.id,email:row.email,name:row.name,permissions,active:true,owner:false,userId:row.auth_user_id};
  }catch{return null;}
}
export async function directionForUser(user:any,bind=false):Promise<DirectionAccess|null>{
  if(!verifiedIdentity(user))return null;const access=await directionForEmail(user.email);if(!access)return null;
  if(access.owner)return {...access,userId:user.id};
  if(access.userId&&access.userId!==user.id)return null;
  if(!access.userId){
    if(!bind)return null;
    await env.DB!.prepare('UPDATE direction_access SET auth_user_id=?,updated_at=? WHERE id=? AND active=1 AND auth_user_id IS NULL').bind(user.id,new Date().toISOString(),access.id).run();
  }
  const current=await directionForEmail(user.email);
  return current&&current.userId===user.id?current:null;
}
