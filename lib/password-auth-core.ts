export type AuthConfig={url:string;key:string};
export class AuthError extends Error{status:number;constructor(status:number,message:string){super(message);this.status=status;}}
export function authConfig(url:unknown,key:unknown):AuthConfig|null{
 if(typeof url!=='string'||typeof key!=='string')return null;
 try{const u=new URL(url);if(u.protocol!=='https:'||!/^[-a-z0-9]+\.supabase\.co$/i.test(u.hostname)||u.username||u.password||u.search||u.hash||!['','/'].includes(u.pathname))return null;
 if(key.startsWith('sb_publishable_')&&key.length>30)return {url:u.origin,key};
 const payload=JSON.parse(atob(key.split('.')[1]?.replace(/-/g,'+').replace(/_/g,'/')||''));if(payload.role==='anon')return {url:u.origin,key};
 }catch{}return null;
}
export function confirmedAdmin(user:any,email:string){return Boolean(user&&typeof user.id==='string'&&typeof user.email==='string'&&user.email.toLowerCase()===email.toLowerCase()&&typeof user.email_confirmed_at==='string'&&Number.isFinite(Date.parse(user.email_confirmed_at))&&user.role==='authenticated'&&user.is_anonymous!==true);}
export function tokenValue(value:unknown):value is string{return typeof value==='string'&&/^[A-Za-z0-9._~-]{8,3800}$/.test(value);}
export async function providerRequest(config:AuthConfig,path:string,options:{method?:string;token?:string;body?:unknown}={},transport:typeof fetch=fetch){
 const r=await transport(config.url+'/auth/v1'+path,{method:options.method||'GET',headers:{apikey:config.key,'Content-Type':'application/json',...(options.token?{Authorization:'Bearer '+options.token}:{})},...(options.body===undefined?{}:{body:JSON.stringify(options.body)}),signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw new AuthError(r.status===429?429:r.status>=500?503:401,r.status===429?'Muitas tentativas. Aguarde alguns minutos.':'Não foi possível autenticar. Confira seus dados e tente novamente.');
 if(r.status===204)return null;return await r.json() as any;
}
export async function validatedUser(config:AuthConfig,token:string|null,email:string,transport:typeof fetch=fetch){if(!tokenValue(token))return null;try{const user=await providerRequest(config,'/user',{token},transport);return confirmedAdmin(user,email)?user:null;}catch{return null;}}
export function parseAuthCookies(header:string|null){const cookies=Object.fromEntries((header||'').split(';').map(s=>s.trim()).filter(s=>s.includes('=')).map(s=>{const i=s.indexOf('=');return[s.slice(0,i),s.slice(i+1)];}));return {access:tokenValue(cookies['__Host-macco-access'])?cookies['__Host-macco-access']:null,refresh:tokenValue(cookies['__Host-macco-refresh'])?cookies['__Host-macco-refresh']:null};}
export function sessionCookies(session:any,email:string){
 if(!confirmedAdmin(session?.user,email)||!tokenValue(session?.access_token)||!tokenValue(session?.refresh_token))throw new AuthError(403,'Este acesso não está autorizado ou o e-mail ainda não foi confirmado.');
 const ttl=Number.isFinite(session.expires_in)?Math.max(60,Math.min(3600,Math.floor(session.expires_in))):3600;
 const flags='; Path=/; Secure; HttpOnly; SameSite=Strict';
 return [`__Host-macco-access=${session.access_token}; Max-Age=${ttl}${flags}`,`__Host-macco-refresh=${session.refresh_token}; Max-Age=28800${flags}`];
}
export const expiredCookies=['__Host-macco-access=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Strict','__Host-macco-refresh=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Strict'];
