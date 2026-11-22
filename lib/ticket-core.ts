export function ticketNumber(id:number){return 'MAC-'+String(id).padStart(6,'0');}
export function newTicketToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');}
export function readTicketCode(value:unknown){if(typeof value!=='string')return null;const token=value.trim().replace(/^MACCOLOCO:/,'');return /^[a-f0-9]{64}$/.test(token)?token:null;}
export function ticketState(row:{used_at?:string|null;revoked_at?:string|null;order_status:string;mode:string}){
 if(row.revoked_at)return 'revoked';if(row.order_status!=='paid'||row.mode!=='live')return 'unpaid';if(row.used_at)return 'used';return 'valid';
}
export function escapeTicketHTML(value:unknown){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));}
