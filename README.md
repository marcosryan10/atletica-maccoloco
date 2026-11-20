# Atlética MaccoLoco

Sistema da Associação Atlética Unificada MaccoLoco, formada por estudantes do IFNMG Campus Almenara. Inclui apresentação, notícias, eventos, inscrição de atletas, parceiros, catálogo de produtos e painel da direção.

## Hospedar a partir do GitHub

O sistema completo é uma aplicação **React/Vinext para Cloudflare Workers**, com **D1** para os dados e **R2** para imagens. A implantação pode acompanhar a branch `main` por **Workers Builds**.

**Comece pelo [guia de hospedagem na Cloudflare](HOSPEDAR_NA_CLOUDFLARE.md).** Ele explica criação dos recursos, comandos de build/deploy, domínio e autenticação da direção. Não é um projeto para GitHub Pages nem um upload estático para Cloudflare Pages.

## Loja e pagamentos

- Produtos com categoria, imagem, preço, tamanhos e condições de retirada.
- Pedidos persistentes, compradores restritos à direção, preparação e ranking de vendas pagas.
- Checkout hospedado pelo Mercado Pago, valores definidos no servidor e confirmação autenticada.
- Teste e produção separados. Cobranças desativadas até configurar a conta e concluir o teste exigido.
- Credenciais cifradas no servidor com AES-256-GCM; chave separada em segredo do Worker.

[Configurar Mercado Pago](CONFIGURAR_MERCADO_PAGO.md). A conta recebedora, os recursos Cloudflare e o domínio precisam ser configurados pelo titular. O repositório não inclui dados reais do banco, senhas, credenciais ou os segredos da hospedagem anterior.

## Acesso da direção

Esta versão usa **Cloudflare Access**, com validação criptográfica de JWT, emissor, audiência, validade e e-mail autorizado no servidor. Cabeçalhos de identidade da hospedagem anterior não dão acesso. Sem configuração válida, o painel e suas APIs ficam fechados.

## Desenvolvimento

Requer Node.js 24.

```sh
npm ci
npm run check
npm run test:auth
npm run test:payments
npm run build
npm run dev
```

O banco local inicia vazio. Para aplicar o esquema localmente:

```sh
npx wrangler d1 migrations apply DB --local --config wrangler.jsonc
```

A entrada no painel depende de Access configurado; o desenvolvimento não habilita um usuário administrador fictício. Não use dados pessoais reais nos testes.

## Publicação

No Workers Builds: build `npm run build`, deploy `npm run deploy:cloudflare`. O script aplica migrações no D1 configurado e publica a saída do build. O identificador de banco em `wrangler.jsonc` é um marcador e deve ser substituído pelo real. Use recursos separados para prévias e produção.

O workflow do GitHub executa verificação de tipos, testes de autenticação e pagamentos, e compilação. Ele não recebe credenciais de produção e não publica sozinho na Cloudflare.

## Origem e materiais

A versão de apresentação que existia neste repositório foi preservada em [legacy](legacy). O histórico de commits também foi mantido. Imagens, mascote, vídeo e portfólio foram fornecidos pela direção; os modelos iniciais de produtos são ilustrativos. Tipografia: Oswald e Manrope. A presença dos materiais no repositório não concede autorização de uso das marcas por terceiros.

[Marcos Ryan Oliveira Porto](https://github.com/marcosryan10)
