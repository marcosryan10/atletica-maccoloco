import {authBody,authLimit,refreshResponse,authFailure,clearSession} from '../../../../lib/password-auth-server';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{await authBody(request);await authLimit(request,'refresh',30);return await refreshResponse(request);}catch(e){return clearSession(authFailure(e));}}
