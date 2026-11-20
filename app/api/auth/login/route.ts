import {adminEmail} from '../../../../lib/maccoloco';
import {AuthError,providerRequest} from '../../../../lib/password-auth-core';
import {authBody,authLimit,requireConfig,applySession,authJSON,authFailure} from '../../../../lib/password-auth-server';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{const b=await authBody(request),config=requireConfig();await authLimit(request,'login',5);if(typeof b.email!=='string'||b.email.trim().toLowerCase()!==adminEmail||typeof b.password!=='string'||b.password.length<1||b.password.length>128)throw new AuthError(401,'E-mail ou senha incorretos.');const session=await providerRequest(config,'/token?grant_type=password',{method:'POST',body:{email:adminEmail,password:b.password}});return applySession(authJSON({ok:true}),session);}catch(e){return authFailure(e);}}
