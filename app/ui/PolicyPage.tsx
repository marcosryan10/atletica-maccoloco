import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import {legalContact, policyBySlug} from '../../lib/legal';
export default function PolicyPage({slug}: {slug: string}) {
  const policy = policyBySlug(slug);
  return <><a className="skip" href="#politica">Pular para o conteúdo</a><SiteHeader/>
    <main id="politica" className="legal-page wrap"><header className="legal-heading">
      <a className="legal-back" href="/">Início</a><span className="eyebrow">Informações e direitos</span><h1>{policy.title}</h1><p className="legal-summary">{policy.summary}</p>
      <p className="legal-date">Última atualização: <time dateTime={legalContact.date}>{legalContact.updated}</time></p>
    </header><div className="legal-layout"><aside className="legal-index"><nav aria-label={`Nesta página: ${policy.title}`}><strong>Nesta página</strong>{policy.sections.map(section => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}<a href="#atendimento">Contato e atendimento</a></nav></aside>
    <article className="legal-content" aria-label={policy.title}>{policy.sections.map(section => <section key={section.id} id={section.id} aria-labelledby={`titulo-${section.id}`}>
      <h2 id={`titulo-${section.id}`}>{section.title}</h2>
      {section.table && <div className="legal-table-scroll" tabIndex={0} role="region" aria-label={`Tabela: ${section.title}`}><table><caption>{section.title}</caption><thead><tr>{section.table.headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{section.table.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}
      {section.paragraphs?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{section.items && <ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul>}
    </section>)}<section id="atendimento" className="legal-contact" aria-labelledby="titulo-atendimento"><h2 id="titulo-atendimento">Contato e atendimento</h2><p><strong>{legalContact.organization}</strong><br/>Responsável: {legalContact.responsible}.</p><address>{legalContact.address}<br/><a href={`mailto:${legalContact.email}`}>{legalContact.email}</a></address><p>Informe a página, a referência do pedido ou o cadastro a que sua solicitação se refere. Não envie senhas, códigos de autenticação ou dados bancários desnecessários.</p><a className="button black" href={`mailto:${legalContact.email}?subject=${encodeURIComponent(policy.title + ' — Atendimento MaccoLoco')}`}>Enviar solicitação por e-mail</a></section>
    <section className="legal-sources" aria-labelledby="titulo-referencias"><h2 id="titulo-referencias">Referências</h2><ul>{policy.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul></section></article></div></main><SiteFooter compact/></>;
}
