import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
const sqlite=new DatabaseSync(':memory:');
for(const p of ['0000_misty_lady_mastermind.sql','0001_charming_zaran.sql','0002_redundant_radioactive_man.sql','0003_ancient_mulholland_black.sql','0004_redundant_owl.sql','0005_puzzling_dakota_north.sql'])sqlite.exec(await readFile(new URL('../drizzle/'+p,import.meta.url),'utf8'));
function prepared(sql,params=[]){return {bind(...p){return prepared(sql,p);},async all(){return {results:sqlite.prepare(sql).all(...params),success:true,meta:{}};},async first(){return sqlite.prepare(sql).get(...params)||null;},async raw(){const stmt=sqlite.prepare(sql);stmt.setReturnArrays(true);return stmt.all(...params);},async run(){const r=sqlite.prepare(sql).run(...params);return {success:true,meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)},results:[]};}};}
globalThis.__manualShopTest={env:{DB:{prepare:prepared}},user:null};
const dir=await mkdtemp(join(tmpdir(),'macco-pix-test-'));
try{
 const routes={editor:'app/api/admin/route.ts',publications:'app/api/publications/route.ts'};
 const api={};
 for(const [name,path] of Object.entries(routes)){
 const outfile=join(dir,name+'.mjs');
 await build({entryPoints:[resolve(path)],outfile,bundle:true,platform:'node',format:'esm',logLevel:'silent',plugins:[{name:'test-runtime',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'workers',namespace:'fixture'}));b.onResolve({filter:/maccoloco-auth$/},()=>({path:'identity',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:a.path==='workers'?'export const env=globalThis.__manualShopTest.env;':'export async function getMaccolocoUser(){return globalThis.__manualShopTest.user;}',loader:'js'}));}}]});
 api[name]=await import(pathToFileURL(outfile));
 }
 const origin='https://test.maccoloco.example';
 const post=(body)=>new Request(origin+'/api/admin',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
 const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP5sAAAAASUVORK5CYII=';
 const body={action:'publication',kind:'news',title:'Notícia de teste',summary:'Resumo da publicação de teste.',body:'Texto completo da publicação de teste.',date:'2026-11-20',category:'Novidades',image,imageAlt:'Arte de teste',published:0};
 assert.equal((await api.editor.POST(post(body))).status,403);
 globalThis.__manualShopTest.user={email:'associacaoatleticamaccoloco@gmail.com',userId:'test-admin'};
 assert.equal((await api.editor.POST(post({...body,image:'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='}))).status,400);
 assert.equal((await api.editor.POST(post({...body,image:'data:image/png;base64,'+Buffer.from('imagem falsa').toString('base64')}))).status,400);
 assert.equal((await api.editor.POST(post({...body,image:'data:image/png;base64,'+Buffer.alloc(201*1024).toString('base64')}))).status,400);
 let r=await api.editor.POST(post(body));assert.equal(r.status,200);const saved=await r.json();
 let posts=await (await api.publications.GET()).json();assert.ok(!posts.some(p=>p.id===saved.id));
 assert.equal((await api.editor.POST(post({...body,id:saved.id,published:1}))).status,200);
 posts=await (await api.publications.GET()).json();const news=posts.find(p=>p.id===saved.id);assert.equal(news.image,image);assert.equal(news.imageAlt,'Arte de teste');
 const admin=await (await api.editor.GET()).json();assert.equal(admin.publications.find(p=>p.id===saved.id).image,image);
 const oldClient={...body,id:saved.id,published:1};delete oldClient.image;delete oldClient.imageAlt;
 assert.equal((await api.editor.POST(post(oldClient))).status,200);posts=await (await api.publications.GET()).json();assert.equal(posts.find(p=>p.id===saved.id).image,image);
 r=await api.editor.POST(post({...body,kind:'event',title:'Evento de teste',published:1}));assert.equal(r.status,200);const event=await r.json();posts=await (await api.publications.GET()).json();assert.equal(posts.find(p=>p.id===event.id).image,image);
 assert.equal((await api.editor.POST(post({...body,id:saved.id,image:'',imageAlt:'',published:1}))).status,200);posts=await (await api.publications.GET()).json();assert.equal(posts.find(p=>p.id===saved.id).image,'');assert.equal(posts.find(p=>p.id===event.id).image,image);
 const hostile=new Request(origin+'/api/admin',{method:'POST',headers:{origin:'https://evil.example','content-type':'application/json'},body:JSON.stringify(body)});assert.equal((await api.editor.POST(hostile)).status,403);
 globalThis.__manualShopTest.user=null;assert.equal((await api.editor.GET()).status,403);
 console.log('PASS publicações: notícias/eventos com imagem persistida, rascunho privado, edição/remoção, compatibilidade, validação de arquivo/tamanho e acesso restrito.');
}finally{sqlite.close();delete globalThis.__manualShopTest;assert.equal(resolve(dirname(dir)),resolve(tmpdir()));await rm(dir,{recursive:true,force:true});}
