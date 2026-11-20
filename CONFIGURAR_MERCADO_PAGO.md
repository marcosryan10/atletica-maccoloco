> Para esta versão na Cloudflare, configure primeiro o domínio, o Access e o segredo de runtime conforme HOSPEDAR_NA_CLOUDFLARE.md. Substitua SEU-DOMINIO pelo endereço do Worker.

# Ativação da loja MaccoLoco

A estrutura usa o banco D1 para produtos, pedidos e situações de pagamento; Imagens pequenas (até 200 KB) podem ficar no próprio D1; R2 é opcional para arquivos maiores. A loja não importa os antigos testes do navegador e não recebe dados de cartão. A cobrança acontece no Checkout Pro do Mercado Pago via Preferences API.

## O que o responsável precisa fazer

1. Entrar na [Área da direção](https://SEU-DOMINIO/admin) via Cloudflare Access com o e-mail `associacaoatleticamaccoloco@gmail.com`.
2. Em **Produtos**, clicar em **Adicionar abadá e tirante** para gravar os modelos no banco, ou cadastrar outros produtos. Informar preços reais, opções, imagens e condições/prazo de retirada ou entrega. A compra fica bloqueada quando faltam preço ou informações de entrega. As imagens dos dois modelos são ilustrativas.
3. Em **Recebimento · Mercado Pago → Conectar conta**, seguir as instruções exibidas. Criar uma aplicação de Checkout Pro via Preferences API em [Suas integrações](https://www.mercadopago.com.br/developers/panel/app).
4. Cadastrar o evento **Pagamentos** em Webhooks, para a URL `https://SEU-DOMINIO/api/shop/webhook`. Cadastrar também a URL no ambiente de teste usado na aplicação.
5. Informar no formulário restrito o **Access Token** e a **assinatura secreta de Webhooks** do ambiente de teste, e uma identificação para a conta. Não enviar esses valores pelo chat. A conta é conferida na API do Mercado Pago antes de gravar a configuração. A aplicação rejeita credenciais de conta real no modo de teste e vice-versa.
6. Com a direção autenticada, abrir **Produtos** no site e iniciar uma compra de teste com uma conta de comprador de teste diferente da conta vendedora. Usar os dados de teste indicados na [documentação oficial](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/integration-test/test-purchases). Não usar cartão real. Confirmar o pedido em **Pedidos e vendas → Pagamentos de teste**, inclusive o recebimento da notificação autenticada.
7. Após o teste aprovado, selecionar **Produção** na conexão, fornecer as credenciais da conta real que receberá as vendas e a assinatura de Webhooks correta dessa aplicação. Conferir o recebedor antes de confirmar. A produção fica bloqueada enquanto não houver um pagamento de teste aprovado e uma notificação autenticada registrada.
8. A conta bancária é vinculada pelo próprio titular dentro do Mercado Pago. Não é preciso informar senha bancária ao site. Pix, cartões e demais meios disponíveis dependem da conta, da aplicação e das opções oferecidas pelo Mercado Pago. O site não promete aprovação de pagamentos nem prazos de liberação de saldo.

## Operação

- **Pedidos e vendas** separa testes e vendas reais. Indicadores e ranking consideram pedidos pagos. O valor é bruto, antes das tarifas, e não equivale a saldo bancário disponível.
- A direção pode mudar a preparação somente de pedidos pagos: Pendente, Em preparação, Pronto para retirada e Entregue. Não há ação administrativa para inventar confirmação financeira.
- Reembolsos e cancelamentos devem ser efetuados no Mercado Pago. Notificações atualizam a situação aqui. A ação **Conferir pagamento** consulta um ID na API e valida pedido, recebedor, moeda, valor e ambiente.
- Cada checkout contém um produto e uma quantidade de 1 a 10. Não há carrinho, cálculo de frete, estoque automático, parcelamento customizado ou divisão de recebimento entre contas. O recebedor é uma única conta por configuração. Pagamentos parciais ou divergentes não liberam entrega automaticamente; dois pagamentos integrais para o mesmo pedido exigem revisão.
- O comprador consulta o pedido no navegador em que iniciou a compra. Um cookie HttpOnly não contém os contatos e expira em 30 dias. Se o cookie for perdido, o atendimento é feito pela direção.
- Informações de contato são restritas ao painel. O banco não fica acessível diretamente ao navegador. Consultas usam parâmetros; notificações são autenticadas por HMAC e conferidas com a API do provedor. Repetir uma notificação não duplica o pagamento no banco.
- As credenciais de pagamento são cifradas com AES-256-GCM, com chave separada no segredo de hospedagem `SHOP_ENCRYPTION_KEY`. Elas não são devolvidas pelas APIs. Não remover ou trocar essa chave sem um plano de rotação: credenciais existentes deixariam de ser decifráveis. Para trocar de conta com pedidos pendentes, conciliar primeiro os pagamentos anteriores, pois apenas uma conexão é mantida.
- Atualizações, revisão de acessos, cópias de segurança e recuperação testada continuam sendo responsabilidades operacionais. Não foi realizado teste de intrusão independente, nem validado pagamento externo sem as credenciais do recebedor. Nenhuma proteção garante ausência absoluta de incidentes.

## Domínio

O endereço atual serve para o checkout e o webhook; não é necessário comprar domínio para começar. Um domínio próprio pode ser conectado depois. Ao mudar o endereço, revisar as URLs de retorno e a configuração de Webhooks no Mercado Pago.

## Validação técnica desta versão

TypeScript e build de produção; testes de HMAC, criptografia autenticada e rejeição de alteração de valor, moeda, recebedor, referência e ambiente; testes HTTP de autorização, origem, catálogo persistente e bloqueio de produção sem teste. Validados localmente: proteção por cookie no pedido, ausência de contatos no retorno ao comprador, ranking somente de pagos, preparação somente de pagos e upload/consulta de imagem em R2. Dados fictícios dos testes foram limitados ao banco local e removidos.

Não confundir esses testes com uma transação validada na conta Mercado Pago: essa etapa depende da configuração do titular. A verificação visual automatizada está indisponível neste ambiente.
