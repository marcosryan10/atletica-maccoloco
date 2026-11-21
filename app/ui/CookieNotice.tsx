'use client';
import {useEffect, useState} from 'react';
const noticeKey = 'maccoloco-cookie-notice-v1';
export default function CookieNotice() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (/^\/(admin|login)(\/|$)/.test(window.location.pathname)) return;
    try { setVisible(window.localStorage.getItem(noticeKey) !== 'dismissed'); } catch { setVisible(true); }
  }, []);
  function dismiss() {try { window.localStorage.setItem(noticeKey, 'dismissed'); } catch {} setVisible(false);}
  if (!visible) return null;
  return <section className="cookie-notice" aria-labelledby="cookie-notice-title"><div><h2 id="cookie-notice-title">Cookies necessários</h2><p>Usamos cookies para acompanhar pedidos e proteger o login da direção. Não usamos cookies de publicidade. <a href="/cookies">Leia o aviso de cookies</a>.</p></div><button className="button black" type="button" onClick={dismiss}>Entendi</button></section>;
}
