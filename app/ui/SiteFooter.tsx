import {legalContact, policyLinks} from '../../lib/legal-contact';
export default function SiteFooter({compact = false}: {compact?: boolean}) {
  return <footer className={`site-policy-footer${compact ? ' compact' : ''}`}><div className="wrap">
    <div className="policy-footer-top"><a href="/" className="policy-footer-brand">MACCOLOCO</a><a href="https://www.instagram.com/atletica.maccoloco/" target="_blank" rel="noreferrer">@atletica.maccoloco</a></div>
    {!compact && <div className="footer-word" aria-hidden="true">MACCOLOCO</div>}
    <div className="policy-footer-grid"><div className="policy-footer-contact">
      <p className="policy-footer-label">Atendimento e responsável</p><p>{legalContact.organization}</p><p>Organização estudantil independente, sem CNPJ.</p>
      <p>Responsável pelas vendas: <strong>{legalContact.responsible}</strong>.</p>
      <address>{legalContact.address}<br/><a href={`mailto:${legalContact.email}`}>{legalContact.email}</a></address>
      <p className="policy-footer-note">Para atendimento presencial ou devolução, combine antes pelo e-mail. A retirada de produtos segue as informações de cada pedido.</p>
    </div><nav className="policy-footer-nav" aria-label="Políticas da MaccoLoco"><p className="policy-footer-label">Informações e direitos</p>{policyLinks.map(policy => <a key={policy.slug} href={`/${policy.slug}`}>{policy.title}</a>)}</nav></div>
    <div className="policy-footer-bottom"><span>MaccoLoco · Almenara, Minas Gerais</span><a href="/produtos">Loja da Atlética</a></div>
  </div></footer>;
}
