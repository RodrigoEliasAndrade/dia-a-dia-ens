# ENS Dia a Dia

Companheiro digital de oração para casais das Equipes de Nossa Senhora (ENS).
O app ajuda o casal a viver, acompanhar e revisitar os 5 Pontos Concretos de
Esforço no ritmo da vida real: oração pessoal, oração conjugal, dever de
sentar-se, regra de vida e retiro anual.

## O que o app entrega

- Onboarding com autenticação por e-mail/senha e Google OAuth via Supabase.
- Pareamento de cônjuges por confirmação mútua de e-mail.
- Painel inicial com calendário e status dos PCEs.
- Fluxos guiados para oração pessoal, oração conjugal, dever de sentar-se,
  regra de vida e retiro anual.
- Diário de oração pessoal com busca, edição e notas.
- Sincronização offline-first: localStorage imediato + Supabase + realtime.
- PWA instalável, com service worker e deploy em GitHub Pages.
- Aba Sabedorias com uma fatia experimental do Motor Espiritual.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- React Router 7
- Supabase Auth, Postgres, RLS e Realtime
- vite-plugin-pwa / Workbox

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm
- Projeto Supabase configurado

## Desenvolvimento

Instale dependências:

```bash
npm ci
```

Configure `.env` local:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

Rode o app:

```bash
npm run dev
```

Valide antes de publicar:

```bash
npm run lint
npm run build
npm audit --audit-level=moderate
```

## Supabase

O schema de produção é versionado em `supabase/migrations/`. Para validar um
banco local limpo e aplicar migrations pendentes:

```bash
npx supabase db reset --local
npx supabase db push --dry-run
npx supabase db push
```

Depois da aplicação, rode `supabase-security-verify.sql` no SQL Editor. Todas as
linhas devem retornar `status = 'ok'`.

Os arquivos `supabase-*.sql` da raiz são históricos de instalações anteriores.
Eles não são mais a fonte oficial do schema e não devem ser aplicados depois da
migration-base atual.

No painel Supabase, habilite confirmação de e-mail em Authentication > Providers
> Email. Sem isso, usuários podem criar contas com e-mails não verificados, o que
enfraquece o pareamento do casal.

Para login com Google:

- No Supabase, configure Authentication > URL Configuration com Site URL:
  `https://rodrigoeliasandrade.github.io/dia-a-dia-ens/`
- Adicione também o redirect local se for testar em desenvolvimento:
  `http://localhost:5173/dia-a-dia-ens/`
- No Google Cloud, crie um OAuth Client do tipo Web application.
- Em Authorized JavaScript origins, use:
  `https://rodrigoeliasandrade.github.io`
- Em Authorized redirect URIs, use:
  `https://lfnvoiemdkpiwxwxhihr.supabase.co/auth/v1/callback`
- No Supabase, habilite Authentication > Sign In / Providers > Google e cole o
  Client ID e Client Secret gerados pelo Google.

## Sincronização de dados

O app separa dados pessoais e dados do casal:

- `user_data`: oração pessoal, diário e regra de vida.
- `couple_data`: oração conjugal, dever de sentar-se e retiro anual.

O hook `useSyncedStorage` lê localmente primeiro, puxa do Supabase ao entrar,
faz upsert com debounce e escuta realtime para atualizações de outro dispositivo
ou do cônjuge.

## Motor Espiritual

A pasta `motor-espiritual/` documenta a visão e a arquitetura do Motor Espiritual:
um seletor de conteúdo pastoral curado, nunca gerado livremente.

No app, a aba Sabedorias já contém uma fatia vertical de teste em `src/motor/`.
Em desenvolvimento, ela pode mostrar fichas em rascunho para validação. Em
produção, rascunhos não são exibidos; fichas precisam estar com
`status: "aprovado"` após revisão doutrinal.

## Deploy

O deploy é feito por GitHub Actions em `.github/workflows/deploy.yml`, publicando
o build em GitHub Pages com base `/dia-a-dia-ens/`.

Configure estes repository secrets no GitHub:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Segurança

- `.env` está no `.gitignore` e não deve ser commitado.
- A anon key do Supabase é pública no browser, mas deve ficar em secrets no CI
  para facilitar rotação e evitar exposição desnecessária.
- Rode `npm audit --audit-level=moderate` periodicamente.
- Veja `SECURITY-ACTIONS-REQUIRED.md` para ações externas já identificadas.
