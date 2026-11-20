> Banco da Atlética configurado: `maccoloco-db`. O R2 permanece opcional para não exigir assinatura adicional.

# Hospedar o sistema completo a partir do GitHub

Este repositório contém a aplicação React/Vinext, o servidor, as migrações do banco D1 e armazenamento de imagens pequenas no D1, com R2 opcional. O destino é **Cloudflare Workers com Workers Builds**, conectado ao GitHub. GitHub Pages e o upload estático do Cloudflare Pages não executam esta loja.

A hospedagem anterior continua independente. Este repositório não contém banco de compradores, cadastros, credenciais ou a chave de criptografia daquele ambiente. A implantação em outra conta começa com recursos vazios. Não copie os testes locais para produção.

## 1. Criar banco e armazenamento na sua conta

Você pode criar os recursos pelo painel da Cloudflare ou pelo terminal, com Node.js 24:

```sh
npm ci
npx wrangler login
npx wrangler d1 create maccoloco-db
```

Copie o identificador real do banco retornado pela Cloudflare para `database_id` em `wrangler.jsonc`, substituindo os zeros. O vínculo deve se chamar **DB**. O R2 é opcional e não está exigido nesta configuração. Sem ele, imagens de produtos de até 200 KB são validadas e guardadas no D1. Se decidir ativar R2, crie um bucket e adicione um vínculo **BUCKET** no arquivo. Se escolher nomes diferentes para os recursos, atualize o arquivo antes de publicar.

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

## 3. Ativar o login da direção

A área da direção usa uma página própria de e-mail e senha, integrada ao Supabase Auth. Siga [CONFIGURAR_LOGIN.md](CONFIGURAR_LOGIN.md). Configure os valores de servidor `AUTH_SUPABASE_URL` e `AUTH_SUPABASE_KEY`, crie/convidе o e-mail autorizado e confirme a entrega da mensagem de ativação. O titular define a senha na página protegida, sem publicá-la no código.

Sem esses valores ou sem usuário confirmado, o login permanece desabilitado e as APIs administrativas recusam acesso. Nenhum cabeçalho de identidade enviado por um visitante concede acesso. Cloudflare Access pode existir como proteção externa adicional, mas não substitui a configuração deste login.

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
- Produto com preço, prazo e condições de retirada definidos; imagens carregando corretamente.
- Cópias de segurança e recuperação dos dados organizadas; acesso ao GitHub, à Cloudflare e ao Mercado Pago restrito aos responsáveis.

Os recursos e o login da nova conta Cloudflare precisam ser configurados por quem possui acesso a ela. A presença dos arquivos no GitHub não significa que a nova hospedagem já foi ativada. O site anteriormente publicado permanece disponível no endereço anterior até a migração ser concluída.

Referências oficiais: [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [validação de JWT do Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/).
