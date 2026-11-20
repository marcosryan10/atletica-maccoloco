// Pix estático BR Code: valor em centavos e referência alfanumérica do pedido.
export function pixText(value:string,max:number){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9 /.-]/g,'').trim().slice(0,max);}
export function validPixKey(value:unknown):value is string{return typeof value==='string'&&value.length<=77&&(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)||/^\+[1-9]\d{9,14}$/.test(value)||/^\d{11}$/.test(value)||/^\d{14}$/.test(value)||/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value));}
export function crc16(value:string){let crc=0xffff;for(const byte of new TextEncoder().encode(value)){crc^=byte<<8;for(let i=0;i<8;i++)crc=(crc&0x8000)?((crc<<1)^0x1021)&0xffff:(crc<<1)&0xffff;}return crc.toString(16).toUpperCase().padStart(4,'0');}
function tlv(id:string,value:string){const length=new TextEncoder().encode(value).length;if(length>99)throw Error('Campo Pix muito extenso.');return id+String(length).padStart(2,'0')+value;}
export function pixPayload({key,name,city,cents,reference}:{key:string;name:string;city:string;cents:number;reference:string}){
 if(!validPixKey(key)||!pixText(name,25)||!pixText(city,15)||!Number.isSafeInteger(cents)||cents<100||cents>100000000||!/^[A-Za-z0-9]{1,25}$/.test(reference))throw Error('Dados Pix inválidos.');
 const body=tlv('00','01')+tlv('26',tlv('00','br.gov.bcb.pix')+tlv('01',key))+tlv('52','0000')+tlv('53','986')+tlv('54',(cents/100).toFixed(2))+tlv('58','BR')+tlv('59',pixText(name,25))+tlv('60',pixText(city,15))+tlv('62',tlv('05',reference))+'6304';return body+crc16(body);
}
export function canConfirmManual(order:{paymentMethod:string;status:string}){return ['pix','cash'].includes(order.paymentMethod)&&order.status==='pending';}
