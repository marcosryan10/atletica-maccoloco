import handler from 'vinext/server/fetch-handler';
export default {async fetch(request:Request,env:Cloudflare.Env,ctx:ExecutionContext){
 const response=await handler.fetch(request,env,ctx);
 const secured=new Response(response.body,response);
 secured.headers.set('X-Content-Type-Options','nosniff');
 secured.headers.set('Referrer-Policy','same-origin');
 secured.headers.set('Permissions-Policy',new URL(request.url).pathname==='/admin'?'camera=(self), microphone=(), geolocation=()':'camera=(), microphone=(), geolocation=()');
 if(/^\/(login|admin|minha-conta|api\/auth|api\/customer|api\/admin)(\/|$)/.test(new URL(request.url).pathname)){secured.headers.set('Cache-Control','private, no-store');secured.headers.set('Referrer-Policy','no-referrer');secured.headers.set('X-Frame-Options','DENY');secured.headers.set('Content-Security-Policy',"frame-ancestors 'none'; base-uri 'self'; form-action 'self'");}
 return secured;
}};
