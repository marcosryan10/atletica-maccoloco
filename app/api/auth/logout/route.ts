import {parseAuthCookies,providerRequest} from '../../../../lib/password-auth-core';
import {authBody,passwordAuthConfig,clearSession,authJSON,authFailure} from '../../../../lib/password-auth-server';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{await authBody(request);const c=passwordAuthConfig(),tokens=parseAuthCookies(request.headers.get('cookie'));if(c&&tokens.access){try{await providerRequest(c,'/logout?scope=local',{method:'POST',token:tokens.access});}catch{}}return clearSession(authJSON({ok:true}));}catch(e){return authFailure(e);}}
