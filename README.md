# Atlética MaccoLoco

Sistema da Associação Atlética Unificada MaccoLoco, formada por estudantes do IFNMG Campus Almenara. O projeto reúne o site da atlética, a inscrição de atletas, a loja e o painel usado pela direção.

A ideia é concentrar em um só lugar as informações que antes ficavam espalhadas: notícias, eventos, interessados em participar, produtos e acompanhamento dos pedidos.

**Site:** [atletica-maccoloco.mro1.workers.dev](https://atletica-maccoloco.mro1.workers.dev/)

## Funcionalidades

- Apresentação da atlética e divulgação dos parceiros.
- Notícias e eventos com imagem, texto e controle de publicação.
- Formulário de inscrição de atletas e consulta das inscrições pela direção.
- Catálogo com imagens, preços, tamanhos e cadastro de categorias.
- Pedidos com pagamento por Pix ou dinheiro.
- QR Code Pix e código Copia e Cola com o valor do pedido.
- Confirmação manual de recebimentos, acompanhamento da preparação e indicadores de vendas.
- Painel administrativo com contas individuais e permissões por integrante.
- Conta principal da associação para liberar e revogar acessos da direção.
- Área do cliente com pedidos próprios e notificações internas de atualização.

No Pix, o comprador faz a transferência pelo aplicativo do banco. O pedido continua pendente até a direção conferir o recebimento e confirmar no painel. O sistema registra quem fez a confirmação, a data e uma referência da conferência.

## Tecnologias utilizadas

| Tecnologia | Uso no projeto |
| --- | --- |
| React | Componentes da interface, formulários e painel administrativo. |
| TypeScript | Código das páginas, validações e rotas do servidor. |
| CSS | Identidade visual, organização dos elementos e adaptação para celular. |
| Vinext e Vite | Estrutura da aplicação, ambiente de desenvolvimento e compilação para publicação. |
| Cloudflare Workers | Execução do site e das funções do servidor. |
| Cloudflare D1 | Banco de dados SQLite para inscrições, publicações, parceiros, produtos, categorias e pedidos. |
| Drizzle ORM e Drizzle Kit | Consultas ao banco, definição das tabelas e migrações. |
| Supabase Auth | Autenticação por e-mail e senha da direção e dos clientes. |
| GitHub e GitHub Actions | Versionamento do código e verificações automáticas. |
| Wrangler | Publicação e gerenciamento dos recursos da Cloudflare. |

A geração do QR Code usa a biblioteca `qrcode-generator`. O valor e a referência do pedido são definidos no servidor antes de montar o código Pix.

## Organização dos arquivos

```text
app/
  api/          Rotas do servidor
  ui/           Componentes da interface
  admin/        Página do painel
  login/        Páginas de acesso
  produtos/     Página da loja
  pedido/       Acompanhamento do pedido
  minha-conta/  Login e área pessoal do cliente
db/             Conexão e estrutura do banco
drizzle/        Migrações do banco de dados
lib/            Validações e funções compartilhadas
public/         Logos, imagens, vídeo e outros arquivos públicos
scripts/        Comandos de desenvolvimento e publicação
tests/          Testes das regras do sistema
worker/         Entrada da aplicação na Cloudflare
```

As páginas são escritas em componentes React, nos arquivos `.tsx`. O Vinext usa o Vite para compilar a aplicação e preparar o que será executado no servidor e no navegador. Por isso, a página inicial fica em `app/page.tsx`, em vez de um `index.html` escrito manualmente.

## Hospedagem e banco de dados

O código fica neste repositório. Quando uma atualização chega à branch `main`, a Cloudflare Workers Builds compila e publica a aplicação. As migrações do D1 são aplicadas pelo processo de publicação.

O GitHub Actions executa a checagem de tipos, os testes e o build. Os testes cobrem autenticação, pedidos, Pix, categorias e imagens das publicações.

Os dados da atlética ficam no D1. O Supabase Auth é usado para o login da direção e dos clientes, e as operações administrativas passam pela validação de acesso no servidor.

## Responsável pelo projeto

**Marcos Ryan Oliveira Porto**

[GitHub](https://github.com/marcosryan10) · [LinkedIn](https://www.linkedin.com/in/marcosryanl)

As licenças e os avisos de autoria das bibliotecas e dos arquivos de terceiros permanecem nos respectivos arquivos.

Contas de clientes não concedem acesso administrativo. A autorização da direção é consultada no servidor em cada operação. Pedidos de uma conta são consultados pelo identificador autenticado; o e-mail informado em um formulário não libera o histórico de compras. As notificações aparecem dentro da área pessoal, sem envio de push ou WhatsApp.
