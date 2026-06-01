# 07 — Primeiro Teste (fatia vertical mínima)

> **Objetivo:** provar que o motor funciona de ponta a ponta, com o **menor** código possível.
> NÃO inclui push, lembretes, cadência, liturgia nem aprendizado persistente. Só o núcleo:
> carregar fichas → filtrar → pontuar → mostrar → feedback → variar.

## Onde testar

Na **aba SABEDORIAS** (ignição manual do motor). É o menor caminho — não depende de
notificações nem de detecção de ausência.

## O que o Claude desktop precisa construir

1. **Carregar o conteúdo** — importar `motor-espiritual/conteudo/fichas/abandono-oracao-pessoal.json`
   e `estados-pastorais.json` para a camada de dados do app (pode ser import estático no MVP).
2. **O seletor** (núcleo) conforme [`01-arquitetura-motor.md`](01-arquitetura-motor.md):
   - pré-filtro de guardrails (estado, disposição→tom, degrau alvo) — ver [`03-guardrails.md`](03-guardrails.md);
   - função de pontuação (pesos `3/2/2/1/4`);
   - escolha da maior nota; desempate pela menos recente.
3. **Perfil em memória** (sem persistência ainda) — começar neutro (registro=cotidiano,
   leve viés Evangelho, maturidade=iniciante). Pode expor uns botões de "simulação de perfil"
   na tela de teste para variar registro/fonte e ver a escolha mudar.
4. **A tela de teste (SABEDORIAS mínima):**
   - botão do estado-piloto: **"Deixei de rezar sozinho"**;
   - ao tocar → roda o motor → mostra a ficha escolhida (`texto` + `referencia` + `proximo_passo`);
   - pergunta **"isto te ajudou?"** → **Sim** / **Não**;
   - **Não** → **"quer outra abordagem?"** → mostra a próxima melhor ficha (variação, sem repetir);
   - opcional: simular `disposicao` (consolação/desolação) e `repeticao` (1ª, 2ª, 4ª, 6ª vez)
     para ver a **escada de degrau** funcionando (degrau 1→4) e o filtro de desolação barrar
     `exortar`.

## Decisão necessária: conteúdo em rascunho

As 10 fichas estão como `status: "rascunho"` (guardrail G1 — não devem aparecer em produção).
Para este teste, **escolha uma**:

- **(Recomendado)** Um flag `MODO_TESTE` (só em dev) que **ignora o filtro de status**, para
  testar sem precisar da revisão doutrinal agora.
- Ou aprovar manualmente as fichas (mudar para `"aprovado"`) — mas isso exige a revisão
  doutrinal antes, e a ideia é descansar essa parte por enquanto.

## Critérios de sucesso do teste

- [ ] Tocar no estado mostra uma ficha **coerente** (no 1º contato, deve cair no **degrau 1 /
      tom consolar** — ex.: "Vinde a mim" Mt 11,28).
- [ ] Mudar o perfil simulado (registro coração ↔ reflexivo / fonte Evangelho ↔ Catecismo)
      **muda** a ficha escolhida, como no exemplo numérico de `01-arquitetura-motor.md`.
- [ ] "Quer outra abordagem?" traz uma ficha **diferente** (não repete a anterior).
- [ ] Simular `desolacao` **nunca** traz ficha de tom `exortar`.
- [ ] Simular repetição crescente **sobe o degrau** (consolar → instruir → passo → reconduzir
      ao humano), terminando na ficha que reconduz à equipe/conselheiro/Confissão.

## O que este teste **valida**

Carregamento das fichas, o schema, o pré-filtro de guardrails, a pontuação, a variação
(não-repetição) e a escada de degrau — ou seja, **o coração do motor**.

## O que fica para depois (fora deste teste)

Push/notificações, lembretes por PCE e cadência, integração litúrgica, micro-mensagens
ambientes, persistência do aprendizado no Supabase, e a revisão doutrinal das fichas
(`rascunho` → `aprovado`).
