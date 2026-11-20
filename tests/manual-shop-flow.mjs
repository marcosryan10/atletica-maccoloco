import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
const sqlite=new DatabaseSync(':memory:');
for(const p of ['0000_misty_lady_mastermind.sql','0001_charming_zaran.sql','0002_redundant_radioactive_man.sql','0003_ancient_mulholland_black.sql'])sqlite.exec(await readFile(new URL('../drizzle/'+p,import.meta.url),'utf8'));
function prepared(sql,params=[]){return {bind(...p){return prepared(sql,p);},async all(){return {results:sqlite.prepare(sql).all(...params),success:true,meta:{}};},async first(){return sqlite.prepare(sql).get(...params)||null;},async raw(){const stmt=sqlite.prepare(sql);stmt.setReturnArrays(true);return stmt.all(...params);},async run(){const r=sqlite.prepare(sql).run(...params);return {success:true,meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)},results:[]};}};}
globalThis.__manualShopTest={env:{DB:{prepare:prepared}},user:null};
const dir=await mkdtemp(join(tmpdir(),'macco-pix-test-'));
try{
 const routes={checkout:'app/api/shop/checkout/route.ts',order:'app/api/shop/order/route.ts',admin:'app/api/admin/shop/route.ts',shop:'app/api/shop/route.ts'};
 const api={};
 for(const [name,path] of Object.entries(routes)){
 const outfile=join(dir,name+'.mjs');
 await build({entryPoints:[resolve(path)],outfile,bundle:true,platform:'node',format:'esm',logLevel:'silent',plugins:[{name:'test-runtime',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'workers',namespace:'fixture'}));b.onResolve({filter:/chatgpt-auth$/},()=>({path:'identity',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:a.path==='workers'?'export const env=globalThis.__manualShopTest.env;':'export async function getChatGPTUser(){return globalThis.__manualShopTest.user;}',loader:'js'}));}}]});
 api[name]=await import(pathToFileURL(outfile));
 }
 const origin='https://test.maccoloco.example';
 const post=(body,cookie='')=>new Request(origin+'/api',{method:'POST',headers:{origin,'content-type':'application/json',cookie},body:JSON.stringify(body)});
 const get=(path,cookie='')=>new Request(origin+path,{headers:{cookie}});
 let r=await api.shop.GET();assert.equal((await r.json()).payment.checkoutEnabled,false);
 r=await api.admin.POST(post({action:'configure-manual',pixEnabled:false,cashEnabled:true}));assert.equal(r.status,403);
 globalThis.__manualShopTest.user={email:'associacaoatleticamaccoloco@gmail.com',userId:'test-admin'};
 const configuration={action:'configure-manual',pixEnabled:true,cashEnabled:true,pixKey:'123e4567-e12b-12d1-a456-426655440000',receiverName:'RECEBEDOR TESTE',receiverCity:'ALMENARA',confirmReceiver:true};
 assert.equal((await api.admin.POST(post(configuration))).status,200);
 const product={id:'test-product',name:'Produto teste',category:'Roupas',description:'Teste local',deliveryInfo:'Retirada combinada com a direção',sizes:['M'],price:45.9,image:'',active:true,illustration:'other'};
 assert.equal((await api.admin.POST(post({action:'product',product}))).status,200);
 globalThis.__manualShopTest.user=null;
 const input={productId:product.id,size:'M',quantity:2,name:'Comprador Teste',email:'buyer@example.com',phone:'33999999999',consent:true,requestKey:crypto.randomUUID(),paymentMethod:'pix',totalCents:1};
 const invalid=await api.checkout.POST(post({...input,paymentMethod:'card'}));assert.equal(invalid.status,400);
 r=await api.checkout.POST(post(input));assert.equal(r.status,201);const result=await r.json(),cookie=r.headers.get('set-cookie').split(';')[0];
 assert.equal((await api.checkout.POST(post(input,cookie))).status,201);assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM shop_orders').get().n,1);
 r=await api.order.GET(get('/api/shop/order?id='+result.orderId,cookie));assert.equal(r.status,200);let order=await r.json();assert.equal(order.totalCents,9180);assert.equal(order.status,'pending');assert.ok(order.pixPayload.includes('540591.80'));assert.equal(order.receiverName,'RECEBEDOR TESTE');
 assert.equal((await api.order.GET(get('/api/shop/order?id='+result.orderId,'__Host-maccoloco-shop='+('a'.repeat(64))))).status,404);
 const confirmation={action:'confirm-manual',id:result.orderId,totalCents:9180,note:'Conferência de teste local',confirmReceived:true};
 assert.equal((await api.admin.POST(post(confirmation))).status,403);
 globalThis.__manualShopTest.user={email:'associacaoatleticamaccoloco@gmail.com',userId:'test-admin'};
 assert.equal((await api.admin.POST(post({...configuration,pixKey:'a6295ee1-f054-47d1-9e90-ee57b74f60d9',receiverName:'NOVO TITULAR'}))).status,200);
 order=await (await api.order.GET(get('/api/shop/order?id='+result.orderId,cookie))).json();assert.equal(order.receiverName,'RECEBEDOR TESTE');
 assert.equal((await api.admin.POST(post({...confirmation,totalCents:1}))).status,409);
 const otherOrigin=new Request(origin+'/api',{method:'POST',headers:{origin:'https://evil.example','content-type':'application/json'},body:JSON.stringify(confirmation)});assert.equal((await api.admin.POST(otherOrigin)).status,403);
 assert.equal((await api.admin.POST(post(confirmation))).status,200);
 assert.equal((await api.admin.POST(post(confirmation))).status,409);
 order=await (await api.order.GET(get('/api/shop/order?id='+result.orderId,cookie))).json();assert.equal(order.status,'paid');assert.equal(order.pixPayload,null);
 const audit=sqlite.prepare('SELECT confirmed_by,confirmed_at,payment_note FROM shop_orders WHERE id=?').get(result.orderId);assert.equal(audit.confirmed_by,'associacaoatleticamaccoloco@gmail.com');assert.ok(audit.confirmed_at);assert.equal(audit.payment_note,confirmation.note);
 r=await api.admin.GET(get('/api/admin/shop'));const report=await r.json();assert.equal(report.stats.paidOrders,1);assert.equal(report.stats.grossCents,9180);
 globalThis.__manualShopTest.user=null;
 r=await api.checkout.POST(post({...input,requestKey:crypto.randomUUID(),paymentMethod:'cash'},cookie));assert.equal(r.status,201);const cash=await r.json();order=await (await api.order.GET(get('/api/shop/order?id='+cash.orderId,cookie))).json();assert.equal(order.paymentMethod,'cash');assert.equal(order.status,'pending');assert.equal(order.pixPayload,null);
 console.log('PASS fluxo real das rotas em banco isolado: Pix/dinheiro, preço no servidor, idempotência, isolamento do comprador, CSRF, autorização, conferência única, auditoria e ranking.');
}finally{sqlite.close();delete globalThis.__manualShopTest;assert.equal(resolve(dirname(dir)),resolve(tmpdir()));await rm(dir,{recursive:true,force:true});}
