import type { Metadata } from 'next';
import './globals.css';
import './legal.css';
import CookieNotice from './ui/CookieNotice';
export const metadata: Metadata = { title: 'MaccoLoco | A atlética de Almenara', description: 'Esporte, integração e a nossa torcida. Conheça a MaccoLoco, acompanhe as novidades e inscreva-se como atleta.', metadataBase: process.env.PUBLIC_SITE_URL ? new URL(process.env.PUBLIC_SITE_URL) : undefined, icons: { icon: '/media/maccoloco.jpg' }, openGraph: {title:'Atlética MaccoLoco',description:'Esporte e integração estudantil em Almenara.',images:['/media/maccoloco.jpg'],locale:'pt_BR'} };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR" data-type="service"><head><meta name="page-type" content="service"/><meta name="site-kind" content="other"/><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet"/></head><body>{children}<CookieNotice/></body></html>}
