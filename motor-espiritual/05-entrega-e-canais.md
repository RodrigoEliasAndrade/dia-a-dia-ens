# 05 — Entrega e Canais

A regra de ouro: **separar a lógica do canal**, para testar agora (web app) e virar push
depois **sem reescrever nada**.

## As três camadas a desacoplar

1. **Gatilho** — *quando/por quê* mandar algo. Lógica pura, agnóstica de canal.
   (Ex.: "faltou oração pessoal por 3 dias → dispara estado `abandono-oracao-pessoal`".)
2. **Conteúdo** — a saída do motor (a ficha escolhida).
3. **Canal de entrega** — *como* chega à pessoa. **Só isto muda** entre teste e produção.

O gatilho emite um **envelope** e um **adaptador de entrega** fino decide o canal:

```
EnvelopeDeMensagem {
  estado: string            // estado pastoral (ou "lembrete-pce", "micro-do-dia")
  ficha?: Ficha             // conteúdo já selecionado, quando aplicável
  hora_alvo: string         // ISO; quando deve aparecer
  urgencia: "ambiente" | "lembrete" | "acompanhamento"
  pce?: PCEType             // se for lembrete de PCE
}

interface CanalDeEntrega {
  enviar(env: EnvelopeDeMensagem): Promise<void>
  agendar(env: EnvelopeDeMensagem): Promise<void>   // para hora futura
  suportaAppFechado(): boolean
}
```

Trocar in-app → push = **trocar a implementação de `CanalDeEntrega`**, não a lógica do gatilho.

## Fase de teste (AGORA) — canal in-app

Suficiente para validar **todo** o motor sem infra de push:

- **Caixa de mensagens / inbox** dentro do app (vive bem na aba SABEDORIAS).
- **Card ao abrir** o app, quando há mensagem pendente para a hora alvo.
- **`Notification` API local** enquanto a aba está aberta (banner do navegador).
- O "agendamento" no teste é **verificado quando o app abre** (compara `hora_alvo` com agora).

Limitação conhecida e aceitável no teste: **não dispara com o app fechado.** Isso é exatamente
o que o push resolve na produção.

## Fase de produção — Web Push

O service worker **já existe** (o projeto usa `vite-plugin-pwa`), então a fundação está pronta.
Falta a camada de envio. Viabilidade real:

| Plataforma | Web Push funciona? |
|---|---|
| Android / Chrome / Edge / Firefox (desktop) | **Sim** |
| iPhone / iPad | **Sim, só se o PWA estiver "Adicionado à Tela de Início"** (iOS 16.4+); não na aba do Safari |

### O que o push exige (tarefa de infra, à parte)
1. **Chaves VAPID** (par público/privado).
2. **Tabela de inscrições** no Supabase (`push_subscriptions`: user_id, endpoint, keys…).
3. **Permissão do usuário** (`Notification.requestPermission()`) + `pushManager.subscribe()` no
   service worker, guardando a inscrição.
4. **Função de envio** — **Supabase Edge Function** + agendador (cron) que, na `hora_alvo`,
   computa o envelope (roda o gatilho server-side ou lê uma fila) e dispara o push para a
   inscrição.
5. Handler de `push` no service worker para exibir a notificação e abrir o PCE no clique
   (deep link para a rota correta).

> **Importante:** lembrete agendado **confiável com o app fechado** só existe via envio pelo
> servidor — timers no navegador não rodam com a aba fechada. Por isso o push de verdade é uma
> tarefa de produção com backend, não um ajuste de front.

## Recomendação

- **Construir agnóstico de canal desde já** (envelope + adaptador).
- **Testar tudo in-app** nesta fase.
- Tratar o **Web Push como uma tarefa específica de produção** (VAPID + tabela + Edge Function
  + cron + handler no SW). Quando pronta, é só plugar o novo `CanalDeEntrega` — o motor não
  muda.

## Contenção (guardrail G9)

Independente do canal: orçamento diário de notificações, horários de silêncio (nunca na Missa,
nunca de madrugada), controle de frequência pelo usuário, e **uma voz só** (não vários fluxos
concorrentes).
