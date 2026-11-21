import {adminEmail} from '../../../../lib/maccoloco';
import {directionForEmail} from '../../../../lib/direction-access';
import {normalizedEmail,validEmail} from '../../../../lib/access-core';
import {providerRequest} from '../../../../lib/password-auth-core';
import {authBody,authLimit,requireConfig,authJSON,authFailure} from '../../../../lib/password-auth-server';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{const b=await authBody(request),config=requireConfig();await authLimit(request,'recovery',3,3600);const email=normalizedEmail(b.email),customer=b.audience==='customer';if(validEmail(email)&&(customer||await directionForEmail(email))){const destination=new URL(request.url).origin+'/login/redefinir'+(customer?'?area=cliente':'');await providerRequest(config,'/recover?redirect_to='+encodeURIComponent(destination),{method:'POST',body:{email}});}return authJSON({ok:true,message:'Se o e-mail estiver cadastrado e puder receber mensagens, você receberá um link para definir sua senha.'});}catch(e){return authFailure(e);}}
