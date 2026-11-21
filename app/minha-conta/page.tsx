import {redirect} from 'next/navigation';
import {getAuthenticatedIdentity} from '../../lib/identity-server';
import CustomerAccount from '../ui/CustomerAccount';
export const dynamic='force-dynamic';
export const metadata={title:'Área do cliente | MaccoLoco',robots:{index:false,follow:false}};
export default async function Page(){if(!await getAuthenticatedIdentity())redirect('/minha-conta/entrar');return <CustomerAccount/>;}
