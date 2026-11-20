# Pix no Banco do Brasil e dinheiro

A loja utiliza exclusivamente Pix estático e dinheiro, com confirmação manual pela direção. Não exige API bancária, senha do banco, integração de cartão ou credenciais de um intermediário.

## Ativar os recebimentos

Na área da direção, abra Produtos → Configurar recebimentos. Cadastre uma chave Pix ativa no BB, o nome do titular e sua cidade. Prefira uma chave aleatória e confira titular/banco no aplicativo antes de habilitar. Você pode salvar os dados depois. Pix e dinheiro iniciam desativados.

A chave fica no QR Code e no Copia e Cola dos pedidos. Não é um segredo de acesso à conta. O aplicativo do comprador exibe os dados de identificação do recebedor. Somente o administrador autenticado pode alterar a configuração.

O QR Code é estático, não expira e não pode ser revogado individualmente pelo site. O valor é fixado a partir do preço salvo no servidor; confira o valor recebido. Não oriente o comprador a pagar novamente se já fez o Pix. Alterações na configuração só afetam novos pedidos; pedidos anteriores preservam os dados do destinatário original.

## Conferir pedidos

Em Pedidos, confira no extrato do BB o valor e a identificação da transação. Para dinheiro, receba o valor pessoalmente. Clique em Confirmar recebimento e registre uma referência da conferência, sem dados pessoais desnecessários. Apenas pedidos pendentes podem ser confirmados. O painel registra administrador, data e observação e inclui a venda no ranking.

Não confirme apenas com um comprovante do comprador. Não existe confirmação automática ou webhook bancário neste fluxo. Atualizações da página de acompanhamento somente consultam a confirmação feita pela direção.

Reembolsos e divergências devem ser tratados com o responsável financeiro; o site não movimenta dinheiro. Pedidos anteriores feitos por outro meio não podem ser marcados manualmente como pagos.

## Publicação e teste

A migração 0003_ancient_mulholland_black.sql adiciona configuração e campos de conferência sem apagar dados antigos. O deploy aplica as migrações antes de publicar.

Antes de abrir vendas reais: configure um produto de teste local, valide o QR Code com um leitor independente e confira o destinatário e o valor no aplicativo do BB sem concluir uma transferência. Confira autorização do painel, idempotência dos pedidos e isolamento entre compradores. Só habilite Pix após validação pelo titular.

As antigas credenciais e o histórico do provedor anterior são preservados no banco, mas não são usados para criar novos pedidos. O painel não oferece mais conexão com Mercado Pago.
