import {createRemoteJWKSet,jwtVerify} from 'jose';
type AccessConfig={teamDomain:string;audience:string};
const keySets=new Map<string,ReturnType<typeof createRemoteJWKSet>>();
export function accessConfigured(config:AccessConfig){return /^[a-z0-9][a-z0-9-]*\.cloudflareaccess\.com$/i.test(config.teamDomain)&&/^[a-f0-9]{64}$/i.test(config.audience);}
export async function verifyAccessIdentity(token:string|null,config:AccessConfig,providedKeys?:Parameters<typeof jwtVerify>[1]){
 if(!token||token.length>20000||!accessConfigured(config))return null;
 try{
 const issuer='https://'+config.teamDomain.toLowerCase();
 let keys=providedKeys||keySets.get(issuer);if(!keys){keys=createRemoteJWKSet(new URL(issuer+'/cdn-cgi/access/certs'),{cacheMaxAge:3600000,cooldownDuration:30000});keySets.set(issuer,keys as ReturnType<typeof createRemoteJWKSet>);}
 const {payload}=await jwtVerify(token,keys,{issuer,audience:config.audience,algorithms:['RS256'],requiredClaims:['sub','email','exp','iat'],clockTolerance:15});
 if(typeof payload.sub!=='string'||typeof payload.email!=='string'||payload.type!=='app')return null;
 return {userId:payload.sub,email:payload.email.toLowerCase(),displayName:typeof payload.name==='string'?payload.name:payload.email,fullName:typeof payload.name==='string'?payload.name:null};
 }catch{return null;}
}
