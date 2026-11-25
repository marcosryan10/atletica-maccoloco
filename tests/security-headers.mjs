import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(join(tmpdir(),'macco-headers-'));
try{
 const outfile=join(dir,'worker.mjs');
 await build({entryPoints:[resolve('worker/index.ts')],outfile,bundle:true,platform:'node',format:'esm',plugins:[{name:'handler-fixture',setup(b){b.onResolve({filter:/^vinext\/server\/fetch-handler$/},()=>({path:'handler',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:`export default {fetch:async()=>new Response('fixture',{headers:{'X-Powered-By':'fixture','Cache-Control':'public, max-age=3600'}})};`,loader:'js'}));}}]});
 const worker=(await import(pathToFileURL(outfile))).default;
 for(const path of ['/','/produtos','/pedido?id=private','/api/shop/order?id=private','/api/shop/checkout','/admin','/login','/minha-conta']){
  const r=await worker.fetch(new Request('https://test.example'+path),{},{});
  assert.equal(r.headers.get('x-frame-options'),'DENY');
  assert.equal(r.headers.get('strict-transport-security'),'max-age=31536000');
  assert.equal(r.headers.get('x-powered-by'),null);
  assert.match(r.headers.get('content-security-policy'),/object-src 'none'/);
  assert.match(r.headers.get('content-security-policy'),/frame-ancestors 'none'/);
  assert.equal(r.headers.get('x-content-type-options'),'nosniff');
  if(!['/','/produtos'].includes(path)){
   assert.equal(r.headers.get('cache-control'),'private, no-store');
   assert.equal(r.headers.get('referrer-policy'),'no-referrer');
  }
  assert.equal(r.headers.get('permissions-policy').includes('camera=(self)'),path==='/admin');
 }
 const redirect=await worker.fetch(new Request('http://test.example/pedido?id=abc'),{},{});
 assert.equal(redirect.status,308);assert.equal(redirect.headers.get('location'),'https://test.example/pedido?id=abc');
 assert.equal((await worker.fetch(new Request('http://127.0.0.1:5173/'),{},{})).status,200);
 console.log('PASS proteção de páginas públicas e privadas, pagamento sem cache/referrer, bloqueio de frames, HTTPS e câmera restrita ao painel.');
}finally{assert.equal(resolve(dirname(dir)),resolve(tmpdir()));await rm(dir,{recursive:true,force:true});}
