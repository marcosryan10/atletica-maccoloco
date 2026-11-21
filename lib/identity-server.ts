import {headers} from 'next/headers';
import {passwordAuthConfig} from './password-auth-server';
import {parseAuthCookies,providerRequest,tokenValue} from './password-auth-core';
import {verifiedIdentity} from './access-core';
export async function identityFromToken(token:unknown){const config=passwordAuthConfig();if(!config||!tokenValue(token))return null;try{const user=await providerRequest(config,'/user',{token});return verifiedIdentity(user)?user:null;}catch{return null;}}
export async function getAuthenticatedIdentity(){const h=await headers();return identityFromToken(parseAuthCookies(h.get('cookie')).access);}
