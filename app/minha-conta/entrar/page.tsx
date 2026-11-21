import {redirect} from 'next/navigation';
import {getAuthenticatedIdentity} from '../../../lib/identity-server';
import CustomerLogin from '../../ui/CustomerLogin';
export const dynamic='force-dynamic';
export const metadata={title:'Entrar na área do cliente | MaccoLoco',robots:{index:false,follow:false}};
export default async function Page(){if(await getAuthenticatedIdentity())redirect('/minha-conta');return <CustomerLogin/>;}
