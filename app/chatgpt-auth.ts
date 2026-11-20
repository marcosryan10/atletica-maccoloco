import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {env} from 'cloudflare:workers';
import {verifyAccessIdentity} from '../lib/cloudflare-access';
export type ChatGPTUser={userId:string;displayName:string;email:string;fullName:string|null};
// Standalone Cloudflare deployment: identity headers from the old host are never trusted.
export async function getChatGPTUser():Promise<ChatGPTUser|null>{
 const h=await headers();const settings=env as unknown as Record<string,string>;
 const cookie=h.get('cookie')?.split(';').map(c=>c.trim()).find(c=>c.startsWith('CF_Authorization='))?.slice('CF_Authorization='.length)||null;
 return verifyAccessIdentity(h.get('Cf-Access-Jwt-Assertion')||cookie,{teamDomain:settings.CF_ACCESS_TEAM_DOMAIN||'',audience:settings.CF_ACCESS_AUD||''});
}
export async function requireChatGPTUser(_returnTo:string):Promise<ChatGPTUser>{const user=await getChatGPTUser();if(user)return user;redirect('/acesso');}
export function chatGPTSignInPath(_returnTo:string){return '/acesso';}
export function chatGPTSignOutPath(_returnTo='/'){return '/cdn-cgi/access/logout';}
