import {identityFromToken} from '../../../../lib/identity-server';
import {directionForUser} from '../../../../lib/direction-access';
import {AuthError,providerRequest} from '../../../../lib/password-auth-core';
import {authBody,authLimit,requireConfig,authJSON,authFailure,clearSession} from '../../../../lib/password-auth-server';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{const b=await authBody(request),config=requireConfig();await authLimit(request,'reset',5);if(typeof b.password!=='string'||b.password.length<14||b.password.length>128||b.password!==b.confirm)throw new AuthError(400,'Use uma senha de 14 a 128 caracteres e confirme a mesma senha.');const identity=await identityFromToken(b.token);if(!identity||(b.audience!=='customer'&&!await directionForUser(identity,true)))throw new AuthError(401,'O link expirou ou não é válido. Solicite um novo link.');await providerRequest(config,'/user',{method:'PUT',token:b.token,body:{password:b.password}});try{await providerRequest(config,'/logout?scope=global',{method:'POST',token:b.token});}catch{}return clearSession(authJSON({ok:true}));}catch(e){return authFailure(e);}}
