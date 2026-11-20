export const publicationImageMaxBytes=200*1024;
export function publicationImage(value:unknown):string{
 if(value==='')return '';
 if(typeof value!=='string'||value.length>Math.ceil(publicationImageMaxBytes/3)*4+40)throw Error('Use uma imagem PNG, JPG ou WebP de até 200 KB.');
 const match=value.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);if(!match)throw Error('Use uma imagem PNG, JPG ou WebP válida.');
 let bytes:Uint8Array;try{bytes=Uint8Array.from(atob(match[2]),c=>c.charCodeAt(0));}catch{throw Error('Imagem inválida.');}
 if(!bytes.length||bytes.length>publicationImageMaxBytes)throw Error('A imagem deve ter até 200 KB.');
 const png=match[1]==='png'&&bytes.length>=24&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v),jpg=match[1]==='jpeg'&&bytes.length>=4&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255,webp=match[1]==='webp'&&bytes.length>=16&&new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
 if(!(png||jpg||webp))throw Error('O conteúdo do arquivo não corresponde a uma imagem PNG, JPG ou WebP.');return value;
}
