import {adminEmail} from '../../../../lib/maccoloco';
import {providerRequest} from '../../../../lib/password-auth-core';
import {authBody,authLimit,requireConfig,authJSON,authFailure} from '../../../../lib/password-auth-server';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{const b=await authBody(request),config=requireConfig();await authLimit(request,'recovery',3,3600);if(typeof b.email==='string'&&b.email.trim().toLowerCase()===adminEmail)await providerRequest(config,'/recover?redirect_to='+encodeURIComponent(new URL(request.url).origin+'/login/redefinir'),{method:'POST',body:{email:adminEmail}});return authJSON({ok:true,message:'Se o e-mail estiver autorizado e cadastrado, você receberá um link para definir sua senha.'});}catch(e){return authFailure(e);}}
