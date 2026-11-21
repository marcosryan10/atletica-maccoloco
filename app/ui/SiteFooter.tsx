import {legalContact, policyLinks} from '../../lib/legal-contact';
export default function SiteFooter({compact = false}: {compact?: boolean}) {
  return <footer className={`site-policy-footer${compact ? ' compact' : ''}`}><div className="wrap">
    <div className="policy-footer-top"><a href="https://www.instagram.com/atletica.maccoloco/" target="_blank" rel="noreferrer">@atletica.maccoloco</a></div>
    {!compact && <div className="footer-word" aria-hidden="true">MACCOLOCO</div>}
    <div className="policy-footer-grid"><div className="policy-footer-contact">
      <p className="policy-footer-label">Dúvidas e reclamações</p><p>{legalContact.organization}</p><p>Organização estudantil independente, sem CNPJ.</p>
      <address><a href={`mailto:${legalContact.email}`}>{legalContact.email}</a></address>
    </div><nav className="policy-footer-nav" aria-label="Políticas da MaccoLoco"><p className="policy-footer-label">Informações e direitos</p>{policyLinks.map(policy => <a key={policy.slug} href={`/${policy.slug}`}>{policy.title}</a>)}</nav></div>
    <div className="policy-footer-bottom"><a href="https://www.linkedin.com/in/marcosryanl" target="_blank" rel="noopener noreferrer">Desenvolvido por Marcos Ryan Oliveira Porto</a></div>
  </div></footer>;
}
