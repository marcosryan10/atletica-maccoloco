export const BAR_INTERVAL_MS=8*60*1000;
export const DEFAULT_BAR_START='2027-01-16T17:00:00.000Z';
export const DEFAULT_BAR_END='2027-01-16T19:00:00.000Z';
export function readBarCode(value:unknown){if(typeof value!=='string')return null;const m=/^MACCOLOCO-BAR:([a-f0-9]{64})$/.exec(value.trim());return m?m[1]:null;}
export const barNumber=(id:number)=>'BAR-'+String(id).padStart(6,'0');
export function barState(row:any,now=Date.now()){
 if(row.revoked_at)return 'revoked';
 if(row.order_status!=='paid'||row.mode!=='live'||row.includes_open_bar!==1)return 'unavailable';
 const start=Date.parse(row.bar_starts_at),end=Date.parse(row.bar_ends_at);
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return 'unconfigured';
 if(now<start)return 'not_started';if(now>=end)return 'ended';
 if(row.last_served_at!==null&&row.last_served_at+BAR_INTERVAL_MS>now)return 'cooldown';
 return 'ready';
}
