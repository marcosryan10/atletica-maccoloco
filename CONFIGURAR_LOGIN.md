# Login da direção com e-mail e senha

A direção entra em `/login`, dentro do próprio site. O e-mail autorizado é `associacaoatleticamaccoloco@gmail.com`. O Supabase Auth cuida da senha e dos tokens; produtos, pedidos e atletas continuam no Cloudflare D1. Nenhuma senha é guardada no D1, no código ou no GitHub.

## Ativação

1. Conecte sua conta Supabase ao aplicativo, ou crie um projeto em sua própria conta Supabase e use somente o recurso Authentication. Não é necessário transferir os dados da loja para lá.
2. Ative o provedor Email/Password e a confirmação de e-mail. Configure uma senha mínima de 14 caracteres. Desabilite o cadastro público depois de criar/convidar o único usuário autorizado.
3. Em Authentication → URL Configuration, configure a Site URL como `https://atletica-maccoloco.mro1.workers.dev/login/redefinir` e adicione `https://atletica-maccoloco.mro1.workers.dev/login/redefinir` às URLs de redirecionamento permitidas. Se usar domínio próprio, troque também essas URLs. O fluxo de recuperação usado aqui é o retorno implícito padrão da API de Auth, sem PKCE de cliente.
4. Em Authentication → Users, crie ou convide somente o e-mail autorizado da associação. O responsável deve receber o link no próprio e-mail e definir a senha pessoalmente na página protegida; não envie a senha pelo chat. Não ofereça uma página de cadastro aberta aos visitantes.
5. Configure o envio de e-mails de autenticação, preferencialmente com SMTP próprio. O serviço padrão do Supabase possui restrições de destinatários e limites; confirme a entrega de um convite e de uma recuperação antes de considerar o acesso ativado.
6. Configure no Worker os valores `AUTH_SUPABASE_URL` (URL HTTPS do projeto) e `AUTH_SUPABASE_KEY` (publishable key ou chave anon do projeto). São usados somente pelo servidor. A configuração `keep_vars` preserva esses valores nas próximas publicações feitas pelo GitHub. Não use chave secret, service_role, senha do banco ou senha do usuário nesses campos. O código recusa configuração de serviço privilegiado.
7. A nova configuração deve ser publicada para entrar em vigor. Verifique um login real do titular e depois o botão Sair. Uma senha incorreta não deve liberar o painel. Sem a configuração do provedor, o site exibe a página de login, mas mantém a entrada desabilitada.

## Proteções implementadas

- Identidade validada com a API do Supabase em cada operação protegida; cookies, e-mails em cabeçalhos e campos enviados pelo navegador não são prova de autorização.
- Somente o e-mail confirmado da associação, com usuário autenticado e não anônimo, pode receber uma sessão.
- Access e refresh tokens ficam em cookies `Secure`, `HttpOnly`, `SameSite=Strict`, com prefixo `__Host-` e sem Domain. Não são guardados em localStorage nem devolvidos em JSON ao frontend.
- Cookies têm validade limitada; o refresh token tem até oito horas no navegador, renovadas durante o uso. A saída limpa os cookies e tenta revogar a sessão no provedor. Access tokens emitidos pelo provedor podem continuar válidos até expirar: não prometa revogação instantânea de um token roubado.
- Mutações de autenticação exigem POST JSON com origem igual à do site. Corpos são limitados. Tentativas por IP têm limite no D1, além das proteções do provedor. Identificadores temporários derivados do IP expiram e não guardam o IP em texto.
- Recuperação só é enviada ao e-mail autorizado. O retorno é genérico. O token do link é retirado da barra de endereço assim que a página carrega; uma nova senha exige validação do token no provedor e confirmação idêntica.
- Páginas administrativas e de login não são cacheadas, não podem ser emolduradas por outros sites e não enviam o caminho como Referer. Não registrar corpos de requisições ou senhas na observabilidade.

O Cloudflare Access não é mais necessário para o login da aplicação. Caso tenha sido configurado como proteção adicional no domínio, ele continua sendo uma barreira externa independente; não desabilite políticas sem revisar o acesso pretendido.

Testes automatizados usam apenas dados fictícios. A entrega do e-mail, a definição da senha e o primeiro login real dependem da conexão do projeto Supabase e da ação do titular. Não foi realizada auditoria independente ou garantia de invulnerabilidade.

Referências: [senhas](https://supabase.com/docs/guides/auth/passwords), [validação do usuário no servidor](https://supabase.com/docs/reference/javascript/auth-getuser), [sessões](https://supabase.com/docs/guides/auth/sessions).
