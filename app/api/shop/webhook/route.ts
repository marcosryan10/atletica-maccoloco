import {json} from '../../../../lib/shop-server';
export const dynamic='force-dynamic';
// O Pix atual é conciliado pela direção; a integração antiga está desativada.
export async function POST(){return json({error:'Integração desativada.'},410);}
