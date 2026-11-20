import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {adminEmail} from '../lib/maccoloco';
import {parseAuthCookies,validatedUser} from '../lib/password-auth-core';
import {passwordAuthConfig} from '../lib/password-auth-server';
export type ChatGPTUser={userId:string;displayName:string;email:string;fullName:string|null};
export async function getChatGPTUser():Promise<ChatGPTUser|null>{
 const config=passwordAuthConfig();if(!config)return null;const h=await headers();const token=parseAuthCookies(h.get('cookie')).access;
 const user=await validatedUser(config,token,adminEmail);return user?{userId:user.id,displayName:'Direção MaccoLoco',email:user.email.toLowerCase(),fullName:null}:null;
}
export async function requireChatGPTUser(_returnTo:string):Promise<ChatGPTUser>{const user=await getChatGPTUser();if(user)return user;redirect('/login');}
export function chatGPTSignInPath(_returnTo:string){return '/login';}
export function chatGPTSignOutPath(_returnTo='/'){return '/login';}
