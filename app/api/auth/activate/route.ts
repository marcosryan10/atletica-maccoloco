import {directionForEmail} from '../../../../lib/direction-access';
import {normalizedEmail,validEmail} from '../../../../lib/access-core';
import {providerRequest} from '../../../../lib/password-auth-core';
import {authBody,authLimit,requireConfig,authJSON,authFailure} from '../../../../lib/password-auth-server';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{const b=await authBody(request),config=requireConfig();await authLimit(request,'activate',3,3600);const email=normalizedEmail(b.email);if(validEmail(email)&&await directionForEmail(email))await providerRequest(config,'/otp?redirect_to='+encodeURIComponent(new URL(request.url).origin+'/login/redefinir'),{method:'POST',body:{email,create_user:true}});return authJSON({ok:true,message:'Se o e-mail estiver autorizado e puder receber mensagens, você receberá um link para definir sua senha.'});}catch(e){return authFailure(e);}}
