import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {adminEmail} from '../lib/maccoloco';
import {parseAuthCookies,validatedUser} from '../lib/password-auth-core';
import {passwordAuthConfig} from '../lib/password-auth-server';
export type MaccolocoUser={userId:string;displayName:string;email:string;fullName:string|null};
export async function getMaccolocoUser():Promise<MaccolocoUser|null>{
 const config=passwordAuthConfig();if(!config)return null;const h=await headers();const token=parseAuthCookies(h.get('cookie')).access;
 const user=await validatedUser(config,token,adminEmail);return user?{userId:user.id,displayName:'Direção MaccoLoco',email:user.email.toLowerCase(),fullName:null}:null;
}
export async function requireMaccolocoUser(_returnTo:string):Promise<MaccolocoUser>{const user=await getMaccolocoUser();if(user)return user;redirect('/login');}
export function maccolocoSignInPath(_returnTo:string){return '/login';}
export function maccolocoSignOutPath(_returnTo='/'){return '/login';}
