import handler from 'vinext/server/fetch-handler';
export default {async fetch(request:Request,env:Cloudflare.Env,ctx:ExecutionContext){
 const url=new URL(request.url);
 if(url.protocol==='http:'&&!['localhost','127.0.0.1','[::1]'].includes(url.hostname)){url.protocol='https:';return Response.redirect(url.toString(),308);}
 const response=await handler.fetch(request,env,ctx);
 const secured=new Response(response.body,response);
 secured.headers.delete('X-Powered-By');
 secured.headers.set('X-Content-Type-Options','nosniff');
 secured.headers.set('Referrer-Policy','same-origin');
 secured.headers.set('X-Frame-Options','DENY');
 secured.headers.set('Content-Security-Policy',"frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'");
 if(url.protocol==='https:')secured.headers.set('Strict-Transport-Security','max-age=31536000');
 secured.headers.set('Permissions-Policy',url.pathname==='/admin'?'camera=(self), microphone=(), geolocation=()':'camera=(), microphone=(), geolocation=()');
 if(/^\/(login|admin|minha-conta|pedido|api\/auth|api\/customer|api\/admin|api\/shop\/(order|checkout))(\/|$)/.test(url.pathname)){
 secured.headers.set('Cache-Control','private, no-store');secured.headers.set('Referrer-Policy','no-referrer');
 }
 return secured;
}};
