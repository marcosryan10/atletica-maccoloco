import { requireMaccolocoUser } from '../maccoloco-auth';
import { adminEmail } from '../../lib/maccoloco';
import { isMaccoAdmin } from '../../lib/admin-auth';
import Admin from '../ui/Admin';
export const dynamic='force-dynamic';
export default async function Page(){
 const user=await requireMaccolocoUser('/admin');
 return <Admin name={user.fullName||'Direção MaccoLoco'} permissions={user.permissions} owner={user.owner}/>;
}
