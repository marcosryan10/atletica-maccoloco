# Hospedar o sistema completo a partir do GitHub

Este repositório contém a aplicação React/Vinext, o servidor, as migrações do banco D1 e o armazenamento R2 para imagens. O destino é **Cloudflare Workers com Workers Builds**, conectado ao GitHub. GitHub Pages e o upload estático do Cloudflare Pages não executam esta loja.

A hospedagem anterior continua independente. Este repositório não contém banco de compradores, cadastros, credenciais ou a chave de criptografia daquele ambiente. A implantação em outra conta começa com recursos vazios. Não copie os testes locais para produção.

## 1. Criar banco e armazenamento na sua conta

Você pode criar os recursos pelo painel da Cloudflare ou pelo terminal, com Node.js 24:

```sh
npm ci
npx wrangler login
npx wrangler d1 create maccoloco-db
npx wrangler r2 bucket create maccoloco-imagens
```

Copie o identificador real do banco retornado pela Cloudflare para `database_id` em `wrangler.jsonc`, substituindo os zeros. O vínculo deve se chamar **DB**. O vínculo do bucket deve se chamar **BUCKET**, apontando para `maccoloco-imagens`. Se escolher nomes diferentes para os recursos, atualize o arquivo antes de publicar.

O script de publicação bloqueia um banco sem identificador real. As migrações são aplicadas antes de publicar o Worker. Não aponte o projeto para um banco de outro sistema. A ativação do R2 e os limites/custos dependem da sua conta Cloudflare; confira o painel antes de habilitar recursos.

## 2. Conectar o GitHub

No painel Cloudflare, em **Workers & Pages**, crie uma aplicação **Worker**, importe o repositório `marcosryan10/atletica-maccoloco` e use:

| Campo | Valor |
| --- | --- |
| Nome do Worker | `atletica-maccoloco` |
| Branch de produção | `main` |
| Diretório raiz | `/` |
| Comando de build | `npm run build` |
| Comando de deploy | `npm run deploy:cloudflare` |
| Node.js | `24` |

O nome do Worker precisa coincidir com `wrangler.jsonc`. A conexão é autorizada na sua própria conta GitHub/Cloudflare; não envie tokens pelo chat.

O token de compilação precisa permitir publicar o Worker e aplicar migrações no D1 da conta. Se a migração falhar por permissão, ajuste o token em Workers Builds; não ignore a etapa nem publique com esquema incompleto. Desabilite publicações de branches de desenvolvimento até criar banco e bucket separados para testes, evitando que uma prévia use os dados de produção.

Para publicar manualmente após a configuração:

```sh
npm run build
npm run deploy:cloudflare
```

## 3. Proteger o painel com Cloudflare Access

O login da hospedagem anterior foi substituído. Esta versão **não confia em cabeçalhos `oai-authenticated-user-*`**. Ela verifica a assinatura do JWT do Cloudflare Access com as chaves públicas oficiais, além de emissor, audiência, validade e e-mail autorizado. Sem configuração ou identificação válida, as APIs administrativas recusam acesso.

1. Conecte um domínio próprio ao Worker. O endereço `workers.dev` pode ser usado para conferir a parte pública, mas o painel deve ser configurado no domínio protegido pelo Access.
2. Em **Zero Trust → Access → Applications**, crie uma aplicação **Self-hosted** para os caminhos administrativos desse domínio. Na mesma aplicação, inclua `/admin`, `/admin/*`, `/api/admin` e `/api/admin/*`. Não proteja o site inteiro: visitantes e notificações de pagamento precisam acessar as rotas públicas.
3. Crie uma política Allow somente para `associacaoatleticamaccoloco@gmail.com`. Você pode usar o código por e-mail do Access ou um provedor de identidade configurado por você. A aplicação também confere esse e-mail no servidor.
4. Copie o domínio da equipe, como `sua-equipe.cloudflareaccess.com`, e o **Application Audience (AUD)** da aplicação. Preencha `CF_ACCESS_TEAM_DOMAIN` e `CF_ACCESS_AUD` em `wrangler.jsonc` e confirme a alteração no GitHub. São identificadores de configuração, não senhas. O domínio é informado sem `https://`.
5. Publique novamente e teste `/admin` em uma janela anônima. Sem entrar, `/api/admin` e `/api/admin/shop` devem ser recusados ou apresentar o desafio do Access. Entrando com o e-mail autorizado, o painel deve carregar. Cabeçalhos inventados pelo visitante não concedem acesso.

Um JWT assinado no cookie `CF_Authorization` também é validado, permitindo que a direção use o checkout de teste nas rotas públicas sem fechar a loja aos visitantes. Apenas possuir um cookie ou um cabeçalho com nome conhecido não é suficiente: a assinatura e as demais condições precisam ser válidas.

## 4. Configurar a chave da loja

Crie um segredo **runtime**, no Worker, chamado `SHOP_ENCRYPTION_KEY`, com 32 bytes aleatórios representados por 64 caracteres hexadecimais. Uma opção no seu computador:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
npx wrangler secret put SHOP_ENCRYPTION_KEY --config wrangler.jsonc
```

Cole o valor somente na solicitação interativa do Wrangler ou no campo de segredo do painel Cloudflare. Não publique o valor no GitHub. Mantenha essa chave estável: trocá-la sem reconfigurar as credenciais impede decifrar a conexão existente com o Mercado Pago.

Os segredos da hospedagem anterior não são transferidos automaticamente. Não habilite cobranças antes de configurar esta chave, testar a conexão e conferir o recebedor.

## 5. Ativar Mercado Pago e conteúdo

No painel protegido, adicione os modelos de abadá e tirante, preços reais e condições de retirada. Depois siga [CONFIGURAR_MERCADO_PAGO.md](CONFIGURAR_MERCADO_PAGO.md). Use o novo domínio na URL do webhook: `https://SEU-DOMINIO/api/shop/webhook`.

Comece com conta e pagamento de teste; o sistema exige teste aprovado e notificação autenticada antes de habilitar produção. A conta bancária é configurada pelo titular dentro do Mercado Pago. Não informe senha bancária ao site. O webhook permanece público e verifica a assinatura do Mercado Pago; não o coloque atrás do login do Access.

Para metadados de compartilhamento, configure `PUBLIC_SITE_URL` como variável de **build**, com a URL HTTPS do novo site, e gere uma nova versão.

## 6. Verificar antes de divulgar

- Catálogo, vídeo, notícias e eventos acessíveis pelo novo domínio.
- Painel fechado para visitantes; login autorizado funcionando; contatos não expostos nas APIs públicas.
- Cadastro de atleta gravado e visível à direção.
- Compra de teste com confirmação autenticada; pedido e ranking no ambiente correto.
- Produto com preço, prazo e condições de retirada definidos; imagens carregando pelo R2.
- Cópias de segurança e recuperação dos dados organizadas; acesso ao GitHub, à Cloudflare e ao Mercado Pago restrito aos responsáveis.

Os recursos e o login da nova conta Cloudflare precisam ser configurados por quem possui acesso a ela. A presença dos arquivos no GitHub não significa que a nova hospedagem já foi ativada. O site anteriormente publicado permanece disponível no endereço anterior até a migração ser concluída.

Referências oficiais: [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [validação de JWT do Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/).
