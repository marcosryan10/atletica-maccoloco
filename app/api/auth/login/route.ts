import {adminEmail} from '../../../../lib/maccoloco';
import {normalizedEmail,validEmail} from '../../../../lib/access-core';
import {AuthError,providerRequest} from '../../../../lib/password-auth-core';
import {authBody,authLimit,requireConfig,applySession,authJSON,authFailure} from '../../../../lib/password-auth-server';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{const b=await authBody(request),config=requireConfig();await authLimit(request,'login',5);const email=normalizedEmail(b.email);if(!validEmail(email)||typeof b.password!=='string'||b.password.length<1||b.password.length>128)throw new AuthError(401,'E-mail ou senha incorretos.');const session=await providerRequest(config,'/token?grant_type=password',{method:'POST',body:{email,password:b.password}});return await applySession(authJSON({ok:true}),session,b.audience==='customer'?'customer':'direction');}catch(e){return authFailure(e);}}
