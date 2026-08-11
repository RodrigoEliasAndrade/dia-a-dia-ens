# Ações de segurança

Este arquivo separa o que já foi corrigido no repositório do que ainda depende
de acesso a contas externas.

## Concluído no repositório

- O `origin` local não contém mais Personal Access Token.
- `.env`, `dist`, `node_modules` e `.DS_Store` estão ignorados e não estão rastreados.
- `.github/workflows/deploy.yml` usa GitHub Secrets para as variáveis do Supabase.
- Os GitHub Secrets `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` foram criados.
- O workflow roda lint, audit de dependências e build antes do deploy.
- As permissões do GitHub Actions foram limitadas por job.
- O schema de produção foi consolidado em `supabase/migrations/` e registrado no
  histórico remoto do Supabase.
- `supabase-security-verify.sql` retornou `ok` em todas as 31 verificações de
  RLS, privilégios, funções, índices e realtime.
- O Data API não permite acesso anônimo às tabelas privadas.
- Usuários não podem alterar `profiles.couple_id` diretamente; o campo é
  controlado pelo pareamento mútuo.
- A confirmação de e-mail no Supabase está ativada.
- O app exige senha com mínimo de 8 caracteres no frontend.
- O app tem botão e fluxo de login com Google OAuth.
- O provider Google OAuth foi configurado no Supabase.
- O Google OAuth Client Secret exposto durante a configuração foi rotacionado.

## Ações externas pendentes

Estas ações requerem acesso ao GitHub/Supabase e não podem ser concluídas só por
código local.

### 1. Confirmar revogação do GitHub PAT exposto

O remoto local já foi limpo, mas se um Personal Access Token apareceu em algum
ponto no histórico local ou em logs, ele deve permanecer revogado.

1. Acesse https://github.com/settings/tokens
2. Confirme que o token antigo foi excluído/revogado.
3. Prefira autenticação via SSH ou `gh auth login`.

Comando seguro para manter o remoto sem token:

   ```bash
   git remote set-url origin https://github.com/RodrigoEliasAndrade/dia-a-dia-ens.git
   ```

### 2. Publicar ou limitar Google OAuth

O Google Auth Platform indicou que o OAuth está restrito a test users. Para uso
real, publique o app no Google Auth Platform ou adicione explicitamente os
e-mails que poderão testar.

### 3. Proteção contra senhas vazadas

O Security Advisor informa que a proteção via HaveIBeenPwned está desativada.
Esse recurso exige o plano Supabase Pro. O frontend e o ambiente local já exigem
no mínimo 8 caracteres; ao migrar para o plano Pro, ative também a proteção
contra senhas vazadas no Auth.
