import {authBody,authLimit,refreshResponse,authFailure,clearSession} from '../../../../lib/password-auth-server';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{const b=await authBody(request);await authLimit(request,'refresh',30);return await refreshResponse(request,b.audience==='customer'?'customer':'direction');}catch(e){return clearSession(authFailure(e));}}
