import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import qrcode from 'qrcode-generator';
import jsQR from 'jsqr';
import {pixPayload,crc16,validPixKey,canConfirmManual} from '../lib/pix.ts';
assert.equal(crc16('123456789'),'29B1');
const key='123e4567-e12b-12d1-a456-426655440000';
const payload=pixPayload({key,name:'João da Silva',city:'São Paulo',cents:4590,reference:'ML1234567890'});
function fields(text){const result={};while(text.length){const id=text.slice(0,2),len=Number(text.slice(2,4));assert.ok(Number.isInteger(len)&&len>0);result[id]=text.slice(4,4+len);text=text.slice(4+len);}return result;}
const data=fields(payload);
assert.equal(data['54'],'45.90');assert.equal(data['59'],'JOAO DA SILVA');assert.equal(data['60'],'SAO PAULO');assert.equal(fields(data['26'])['01'],key);assert.equal(fields(data['62'])['05'],'ML1234567890');assert.equal(data['63'],crc16(payload.slice(0,-4)));
assert.equal(validPixKey('javascript:alert(1)'),false);assert.equal(validPixKey('key\n@example.com'),false);
assert.throws(()=>pixPayload({key,name:'Nome',city:'Cidade',cents:NaN,reference:'ID'}));
assert.throws(()=>pixPayload({key,name:'Nome',city:'Cidade',cents:1.5,reference:'ID'}));
assert.throws(()=>pixPayload({key,name:'Nome',city:'Cidade',cents:100,reference:'<script>'}));
for(const method of ['pix','cash']){assert.ok(canConfirmManual({paymentMethod:method,status:'pending'}));assert.ok(!canConfirmManual({paymentMethod:method,status:'paid'}));}
assert.ok(!canConfirmManual({paymentMethod:'legacy',status:'pending'}));
// Decode generated QR with a different library. Quiet zone = four modules.
const qr=qrcode(0,'M');qr.addData(payload,'Byte');qr.make();const scale=6,margin=4,n=qr.getModuleCount(),side=(n+margin*2)*scale,rgba=new Uint8ClampedArray(side*side*4);
for(let y=0;y<side;y++)for(let x=0;x<side;x++){const row=Math.floor(y/scale)-margin,col=Math.floor(x/scale)-margin,dark=row>=0&&col>=0&&row<n&&col<n&&qr.isDark(row,col),p=(y*side+x)*4;rgba[p]=rgba[p+1]=rgba[p+2]=dark?0:255;rgba[p+3]=255;}
assert.equal(jsQR(rgba,side,side)?.data,payload);
const db=new DatabaseSync(':memory:');
for(const migration of ['0000_misty_lady_mastermind.sql','0001_charming_zaran.sql','0002_redundant_radioactive_man.sql','0003_ancient_mulholland_black.sql','0004_redundant_owl.sql','0005_puzzling_dakota_north.sql'])db.exec(await readFile(new URL('../drizzle/'+migration,import.meta.url),'utf8'));
const columns=db.prepare('PRAGMA table_info(shop_orders)').all().map(c=>c.name);for(const col of ['payment_method','pix_payload','confirmed_by','confirmed_at','payment_note'])assert.ok(columns.includes(col));
assert.equal(db.prepare('SELECT count(*) AS count FROM shop_manual_config').get().count,0);
db.close();
console.log('PASS Pix: CRC conhecido, BR Code, valor/referência, QR decodificado independentemente, métodos manuais e migração completa sem recebimentos habilitados.');
