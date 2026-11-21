import {env} from 'cloudflare:workers';
import {directionForUser} from './direction-access';
import {verifiedIdentity} from './access-core';
import {sha256} from './payment-core';
import {authConfig,AuthError,sessionCookies,expiredCookies,parseAuthCookies,providerRequest} from './password-auth-core';
export function passwordAuthConfig(){const s=env as unknown as Record<string,string>;return authConfig(s.AUTH_SUPABASE_URL,s.AUTH_SUPABASE_KEY);}
export const authJSON=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'}});
export function authFailure(e:unknown){return e instanceof AuthError?authJSON({error:e.message},e.status):authJSON({error:'O acesso está indisponível no momento. Tente novamente em instantes.'},503);}
export function requireConfig(){const c=passwordAuthConfig();if(!c)throw new AuthError(503,'O login ainda está sendo ativado pela direção.');return c;}
export async function authBody(request:Request){if(new URL(request.url).protocol!=='https:'&&!import.meta.env.DEV)throw new AuthError(403,'Use uma conexão HTTPS.');if(request.headers.get('origin')!==new URL(request.url).origin)throw new AuthError(403,'Origem não permitida.');if(!request.headers.get('content-type')?.includes('application/json'))throw new AuthError(415,'Dados inválidos.');const reader=request.body?.getReader();if(!reader)throw new AuthError(400,'Dados ausentes.');let text='',size=0;const decoder=new TextDecoder();for(;;){const p=await reader.read();if(p.done)break;size+=p.value.length;if(size>12000){await reader.cancel();throw new AuthError(413,'Dados muito extensos.');}text+=decoder.decode(p.value,{stream:true});}text+=decoder.decode();try{const b=JSON.parse(text);if(!b||typeof b!=='object'||Array.isArray(b))throw Error();return b as Record<string,any>;}catch{throw new AuthError(400,'Dados inválidos.');}}
export async function authLimit(request:Request,scope:string,max:number,seconds=600){
 if(!env.DB)throw new AuthError(503,'O acesso está temporariamente indisponível.');const now=Date.now(),bucket=Math.floor(now/(seconds*1000)),ip=request.headers.get('cf-connecting-ip')||'local';const id=await sha256('maccoloco-auth:'+scope+':'+new URL(request.url).hostname+':'+ip+':'+bucket);
 const row=await env.DB.prepare('INSERT INTO shop_rate_limits (id,hits,expires_at) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET hits=hits+1 RETURNING hits').bind(id,(bucket+1)*seconds*1000).first<{hits:number}>();if(!row||row.hits>max)throw new AuthError(429,'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');await env.DB.prepare('DELETE FROM shop_rate_limits WHERE expires_at < ?').bind(now).run();
}
export async function applySession(response:Response,session:any,audience:'direction'|'customer'='direction'){
 if(!verifiedIdentity(session?.user))throw new AuthError(403,'Confirme seu e-mail para acessar.');
 if(audience==='direction'&&!await directionForUser(session.user,true))throw new AuthError(403,'Este acesso não está autorizado pela direção.');
 for(const cookie of sessionCookies(session,session.user.email.toLowerCase()))response.headers.append('Set-Cookie',cookie);return response;
}
export function clearSession(response:Response){for(const cookie of expiredCookies)response.headers.append('Set-Cookie',cookie);return response;}
export async function refreshResponse(request:Request,audience:'direction'|'customer'='direction'){const config=requireConfig(),tokens=parseAuthCookies(request.headers.get('cookie'));if(!tokens.refresh)throw new AuthError(401,'Sua sessão expirou. Entre novamente.');const session=await providerRequest(config,'/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:tokens.refresh}});return applySession(authJSON({ok:true}),session,audience);}
