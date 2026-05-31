# Ações de segurança que VOCÊ precisa fazer

Estas ações requerem acesso a contas externas e não podem ser feitas pelo código.

## 1. 🔴 URGENTE — Revogar GitHub PAT exposto

O git remote contém um Personal Access Token hardcoded. Qualquer um com acesso ao repositório local (ou ao histórico) pode usá-lo.

**Token comprometido:** `ghp_Krkaw…` (redacted — já revogado em 2026-05-31)

**Passos:**

1. Acesse https://github.com/settings/tokens
2. Localize o token e clique em **Delete** (ou **Revoke**)
3. Gere um novo token (ou prefira SSH)
4. No terminal, dentro do projeto, rode:
   ```bash
   git remote set-url origin https://github.com/RodrigoEliasAndrade/dia-a-dia-ens.git
   ```
5. Configure autenticação via SSH ou `gh auth login`

## 2. 🔴 Mover credenciais do CI para GitHub Secrets

Atualmente `.github/workflows/deploy.yml` tem a URL e a anon key do Supabase hardcoded no YAML.

**Passos:**

1. Acesse https://github.com/RodrigoEliasAndrade/dia-a-dia-ens/settings/secrets/actions
2. Clique em **New repository secret** e crie:
   - Nome: `VITE_SUPABASE_URL`, Valor: `https://lfnvoiemdkpiwxwxhihr.supabase.co`
   - Nome: `VITE_SUPABASE_ANON_KEY`, Valor: a anon key (mesma que já estava no workflow)
3. O workflow já foi atualizado para usar `${{ secrets.* }}` — o próximo push usará os secrets

> ⚠️ A anon key é tecnicamente pública (vai pro browser), mas usar Secrets evita exposição em logs e simplifica rotação.

## 3. 🔴 Habilitar confirmação de email no Supabase

Sem isso, qualquer um pode criar conta com email falso (e ser pareado automaticamente com outra pessoa).

**Passos:**

1. Acesse https://supabase.com/dashboard/project/lfnvoiemdkpiwxwxhihr/auth/providers
2. Clique em **Email**
3. Marque **Enable email confirmations**
4. Salve

## 4. ⚠️ Rodar a migration de segurança

Há um novo arquivo `supabase-security-hardening.sql` na raiz do projeto que:
- Restringe a policy de SELECT na tabela `couples` (estava aberta)
- Bloqueia INSERT direto em `couples` (só via triggers SECURITY DEFINER)
- Exige confirmação **mútua** de pareamento (ambos cônjuges declaram um ao outro)
- Cria tabela `user_data` para sincronizar dados pessoais de oração entre dispositivos
- Bloqueia DELETE direto em todas as tabelas

**Passos:**

1. Acesse https://supabase.com/dashboard/project/lfnvoiemdkpiwxwxhihr/sql/new
2. Cole o conteúdo de `supabase-security-hardening.sql`
3. Clique em **Run**

## 5. ⚠️ Verificar políticas de senha

No Supabase Dashboard → Authentication → Policies, ajuste o mínimo de senha para 8 caracteres se desejar maior segurança.
