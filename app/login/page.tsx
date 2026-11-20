import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {getChatGPTUser} from '../chatgpt-auth';
import {adminEmail} from '../../lib/maccoloco';
import {parseAuthCookies} from '../../lib/password-auth-core';
import {passwordAuthConfig} from '../../lib/password-auth-server';
import Login from '../ui/Login';
export const dynamic='force-dynamic';
export const metadata={title:'Login da direção | MaccoLoco',robots:{index:false,follow:false}};
export default async function Page(){const configured=Boolean(passwordAuthConfig());if(configured&&await getChatGPTUser())redirect('/admin');const h=await headers();return <Login configured={configured} email={adminEmail} refreshAvailable={Boolean(parseAuthCookies(h.get('cookie')).refresh)}/>;}
