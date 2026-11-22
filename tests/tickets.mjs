import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile,mkdtemp,rm,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
const sqlite=new DatabaseSync(':memory:');
for(const p of ['0000_misty_lady_mastermind.sql','0001_charming_zaran.sql','0002_redundant_radioactive_man.sql','0003_ancient_mulholland_black.sql','0004_redundant_owl.sql','0005_puzzling_dakota_north.sql','0006_direction_and_customer_accounts.sql','0007_customer_order_index.sql','0008_event_tickets.sql'])sqlite.exec(await readFile(new URL('../drizzle/'+p,import.meta.url),'utf8'));
function prepared(sql,params=[]){return {bind(...p){return prepared(sql,p);},async all(){return {results:sqlite.prepare(sql).all(...params),success:true,meta:{}};},async first(){return sqlite.prepare(sql).get(...params)||null;},async raw(){const stmt=sqlite.prepare(sql);stmt.setReturnArrays(true);return stmt.all(...params);},async run(){const r=sqlite.prepare(sql).run(...params);return {success:true,meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)},results:[]};}};}
let batchQueue=Promise.resolve();
globalThis.__manualShopTest={sent:[],failMail:false,env:{DB:{prepare:prepared,batch(statements){const task=batchQueue.then(async()=>{sqlite.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.all());sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}});batchQueue=task.catch(()=>{});return task;}}},user:null};
const dir=await mkdtemp(join(tmpdir(),'macco-pix-test-'));
try{
 const api={};
 const routes={tickets:'app/api/admin/tickets/route.ts',checkout:'app/api/shop/checkout/route.ts',admin:'app/api/admin/shop/route.ts',core:'lib/ticket-core.ts',server:'lib/tickets-server.ts',mail:'lib/ticket-mail.ts'};
 for(const [name,path] of Object.entries(routes)){
 const outfile=join(dir,name+'.mjs');
 await build({entryPoints:[resolve(path)],outfile,bundle:true,platform:'node',format:'esm',logLevel:'silent',plugins:[{name:'runtime',setup(b){
 b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'workers',namespace:'fixture'}));b.onResolve({filter:/maccoloco-auth$/},()=>({path:'identity',namespace:'fixture'}));b.onResolve({filter:/identity-server$/},()=>({path:'customer',namespace:'fixture'}));b.onResolve({filter:/^nodemailer$/},()=>({path:'smtp',namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:a.path==='workers'?'export const env=globalThis.__manualShopTest.env;':a.path==='customer'?'export async function getAuthenticatedIdentity(){return null;}':a.path==='smtp'?`export default {createTransport(){return {async sendMail(message){if(globalThis.__manualShopTest.failMail)throw Error('smtp refused SECRET');globalThis.__manualShopTest.sent.push(message);},close(){}};}};`:'export async function getMaccolocoUser(){return globalThis.__manualShopTest.user;}',loader:'js'}));}}]});api[name]=await import(pathToFileURL(outfile));}
 const fixture=globalThis.__manualShopTest,origin='https://test.maccoloco.example';
 const post=(body,source=origin)=>new Request(origin+'/api/admin/tickets',{method:'POST',headers:{origin:source,'content-type':'application/json'},body:JSON.stringify(body)});
 const get=(params='')=>new Request(origin+'/api/admin/tickets'+params);
 const root={email:'owner@example.com',owner:true,permissions:[]};
 const user=permissions=>({email:'staff@example.com',owner:false,permissions});
 assert.equal((await api.tickets.GET(get())).status,403);
 fixture.user=user(['products']);assert.equal((await api.tickets.GET(get())).status,403);
 fixture.user=root;
 assert.equal((await api.tickets.POST(post({action:'event'},'https://evil.example'))).status,403);
 let r=await api.tickets.POST(post({action:'event',name:'Evento teste',startsAt:'2027-01-15T22:00:00-03:00',location:'Almenara',salesOpen:true}));assert.equal(r.status,200);const event=(await r.json()).id;
 r=await api.tickets.POST(post({action:'event',name:'Outro evento',startsAt:'2027-01-16T20:00:00-03:00',location:'Outro local',salesOpen:false}));const other=(await r.json()).id;
 await api.admin.POST(post({action:'configure-manual',cashEnabled:true,pixEnabled:false}));
 const product={id:'combo-test',name:'Combo teste',category:'Combos',description:'Teste isolado',deliveryInfo:'Retirada no evento de teste',sizes:['M'],price:90,image:'',active:true,illustration:'other',ticketEventId:event};
 assert.equal((await api.admin.POST(post({action:'product',product}))).status,200);
 const checkout={productId:product.id,size:'M',quantity:3,name:'Comprador <teste>',email:'buyer@example.com',phone:'33999999999',consent:true,requestKey:crypto.randomUUID(),paymentMethod:'cash',ticketEventId:other};
 assert.equal((await api.checkout.POST(post(checkout))).status,503,'Ticket sales require configured email');
 fixture.env.TICKET_SMTP_PASSWORD='isolated-test-not-a-secret';
 r=await api.checkout.POST(post(checkout));assert.equal(r.status,201);const orderId=(await r.json()).orderId;
 const order=sqlite.prepare('SELECT * FROM shop_orders WHERE id=?').get(orderId);assert.equal(order.ticket_event_id,event,'Use product snapshot, ignore client event');assert.equal(order.total_cents,27000);
 assert.equal(sqlite.prepare('SELECT count(*) n FROM event_tickets').get().n,0);
 const confirmation={action:'confirm-manual',id:orderId,totalCents:27000,note:'Teste isolado',confirmReceived:true};
 fixture.failMail=true;r=await api.admin.POST(post(confirmation));assert.equal(r.status,200);assert.equal((await r.json()).ticketEmail.status,'error');assert.equal(sqlite.prepare('SELECT status FROM shop_orders WHERE id=?').get(orderId).status,'paid','SMTP failure must not undo payment');
 let rows=sqlite.prepare('SELECT * FROM event_tickets ORDER BY ordinal').all();assert.equal(rows.length,3);assert.equal(new Set(rows.map(t=>t.token)).size,3);rows.forEach(t=>assert.match(t.token,/^[a-f0-9]{64}$/));
 assert.equal(sqlite.prepare('SELECT status FROM ticket_deliveries').get().status,'error');assert.ok(!sqlite.prepare('SELECT last_error FROM ticket_deliveries').get().last_error.includes('SECRET'));
 assert.equal((await api.admin.POST(post(confirmation))).status,409);
 await fixture.env.DB.batch(api.server.ticketIssueStatements({id:orderId,quantity:3,mode:'live',ticketEventId:event},new Date().toISOString()));assert.equal(sqlite.prepare('SELECT count(*) n FROM event_tickets').get().n,3);
 fixture.failMail=false;assert.equal((await api.mail.deliverTicketEmail(orderId)).status,'sent');assert.equal(fixture.sent.length,1);const message=fixture.sent[0];assert.equal(message.attachments.length,3);assert.ok(message.html.includes('&lt;teste&gt;'));assert.equal(message.to,'buyer@example.com');assert.equal(message.attachments[0].content.subarray(0,3).toString(),'GIF');
 await api.mail.deliverTicketEmail(orderId);assert.equal(fixture.sent.length,1);await api.mail.deliverTicketEmail(orderId,true);assert.equal(fixture.sent.length,2);assert.deepEqual(fixture.sent[1].attachments.map(a=>a.content),message.attachments.map(a=>a.content),'Resend preserves exact QR codes');
 fixture.user=user(['checkin']);let listing=await (await api.tickets.GET(get())).json();assert.equal(listing.manage,false);assert.equal(listing.tickets,undefined);assert.equal(JSON.stringify(listing).includes('buyer@example.com'),false);
 assert.equal((await api.tickets.POST(post({action:'preview',id:rows[0].id}))).status,403);
 assert.equal((await api.tickets.POST(post({action:'resend',orderId}))).status,403);
 assert.equal((await api.tickets.POST(post({action:'test-email'}))).status,403);
 let code='MACCOLOCO:'+rows[0].token;
 assert.equal((await (await api.tickets.POST(post({action:'lookup',eventId:other,code}))).json()).state,'wrong_event');
 assert.equal((await api.tickets.POST(post({action:'lookup',eventId:event,code:'MAC-000001'}))).status,400);
 assert.equal((await (await api.tickets.POST(post({action:'lookup',eventId:event,code}))).json()).state,'valid');
 const concurrent=await Promise.all([api.tickets.POST(post({action:'checkin',eventId:event,code})),api.tickets.POST(post({action:'checkin',eventId:event,code}))]);const states=await Promise.all(concurrent.map(r=>r.json()));assert.deepEqual(states.map(s=>s.state).sort(),['checked_in','used']);assert.equal(sqlite.prepare("SELECT count(*) n FROM ticket_audit WHERE action='checkin'").get().n,1);
 fixture.user=user(['tickets']);assert.equal((await api.tickets.POST(post({action:'checkin',eventId:event,code:'MACCOLOCO:'+rows[1].token}))).status,403);
 assert.equal((await api.tickets.POST(post({action:'revoke',id:rows[1].id,reason:'Cancelado no teste'}))).status,200);assert.equal((await api.tickets.POST(post({action:'revoke',id:rows[1].id,reason:'Repetir teste'}))).status,409);assert.equal(sqlite.prepare("SELECT count(*) n FROM ticket_audit WHERE action='revoke'").get().n,1);
 assert.equal((await api.server.consumeTicket(rows[1].token,event,'staff')).state,'revoked');
 sqlite.prepare("UPDATE shop_orders SET status='refunded' WHERE id=?").run(orderId);assert.equal((await api.server.consumeTicket(rows[2].token,event,'staff')).state,'unpaid');assert.equal((await api.tickets.POST(post({action:'preview',id:rows[2].id}))).status,404);
 sqlite.prepare("UPDATE shop_orders SET status='paid',mode='test' WHERE id=?").run(orderId);assert.equal((await api.server.consumeTicket(rows[2].token,event,'staff')).state,'unpaid');
 listing=await (await api.tickets.GET(get())).json();assert.equal(listing.tickets.length,3);assert.equal(listing.tickets.some(t=>'token' in t),false);
 assert.equal(api.server.ticketIssueStatements({id:orderId,quantity:3,mode:'test',ticketEventId:event},new Date().toISOString()).length,0);
 assert.equal(api.core.readTicketCode('https://evil.example/anything'),null);assert.equal(api.core.readTicketCode('MACCOLOCO:'+rows[0].token),rows[0].token);
 fixture.user=root;const sentBefore=fixture.sent.length;assert.equal((await (await api.tickets.POST(post({action:'test-email'}))).json()).email.status,'sent');assert.equal(fixture.sent.length,sentBefore+1);assert.equal(fixture.sent.at(-1).to,'associacaoatleticamaccoloco@gmail.com');
 console.log('PASS ingressos: transação pagamento/emissão, QR único por unidade, idempotência, SMTP simulado/falha/reenvio, permissões, CSRF, evento incorreto, check-in concorrente único, auditoria, revogação, reembolso e isolamento. Nenhum e-mail real enviado.');
}finally{sqlite.close();delete globalThis.__manualShopTest;assert.equal(resolve(dirname(dir)),resolve(tmpdir()));await rm(dir,{recursive:true,force:true});}
