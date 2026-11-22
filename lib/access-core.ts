export const accessPermissions = [
  {id:'applications',label:'Inscrições de atletas'},
  {id:'news',label:'Notícias'}, {id:'events',label:'Eventos'},
  {id:'partners',label:'Parceiros'}, {id:'products',label:'Produtos e categorias'},
  {id:'orders',label:'Pedidos e vendas'}, {id:'payments',label:'Confirmar pagamentos e configurar recebimentos'},
  {id:'tickets',label:'Gerenciar eventos e ingressos dos combos'}, {id:'checkin',label:'Ler ingressos e entregar pulseiras'},
] as const;
export type Permission = typeof accessPermissions[number]['id'];
export const allPermissions = accessPermissions.map(p=>p.id);
export function normalizedEmail(value:unknown){return typeof value==='string'?value.trim().toLowerCase():'';}
export function validEmail(value:string){return value.length<=160&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);}
export function normalizedPermissions(value:unknown):Permission[]{return Array.isArray(value)?allPermissions.filter(p=>value.includes(p)):[];}
export function verifiedIdentity(user:any){return Boolean(user&&typeof user.id==='string'&&user.id.length>0&&validEmail(normalizedEmail(user.email))&&typeof user.email_confirmed_at==='string'&&Number.isFinite(Date.parse(user.email_confirmed_at))&&user.role==='authenticated'&&user.is_anonymous!==true);}
export type DirectionAccess={id:string;email:string;name:string;permissions:Permission[];active:boolean;owner:boolean;userId:string|null};
export function hasPermission(access:Pick<DirectionAccess,'permissions'|'owner'>|null,permission:Permission){return Boolean(access&&(access.owner||access.permissions.includes(permission)));}
export function contentPermission(action:string,kind?:unknown):Permission|null{
  if(action==='status'||action==='delete-application')return 'applications';
  if(action==='partner'||action==='delete-partner')return 'partners';
  if(action==='publication')return kind==='event'?'events':'news';
  return null;
}
export function shopPermission(action:string):Permission|null{
  if(['product','delete-product','category','seed'].includes(action))return 'products';
  if(action==='fulfillment')return 'orders';
  if(['configure-manual','confirm-manual'].includes(action))return 'payments';
  return null;
}
