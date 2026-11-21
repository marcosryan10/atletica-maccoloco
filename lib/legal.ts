export {legalContact} from './legal-contact';

export type Policy = {
  slug: string; title: string; description: string; summary: string;
  sections: {id: string; title: string; paragraphs?: string[]; items?: string[];
    table?: {headers: string[]; rows: string[][]}}[];
  sources: {title: string; url: string}[];
};
const lgpd = {title: 'Lei Geral de Proteção de Dados Pessoais (LGPD)', url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm'};
const cdc = {title: 'Código de Defesa do Consumidor', url: 'https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm'};
const ecommerce = {title: 'Decreto do comércio eletrônico', url: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm'};

export const policies: Policy[] = [
  {
    slug: 'privacidade', title: 'Política de privacidade',
    description: 'Como a MaccoLoco trata dados de atletas, compradores e responsáveis pelo site.',
    summary: 'Usamos os dados necessários para organizar a participação esportiva, atender você e processar pedidos. Seus contatos não fazem parte da divulgação de patrocinadores.',
    sections: [
      {id: 'responsavel', title: 'Quem cuida dos seus dados', paragraphs: [
        'A MaccoLoco é uma organização estudantil independente, sem CNPJ neste momento. Marcos Ryan Oliveira Porto é o responsável pelo site, pelas vendas e pelas decisões sobre o tratamento de dados neste ambiente, em conjunto com a direção autorizada. Os contatos e o endereço de atendimento estão ao final desta página.',
        'A organização é formada por estudantes do IFNMG Campus Almenara. Isso não torna o Instituto responsável pela loja ou pelo tratamento de dados realizado pela MaccoLoco.'
      ]},
      {id: 'dados', title: 'Quais informações são tratadas', table: {headers: ['Situação', 'Informações', 'Finalidade'], rows: [
        ['Interesse esportivo', 'Nome, e-mail, WhatsApp, curso, período, modalidades, experiência e disponibilidade opcional.', 'Organizar grupos e entrar em contato sobre participação esportiva.'],
        ['Compras', 'Nome, e-mail, WhatsApp, produto, tamanho, quantidade, valores, referência, datas, retirada e situação do pedido.', 'Preparar o pedido, conferir o recebimento, combinar retirada e prestar atendimento.'],
        ['Pagamento Pix', 'Código Pix, nome do recebedor, valor, referência do pedido e registro da confirmação pela direção.', 'Apresentar a instrução de pagamento e conciliar o pedido com o valor recebido.'],
        ['Área do cliente', 'E-mail confirmado, identificador da conta, pedidos vinculados e notificações internas com situação de leitura.', 'Permitir consulta privada de pedidos e suas atualizações.'],
        ['Área da direção', 'E-mail autorizado, informações de autenticação, sessão e registros das operações administrativas.', 'Validar o acesso e permitir a gestão do sistema.'],
        ['Funcionamento e proteção', 'Dados técnicos da conexão, endereço IP tratado pela infraestrutura, registros de erro e identificadores temporários de controle de tentativas.', 'Entregar páginas, identificar falhas e limitar abuso.']
      ]}, paragraphs: [
        'Os formulários públicos não pedem CPF, documento de identidade, dados de cartão ou informações de saúde. Evite incluir diagnósticos, documentos, senhas ou outros dados sensíveis em campos livres. Se alguma atividade exigir informações adicionais, a necessidade e as condições devem ser explicadas separadamente.'
      ]},
      {id: 'finalidades', title: 'Para que usamos os dados e em que nos apoiamos', items: [
        'Inscrição esportiva: autorização de contato dada no formulário. Ela pode ser revogada pelo canal de atendimento.',
        'Pedidos e atendimento: procedimentos solicitados pelo comprador e execução da compra, sem depender de autorização para publicidade.',
        'Registros obrigatórios e defesa de direitos: cumprimento de obrigações aplicáveis e exercício regular de direitos.',
        'Segurança e prevenção de abuso: proteção da operação e interesse legítimo, quando cabível, com uso limitado ao necessário.'
      ], paragraphs: ['O envio do cadastro não garante vaga esportiva nem formaliza associação. Não usamos esses dados para vender listas de contatos, selecionar públicos de anúncios ou enviar ofertas de parceiros. Publicação de imagem ou uso para outra finalidade exige avaliação e informação próprias.']},
      {id: 'compartilhamento', title: 'Acesso, prestadores e serviços externos', paragraphs: [
        'As inscrições e os pedidos ficam no banco Cloudflare D1 e são consultados pela direção autorizada. A Cloudflare também executa o site e trata informações técnicas da conexão. O Supabase Auth presta o serviço de autenticação de integrantes da direção e clientes. O acesso administrativo é limitado pelas permissões registradas no servidor, e alterações dessas permissões têm registro de auditoria. O Gmail da associação é utilizado como serviço SMTP para envio dos links de confirmação e recuperação de acesso; esse envio envolve o endereço do destinatário e o conteúdo da mensagem de autenticação. A senha é encaminhada ao serviço de autenticação; não é armazenada na tabela de pedidos ou de atletas.',
        'O site carrega fontes do Google Fonts. Essa conexão pode transmitir ao Google informações técnicas, como IP e características da solicitação. Links para Instagram e aplicativos bancários levam a ambientes com políticas próprias. O código do site fica no GitHub; os dados de cadastros e pedidos não são publicados nesse repositório.',
        'Prestadores podem processar informações fora do Brasil. O uso desses serviços deve respeitar as regras da LGPD para transferências internacionais e as garantias aplicáveis. Solicitações sobre esses tratamentos podem ser enviadas ao contato desta política.',
        'Informações podem ser compartilhadas com autoridades quando houver obrigação válida ou para exercício de direitos. Uma eventual necessidade de entrega por terceiro será informada antes de compartilhar os dados indispensáveis. Patrocinadores não recebem acesso à base de inscritos ou compradores.'
      ]},
      {id: 'pix', title: 'Pagamento e dados bancários', paragraphs: [
        'O pagamento é realizado no aplicativo do banco do comprador ou em dinheiro, quando a opção estiver disponível. A confirmação no site é manual, depois da conferência pelo responsável financeiro. Escanear o QR Code ou informar que pagou não confirma o recebimento.',
        'O código Pix inclui informações necessárias à transferência, inclusive chave, nome, valor e referência. O aplicativo bancário apresenta a identificação do titular para conferência. O site não pede senha bancária, token, número de cartão ou acesso à sua conta. Um comprovante, quando necessário ao atendimento, deve ser enviado com dados alheios à compra ocultados.'
      ]},
      {id: 'retencao', title: 'Por quanto tempo mantemos as informações', paragraphs: [
        'A direção deve revisar a necessidade dos cadastros a cada ciclo de organização esportiva. Dados de pessoas sem participação ou contato ativo devem ser eliminados ou anonimizados quando deixarem de servir à finalidade informada; a retirada da autorização também pode ser solicitada. O sistema não realiza essa revisão ou exclusão automaticamente.',
        'Pedidos, atendimentos e comprovantes são mantidos durante a execução da compra e pelo período necessário às obrigações aplicáveis, garantias e defesa de direitos. Esse período pode ser diferente conforme o documento e a situação. Retenção adicional deve ter motivo específico, como uma disputa em andamento, e acesso limitado.',
        'A duração dos cookies está no aviso de cookies. Apagar um cookie do navegador não apaga os registros da compra: são operações diferentes. Para tratar da exclusão dos dados no sistema, use o contato de privacidade.'
      ]},
      {id: 'direitos', title: 'Seus direitos e como fazer uma solicitação', paragraphs: [
        'Você pode solicitar confirmação do tratamento, acesso, correção, informações sobre compartilhamento e, conforme o caso, eliminação, anonimização, bloqueio, portabilidade, oposição e revogação do consentimento. A eliminação pode ser limitada por uma obrigação legal ou pela necessidade de preservar direitos; a razão será informada.',
        'Envie um e-mail com o assunto “Privacidade”, explicando o pedido e o cadastro ou compra a que ele se refere. Podemos pedir uma verificação proporcional para evitar entregar dados a outra pessoa. Não envie documentos completos sem orientação. A declaração completa de acesso deve observar o prazo legal de até 15 dias, ressalvadas as regras aplicáveis ao caso.',
        'Caso considere o atendimento inadequado, você pode recorrer à Autoridade Nacional de Proteção de Dados e aos órgãos de defesa do consumidor. Revogar a autorização de contato esportivo não cancela uma compra nem impede atendimento relativo a ela.'
      ]},
      {id: 'menores', title: 'Crianças e adolescentes', paragraphs: [
        'O site não oferece atividades dirigidas a crianças. O tratamento de dados de menores deve respeitar seu melhor interesse e as regras aplicáveis à idade e à finalidade. Compras e participação que exijam representação ou assistência devem contar com o responsável legal. Se identificar um cadastro que demande providências adicionais, avise a direção para avaliação e correção.'
      ]},
      {id: 'atualizacoes', title: 'Mudanças nesta política', paragraphs: [
        'A data desta página identifica a versão vigente. Mudanças de finalidade ou inclusão de ferramentas de rastreamento devem ser informadas antes do novo uso e, quando necessário, submetidas a consentimento específico. Não tratamos a simples navegação como autorização geral para usar seus dados.'
      ]}
    ], sources: [lgpd, {title: 'Canal da Autoridade Nacional de Proteção de Dados', url: 'https://www.gov.br/anpd/pt-br'}]
  },
  {
    slug: 'termos-de-uso', title: 'Termos de uso',
    description: 'Regras de uso do site, participação esportiva, compras e atendimento da MaccoLoco.',
    summary: 'Este site reúne informações da Atlética, inscrições e a loja. Leia a oferta de cada produto e confira seus dados antes de enviar um pedido.',
    sections: [
      {id: 'identificacao', title: 'Quem oferece o site e os produtos', paragraphs: [
        'A Associação Atlética Unificada MaccoLoco é uma organização estudantil independente, sem CNPJ neste momento. Marcos Ryan Oliveira Porto responde pela operação deste site e pelas vendas apresentadas pela MaccoLoco. O endereço e o e-mail de atendimento estão publicados ao final desta página.',
        'O site não é uma loja do IFNMG. A instituição de ensino não é indicada como fornecedora, garantidora de compras ou responsável financeira da organização. A ausência de CNPJ não afasta obrigações de identificação, documentação, tributação ou proteção ao consumidor que sejam aplicáveis à operação.'
      ]},
      {id: 'uso', title: 'Uso do conteúdo e das funções', paragraphs: [
        'Você pode consultar conteúdos, verificar eventos, registrar interesse esportivo e comprar produtos disponíveis. Informe dados corretos e seus próprios contatos, ou atue com autorização válida. Não envie conteúdo ilegal, pedidos falsos, mensagens ofensivas, programas maliciosos ou tentativas de acesso a registros de outras pessoas.',
        'Marcas, fotografias e textos devem ser utilizados respeitando seus titulares e as autorizações existentes. Compartilhar um link para o site é permitido. Reutilizar imagens de pessoas, logotipos de parceiros ou a marca institucional pode exigir autorização própria.'
      ]},
      {id: 'esporte', title: 'Inscrições esportivas e eventos', paragraphs: [
        'O formulário de atletas registra interesse. A direção avaliará organização de grupos, critérios de participação e disponibilidade. Enviar o cadastro não confirma seleção, treinamento, associação ou uso de instalações da instituição.',
        'Datas, locais, condições e eventuais custos de eventos serão informados na divulgação específica. Um evento publicado não implica venda de ingresso por este site. Quando houver contratação de evento ou serviço, suas condições e os direitos aplicáveis deverão ser apresentados antes da compra.'
      ]},
      {id: 'compras', title: 'Como funciona uma compra', items: [
        'Confira a descrição, o preço em reais, o tamanho, a quantidade e as informações de retirada ou entrega do produto.',
        'Antes de continuar, corrija eventuais erros nos campos e leia a política de trocas, devoluções e reembolsos.',
        'O resumo mostra o total dos produtos. Qualquer custo adicional de entrega ou outra cobrança precisa ser informado e aceito antes da contratação; não será incluído de surpresa.',
        'Depois de enviar, guarde a referência do pedido. Pedidos feitos sem login são acompanhados no navegador utilizado. Ao comprar com uma conta autenticada, o pedido também fica vinculado ao identificador dessa conta. Pedidos anteriores só podem ser vinculados quando há o cookie original da compra e correspondência com o e-mail confirmado. Caso perca o acesso, fale com o atendimento para localizar o pedido de forma segura.'
      ], paragraphs: [
        'A oferta deve informar a disponibilidade e o prazo ou condição de retirada. Não há um prazo único para todos os produtos. Se faltar informação essencial, peça esclarecimento antes de pagar. Dificuldades de estoque ou erros na oferta serão tratados com o consumidor, preservando seus direitos; não autorizam mudança unilateral do preço de um pedido já contratado.'
      ]},
      {id: 'pagamento', title: 'Pagamento e acompanhamento', paragraphs: [
        'As opções atuais são Pix e dinheiro, conforme disponibilidade no pedido. No Pix, confira titular, banco e valor no aplicativo bancário. A conta recebedora é a indicada pela organização e pode ser de um responsável financeiro. Essa indicação não transfere ao banco a responsabilidade pela venda.',
        'O pedido começa pendente. A direção confere o crédito ou o recebimento em dinheiro e registra a confirmação manual. A atualização não é instantânea nem realizada automaticamente pelo banco neste sistema. Se já pagou, não repita a transferência; envie a referência ao atendimento se precisar de ajuda.',
        'O site não oferece pagamento por cartão nem coleta credenciais bancárias. Não existe expiração automática de cinco minutos do QR Code apresentada como garantia neste sistema. Se um pedido for cancelado e houver pagamento posterior, entre em contato para conciliação e restituição cabível.'
      ]},
      {id: 'entrega', title: 'Retirada, entrega e alterações do pedido', paragraphs: [
        'A retirada deve seguir as informações da oferta e as orientações do atendimento. O endereço de atendimento da organização não substitui automaticamente o local de retirada de cada produto. Para atendimento presencial, combine antes com a direção.',
        'Se precisar corrigir tamanho, quantidade ou contato depois do envio, solicite a alteração com a referência do pedido antes da preparação, quando possível. Se houver atraso ou impossibilidade de cumprir a oferta, a direção deve comunicar a situação e oferecer as alternativas previstas em lei, sem impor crédito na loja.'
      ]},
      {id: 'direitos', title: 'Direitos do consumidor e atendimento', paragraphs: [
        'A política de trocas, devoluções e reembolsos complementa estes termos. Nenhuma disposição do site elimina direitos legais, afasta responsabilidade obrigatória ou transforma a conferência do pagamento em renúncia a reembolso.',
        'Dúvidas, reclamações, correções e cancelamentos podem ser enviados ao e-mail publicado. A solicitação deve ser registrada e seu recebimento confirmado. O prazo de resposta às demandas de consumo é de até cinco dias, sem prejuízo de providências ou prazos legais mais favoráveis. Se necessário, o consumidor pode buscar o Procon ou a Justiça, preservadas as regras de competência que o protegem.'
      ]},
      {id: 'contas', title: 'Área restrita e disponibilidade', paragraphs: [
        'A área do cliente é opcional e permite consultar pedidos vinculados à própria conta. As notificações são avisos internos do site sobre recebimento, pagamento e preparação; não são alertas por WhatsApp, push ou e-mail. Para exclusão da conta ou correção dos registros, utilize o atendimento. Não compartilhe sua senha. Criar uma conta de cliente não concede permissão administrativa.',
        'O painel da direção exige autenticação e autorização no servidor. Visitantes e compradores não precisam de uma conta administrativa. Tentativas de contornar o acesso são proibidas. Credenciais e recuperação de senha devem permanecer sob o controle do responsável autorizado.',
        'O serviço pode passar por manutenção ou interrupções. A direção deve tratar falhas e manter um canal de contato para pedidos em andamento. Indisponibilidade técnica não elimina obrigações já assumidas com compradores.'
      ]},
      {id: 'versao', title: 'Privacidade e mudanças das regras', paragraphs: [
        'O tratamento de dados é explicado na política de privacidade e no aviso de cookies. A ciência dessas informações não é autorização para publicidade ou para finalidades incompatíveis com a compra.',
        'Alterações valem para usos e contratações posteriores à divulgação, respeitando direitos adquiridos e as condições dos pedidos anteriores. O uso por menores de idade deve observar as regras de representação ou assistência aplicáveis.'
      ]}
    ], sources: [ecommerce, cdc]
  },
  {
    slug: 'cookies', title: 'Aviso de cookies',
    description: 'Cookies de pedidos e autenticação, armazenamento de preferências e controles no navegador.',
    summary: 'A versão atual usa cookies necessários ao pedido e ao login da direção e da área do cliente. Não há cookies próprios de publicidade ou ferramentas de análise de audiência instaladas no código do site.',
    sections: [
      {id: 'conceito', title: 'O que são e por que existem', paragraphs: [
        'Cookies são pequenos registros guardados pelo navegador e enviados ao site em determinadas conexões. Eles permitem, por exemplo, reconhecer a sessão de um pedido sem publicar seus dados. Armazenamento local é uma tecnologia diferente: ele guarda uma preferência no dispositivo, sem enviá-la automaticamente a cada solicitação.'
      ]},
      {id: 'inventario', title: 'Cookies e armazenamento utilizados', table: {headers: ['Nome', 'Uso', 'Duração no navegador'], rows: [
        ['__Host-maccoloco-shop', 'Identificador aleatório que permite consultar os pedidos feitos no mesmo navegador. Não contém nome, e-mail ou WhatsApp em texto.', 'Até 30 dias após a criação ou renovação ao enviar um pedido.'],
        ['__Host-macco-access', 'Autenticação da direção ou da área do cliente. Criado após login com e-mail confirmado.', 'Até 1 hora; pode ser substituído durante a renovação da sessão.'],
        ['__Host-macco-refresh', 'Renovação da sessão autenticada da direção ou do cliente.', 'Até 8 horas. O logout solicita a remoção dos cookies de autenticação.'],
        ['maccoloco-cookie-notice-v1 (armazenamento local)', 'Lembrar que o aviso de cookies foi fechado. Não autoriza rastreamento ou publicidade.', 'Até você remover os dados do site no navegador ou a versão do aviso mudar.']
      ]}, paragraphs: [
        'Os cookies de pedido e autenticação são usados no próprio domínio, com atributos de proteção no ambiente HTTPS. Eles não são criados apenas por ler uma notícia. A duração do cookie não corresponde ao prazo de conservação do registro de compra no banco de dados.'
      ]},
      {id: 'terceiros', title: 'Serviços externos e cookies opcionais', paragraphs: [
        'Não instalamos Google Analytics, Meta Pixel ou cookies de anúncios na versão atual. A Cloudflare presta infraestrutura e proteção e pode aplicar mecanismos técnicos conforme a configuração e as condições de acesso. Isso não autoriza o uso dos seus dados para campanhas da Atlética.',
        'As fontes são carregadas do Google Fonts, que recebe dados técnicos da conexão. Instagram e bancos são acessados por links ou aplicativos próprios; nesses ambientes, as regras são dos respectivos serviços. Se o site passar a incorporar ferramentas opcionais que usem consentimento, elas deverão permanecer bloqueadas até a escolha correspondente, com possibilidade de recusa e revisão.'
      ]},
      {id: 'escolhas', title: 'Como controlar no seu dispositivo', paragraphs: [
        'Você pode consultar, bloquear ou apagar cookies nas configurações de privacidade do navegador, normalmente em “Dados do site” ou “Cookies”. Bloquear os cookies necessários pode impedir o login da direção e o acompanhamento de pedidos. A leitura das páginas públicas não depende de aceitar anúncios.',
        'Se apagar os cookies da loja, guarde a referência do pedido e use o atendimento para recuperá-lo com verificação de identidade. Apagar os dados de navegação não cancela uma compra nem apaga a obrigação de atendimento.',
        'O botão “Entendi” do aviso apenas fecha a mensagem e registra essa preferência local. Ele não representa consentimento para cookies opcionais, compartilhamento comercial ou novos tratamentos.'
      ]},
      {id: 'contato', title: 'Dúvidas e atualização', paragraphs: [
        'Envie dúvidas sobre cookies ao e-mail da organização. Este inventário deve ser revisto sempre que uma integração, função de autenticação ou ferramenta de audiência mudar. A política de privacidade explica o tratamento dos dados além do navegador.'
      ]}
    ], sources: [lgpd, {title: 'Guia da ANPD sobre cookies e proteção de dados pessoais', url: 'https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais'}]
  },
  {
    slug: 'trocas-devolucoes-reembolsos', title: 'Trocas, devoluções e reembolsos',
    description: 'Como pedir troca, cancelar uma compra online ou solicitar restituição na loja MaccoLoco.',
    summary: 'Para resolver uma compra, envie a referência do pedido ao atendimento. Pix e dinheiro também estão sujeitos aos direitos de arrependimento, garantia e restituição aplicáveis.',
    sections: [
      {id: 'solicitar', title: 'Como abrir uma solicitação', items: [
        'Envie e-mail com o assunto “Troca, devolução ou reembolso” e informe a referência do pedido, seu nome e o que precisa resolver.',
        'Se o problema for visível, fotos podem ajudar. Elas não devem expor documentos ou dados bancários alheios à compra e não são uma barreira para registrar o atendimento.',
        'Guarde a mensagem enviada e o comprovante que já possui. Não forneça senha, token, número completo de cartão ou acesso ao aplicativo do banco.',
        'A direção orientará a coleta, postagem ou entrega para devolução. O endereço de atendimento está nesta página; combine antes o atendimento presencial.'
      ], paragraphs: ['A solicitação deve ser registrada e o recebimento confirmado. A resposta às demandas de consumo deve ocorrer em até cinco dias, sem suspender prazos ou medidas imediatas previstos em lei. Não é necessário abrir uma conta na loja para pedir atendimento.']},
      {id: 'arrependimento', title: 'Arrependimento em compras online', paragraphs: [
        'Em compras realizadas fora do estabelecimento, você pode desistir em até sete dias a partir da assinatura ou do recebimento, conforme o caso. Para produtos comprados neste site, considere o recebimento do produto. Não é preciso justificar a desistência.',
        'O reembolso abrange os valores pagos, inclusive frete original quando houver, sem multa. Os custos de devolução por arrependimento são da operação vendedora. A direção deve providenciar a restituição de imediato, na forma legal, e comunicar os dados necessários à conclusão do procedimento.',
        'Preserve o produto e envie os acessórios e itens recebidos. A embalagem original, se disponível, ajuda no transporte; ela não é uma condição automática para eliminar um direito legal. Não há exclusão genérica do arrependimento para produtos personalizados nesta política.'
      ]},
      {id: 'defeitos', title: 'Defeito, avaria ou produto diferente', paragraphs: [
        'Se o item chegar com avaria, defeito ou diferente do pedido, avise assim que perceber para facilitar a solução. O atendimento não fica limitado a uma janela de 24 ou 48 horas.',
        'Os prazos legais para reclamar de vícios aparentes são de 30 dias para produtos não duráveis e 90 dias para duráveis. Em vício oculto, a contagem começa quando o problema se evidencia. A classificação depende do produto e da legislação aplicável.',
        'A solução observará o prazo legal de até 30 dias para sanar o vício, quando cabível. Se não for resolvido, o consumidor pode escolher substituição, restituição ou abatimento, respeitadas as hipóteses de solução imediata. Os custos necessários para corrigir falha imputável ao fornecimento não são transferidos ao comprador.'
      ]},
      {id: 'tamanho', title: 'Troca por tamanho ou preferência', paragraphs: [
        'Se o tamanho não servir ou você mudar de preferência, o direito de arrependimento nas compras online continua disponível dentro do prazo legal explicado acima. Fora das hipóteses legais de arrependimento, defeito ou descumprimento da oferta, uma troca por preferência depende de condição adicional expressamente oferecida. Esta política não estabelece um prazo voluntário geral de troca além dos direitos legais.',
        'Se uma oferta ou condição já apresentada garantir uma troca mais favorável, ela deverá ser respeitada para a compra correspondente. Prazo, disponibilidade de tamanho, conservação do item, diferença de preço e eventuais custos de uma troca voluntária devem ser informados antes da compra e aceitos pelo consumidor. Essas condições adicionais não podem restringir os direitos legais de devolução, garantia e restituição.'
      ]},
      {id: 'cancelamento', title: 'Pedido não pago, atraso ou falta de estoque', paragraphs: [
        'Se ainda não pagou e quer desistir, comunique a direção para registrar o cancelamento. Se já fez o Pix, informe isso: a situação pendente no site não prova que o dinheiro não foi recebido.',
        'Em caso de descumprimento da oferta, inclusive indisponibilidade ou atraso, serão respeitadas as alternativas legais de cumprimento, produto equivalente ou rescisão com restituição, conforme a escolha cabível do consumidor. Uma nova data não será imposta sem seu conhecimento.',
        'Um Pix duplicado ou divergente deve ser comunicado com a referência do pedido. Após conciliação, os valores indevidos devem ser restituídos. Não faça uma nova transferência para liberar uma suposta devolução.'
      ]},
      {id: 'reembolso', title: 'Como o dinheiro é devolvido', paragraphs: [
        'A restituição é feita pelo responsável pela venda. Em Pix, a direção buscará a devolução vinculada à transferência original ou, quando necessário e de forma segura, os dados mínimos de uma conta do comprador. Em pagamento em dinheiro, combinará a devolução em dinheiro ou transferência aceita por você.',
        'O pedido de reembolso no atendimento não aciona um estorno automático no site. A direção deve executar a devolução e informar a confirmação, respeitando a restituição imediata nas situações em que a lei assim determina. O tempo de processamento do banco, quando houver, deve ser explicado; não será usado como prazo genérico para reter valores.',
        'Crédito ou vale na loja só substitui devolução em dinheiro quando essa alternativa for livremente escolhida pelo consumidor. Não há cobrança de taxa administrativa para exercer um direito legal.'
      ]},
      {id: 'preservacao', title: 'Seus direitos continuam preservados', paragraphs: [
        'Esta política trata dos produtos vendidos na loja do site. Serviços e ingressos eventualmente ofertados terão condições próprias antes da compra, sem afastar direitos legais. Havendo regra mais favorável ao consumidor na oferta ou na legislação, ela deve ser respeitada.',
        'O atendimento pelo e-mail da organização não impede uma reclamação ao Procon nem o uso dos demais canais legais de solução de conflitos.'
      ]}
    ], sources: [cdc, ecommerce]
  },
  {
    slug: 'seguranca-da-informacao', title: 'Política de segurança da informação',
    description: 'Medidas de proteção do site, responsabilidades da direção e comunicação de falhas.',
    summary: 'Protegemos o acesso às funções administrativas e limitamos a exposição dos dados. Segurança exige medidas técnicas e cuidados da direção; nenhum sistema oferece risco zero.',
    sections: [
      {id: 'escopo', title: 'O que esta política protege', paragraphs: [
        'Esta política abrange as inscrições esportivas, os pedidos, os dados de atendimento e as credenciais de acesso ao sistema MaccoLoco. Os objetivos são limitar o acesso a quem precisa, preservar a integridade dos registros e manter as funções disponíveis para usuários autorizados.'
      ]},
      {id: 'medidas', title: 'Medidas presentes no sistema', items: [
        'O site publicado utiliza HTTPS para proteger os dados durante a conexão.',
        'O painel exige autenticação pelo Supabase Auth e verificação de autorização no servidor para funções administrativas.',
        'Cookies de autenticação e de pedido utilizam proteções de navegador. O acompanhamento do pedido depende de identificador de sessão e referência compatíveis, em vez de uma listagem pública de compras.',
        'Rotas sensíveis validam dados e origem das solicitações; operações de autenticação e checkout aplicam limites de tentativas.',
        'As configurações sigilosas são mantidas no ambiente de execução. Elas não devem ser incluídas no código público do GitHub.',
        'O sistema registra a confirmação de pagamentos feita pela direção. Não solicita senha bancária, dados de cartão ou acesso à conta do comprador.'
      ], paragraphs: ['Essas medidas não equivalem a certificação, auditoria independente ou garantia de invulnerabilidade. Dados de contato não são divulgados na área pública nem enviados ao GitHub como parte da publicação do código.']},
      {id: 'direcao', title: 'Responsabilidades da direção', items: [
        'Manter a credencial autorizada sob controle do responsável, com senha exclusiva e proteção do e-mail de recuperação.',
        'Revisar quem pode usar o painel e retirar acessos quando houver mudança de função ou de gestão.',
        'Evitar exportações desnecessárias e proteger planilhas, comprovantes e arquivos que forem retirados do sistema.',
        'Manter dependências e configurações sob revisão, avaliar cópias de segurança e testar recuperação antes de depender de uma restauração.',
        'Revisar a necessidade de conservação dos dados e executar a eliminação ou anonimização cabível.'
      ], paragraphs: ['A política não afirma que existem cópias automáticas, monitoramento humano permanente ou atendimento técnico 24 horas. Essas rotinas precisam ser definidas e executadas pela organização e por seus prestadores.']},
      {id: 'usuarios', title: 'Cuidados para quem usa o site', paragraphs: [
        'Confira o endereço da página e a identificação do recebedor antes de pagar. Não informe senhas ou códigos bancários em mensagens enviadas em nome da Atlética. Em dispositivo compartilhado, guarde a referência do pedido e evite deixar sessões administrativas abertas.',
        'Use o atendimento para conferir um pedido suspeito. Não publique telas que mostrem contatos de outros alunos, comprovantes completos, links de recuperação ou credenciais.'
      ]},
      {id: 'incidentes', title: 'Como comunicar uma falha ou incidente', paragraphs: [
        'Envie ao e-mail da organização o assunto “Segurança”, a página afetada, o horário aproximado e uma descrição do comportamento. Não envie senhas nem dados de outras pessoas. Evite explorar a falha além do necessário para descrevê-la e não divulgue registros de terceiros.',
        'O responsável deve avaliar a ocorrência, conter o problema, preservar informações necessárias à apuração e orientar os afetados. Quando houver incidente com dados pessoais que demande comunicação à ANPD ou aos titulares, serão observados os critérios, conteúdos e prazos legais aplicáveis.',
        'Falhas e interrupções técnicas não extinguem obrigações de atendimento ou de entrega dos pedidos. A direção deve orientar alternativas pelo contato publicado enquanto uma função estiver indisponível.'
      ]},
      {id: 'revisao', title: 'Revisão das medidas', paragraphs: [
        'Mudanças de plataforma, equipe, autenticação ou forma de pagamento exigem revisão desta política e dos controles correspondentes. Regras de segurança não devem servir de justificativa para negar informações a quem tem direito a recebê-las, desde que a identidade seja verificada de modo proporcional.'
      ]}
    ], sources: [lgpd, {title: 'ANPD — comunicação de incidentes de segurança', url: 'https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis'}]
  },
  {
    slug: 'acessibilidade', title: 'Política de acessibilidade',
    description: 'Compromisso com navegação acessível e canal para informar barreiras no site MaccoLoco.',
    summary: 'Queremos que informações, inscrições e compras possam ser utilizadas por pessoas com diferentes necessidades. Se encontrar uma barreira, você pode pedir atendimento por e-mail sem precisar concluir um formulário inacessível.',
    sections: [
      {id: 'compromisso', title: 'Nosso compromisso e referências', paragraphs: [
        'A MaccoLoco busca melhorar continuamente o acesso ao site, tendo as WCAG 2.2, nível AA, como referência técnica. Isso é um objetivo de desenvolvimento e revisão, não uma declaração de conformidade integral ou certificação.',
        'A política se aplica às páginas, formulários e componentes mantidos pela organização. Conteúdos e serviços externos podem ter condições próprias, mas a direção deve buscar uma alternativa de atendimento quando uma barreira impedir o acesso a um serviço da Atlética.'
      ]},
      {id: 'recursos', title: 'Recursos e orientações de navegação', items: [
        'Idioma da página identificado como português do Brasil, títulos organizados e campos com rótulos.',
        'Links para pular diretamente ao conteúdo principal nas páginas públicas e indicação visível de foco nos controles.',
        'Navegação pelos links e botões com Tab e Shift+Tab; ativação com Enter e, quando aplicável, Espaço.',
        'Layout adaptável a telas menores e textos que podem ser ampliados pelos recursos do navegador.',
        'Controles de pausa do vídeo de abertura, que não utiliza áudio. Preferências de redução de movimento devem ser respeitadas nos efeitos de interface.',
        'Texto alternativo para imagens informativas e ausência de descrição redundante em imagens puramente decorativas, conforme revisão editorial.'
      ]},
      {id: 'limites', title: 'Limitações conhecidas e melhorias', paragraphs: [
        'Artes de notícias, materiais PDF e imagens enviadas pela direção podem conter texto que não esteja disponível para leitores de tela. A organização deve apresentar uma versão textual ou alternativa acessível quando necessário. A existência de um campo de descrição de imagem não garante que todos os conteúdos já tenham uma descrição adequada.',
        'O QR Code Pix depende de leitura visual por outro dispositivo. Por isso, o pedido também oferece Pix Copia e Cola em campo selecionável e um botão de cópia. O uso do aplicativo bancário permanece sujeito à acessibilidade do próprio banco.',
        'Não afirmamos ter concluído auditoria de todos os leitores de tela, navegadores e combinações de tecnologia assistiva. Barreiras de teclado, contraste, leitura, foco e redimensionamento devem ser registradas para correção e acompanhadas pela direção.'
      ]},
      {id: 'alternativa', title: 'Solicitar apoio ou uma alternativa acessível', paragraphs: [
        'Envie um e-mail com o assunto “Acessibilidade”, informando a página e a tarefa que não conseguiu concluir. Se desejar, indique dispositivo, navegador e tecnologia assistiva; não é necessário informar diagnóstico, deficiência ou documento médico.',
        'Você pode solicitar informações de um produto em texto, orientação sobre inscrição, esclarecimento sobre um pedido ou outro formato de conteúdo. A direção deve oferecer um caminho de atendimento que não dependa de repetir a barreira relatada. Demandas de consumo continuam sujeitas aos prazos de atendimento aplicáveis.'
      ]},
      {id: 'continuidade', title: 'Responsabilidade editorial e atualização', paragraphs: [
        'Ao publicar notícia, evento ou produto, a direção deve revisar título, descrição, texto alternativo, legibilidade e informações essenciais fora de imagens. Mudanças importantes nos formulários e na loja devem incluir verificação de teclado, celular e ampliação de texto.',
        'Esta política será atualizada conforme as revisões e as melhorias implementadas. Relatos de usuários fazem parte desse acompanhamento.'
      ]}
    ], sources: [{title: 'WCAG 2.2 — tradução autorizada em português', url: 'https://www.w3.org/Translations/WCAG22-pt-BR/'}, {title: 'Lei Brasileira de Inclusão', url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm'}]
  }
];

export function policyBySlug(slug: string) {
  const policy = policies.find(p => p.slug === slug);
  if (!policy) throw new Error('Política não encontrada');
  return policy;
}
