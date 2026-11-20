import { requireMaccolocoUser } from '../maccoloco-auth';
import { adminEmail } from '../../lib/maccoloco';
import { isMaccoAdmin } from '../../lib/admin-auth';
import Admin from '../ui/Admin';
export const dynamic='force-dynamic';
export default async function Page(){
 const user=await requireMaccolocoUser('/admin');
 if(!isMaccoAdmin(user.email))return <main className="access-page"><a className="wordmark" href="/">MACCOLOCO</a><span className="eyebrow">Área da direção</span><h1>Acesso restrito.</h1><p>Entre com a conta autorizada da associação para consultar os cadastros e administrar o site.</p><p>Você está conectado como <strong>{user.email}</strong>.</p><a className="button" target="_top" href="/login">Trocar de conta</a><a className="text-link" href="/">Voltar ao site</a></main>;
 return <Admin name={user.fullName||'Direção MaccoLoco'}/>;
}
