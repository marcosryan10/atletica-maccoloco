import {redirect} from 'next/navigation';
import {getAuthenticatedIdentity} from '../lib/identity-server';
import {directionForUser} from '../lib/direction-access';
import type {Permission} from '../lib/access-core';
export type MaccolocoUser={userId:string;displayName:string;email:string;fullName:string|null;owner:boolean;permissions:Permission[]};
export async function getMaccolocoUser():Promise<MaccolocoUser|null>{
 const identity=await getAuthenticatedIdentity();if(!identity)return null;
 const access=await directionForUser(identity);if(!access)return null;
 return {userId:identity.id,displayName:access.name,email:access.email,fullName:access.name,owner:access.owner,permissions:access.permissions};
}
export async function requireMaccolocoUser(_returnTo:string):Promise<MaccolocoUser>{const user=await getMaccolocoUser();if(user)return user;redirect('/login');}
export function maccolocoSignInPath(_returnTo:string){return '/login';}
export function maccolocoSignOutPath(_returnTo='/'){return '/login';}
