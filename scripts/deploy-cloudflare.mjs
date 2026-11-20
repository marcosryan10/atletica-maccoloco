import {readFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const config=JSON.parse(readFileSync('wrangler.jsonc','utf8'));
const database=config.d1_databases?.find(b=>b.binding==='DB');
if(!database?.database_id||database.database_id==='00000000-0000-4000-8000-000000000000')throw Error('Crie o D1 na sua conta e substitua database_id em wrangler.jsonc. Consulte HOSPEDAR_NA_CLOUDFLARE.md.');
if(!existsSync('dist/server/wrangler.json'))throw Error('Execute npm run build antes de publicar.');
const cli='node_modules/wrangler/bin/wrangler.js';
for(const args of [['d1','migrations','apply','DB','--remote','--config','wrangler.jsonc'],['deploy','--config','dist/server/wrangler.json']]){const r=spawnSync(process.execPath,[cli,...args],{stdio:'inherit',env:{...process.env,CI:'true'}});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1);}
